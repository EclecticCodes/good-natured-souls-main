import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    const customerName = intent.metadata?.customerName || "Customer";
    const customerEmail = intent.metadata?.customerEmail || "";
    const items = JSON.parse(intent.metadata?.items || "[]");
    const amountTotal = intent.amount;

    // Save order to Neon
    try {
      const sql = neon(process.env.POSTGRES_URL!);
      await sql`
        INSERT INTO orders (stripe_payment_intent_id, customer_name, customer_email, items, amount_total, currency, status)
        VALUES (
          ${intent.id},
          ${customerName},
          ${customerEmail},
          ${JSON.stringify(items)},
          ${amountTotal},
          ${intent.currency},
          'paid'
        )
        ON CONFLICT (stripe_payment_intent_id) DO NOTHING
      `;
    } catch (err) {
      console.error("Failed to save order to Neon:", err);
    }

    // Send confirmation email via existing /api/email route
    if (customerEmail) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "order",
            data: {
              name: customerName,
              email: customerEmail,
              total: (amountTotal / 100).toFixed(2),
              items,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to send confirmation email:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
