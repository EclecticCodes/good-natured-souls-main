import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Good Natured Souls <info@goodnaturedsouls.com>";

function orderEmailHtml(name: string, total: string, items: { name: string; quantity: number }[]): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111111;max-width:560px;width:100%;">
  <tr>
    <td style="background:#F0B51E;padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:11px;font-weight:700;letter-spacing:4px;color:#000000;">GOOD NATURED SOULS</td>
        <td align="right" style="font-size:9px;letter-spacing:3px;color:#00000077;">EXIST ALTRUISTIC</td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="padding:36px 32px 28px;">
    <p style="font-size:9px;letter-spacing:4px;color:#F0B51E;margin:0 0 10px;text-transform:uppercase;">Order Confirmed</p>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 8px;">Thank you, ${name}.</h1>
    <p style="font-size:14px;color:#666666;margin:0 0 28px;line-height:1.7;">Your order has been confirmed. You will receive download links or shipping details shortly.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222222;border-left:3px solid #F0B51E;margin-bottom:32px;">
      <tr><td style="padding:18px 20px;">
        ${items.map(item => `<p style="font-size:13px;color:#aaaaaa;margin:4px 0;">${item.name} <span style="color:#555;">x${item.quantity}</span></p>`).join("")}
        <p style="font-size:15px;font-weight:700;color:#F0B51E;margin:12px 0 0;border-top:1px solid #1e1e1e;padding-top:12px;">Total: $${total}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="https://goodnaturedsouls.com/profile" style="display:inline-block;background:#F0B51E;color:#000000;padding:14px 40px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:3px;">VIEW YOUR ORDER</a>
    </td></tr></table>
  </td></tr>
  <tr>
    <td style="border-top:1px solid #1a1a1a;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:10px;color:#444444;">Good Natured Souls &middot; The Bronx, NYC</td>
        <td align="right" style="font-size:10px;color:#444444;">goodnaturedsouls.com</td>
      </tr></table>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

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
    const items: { name: string; price: number; quantity: number }[] = JSON.parse(
      intent.metadata?.items || "[]"
    );
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

      // Wire to cooperative ledger — idempotency_key = event.id prevents duplicate entries on webhook retry
      const description = items.length > 0
        ? 'Store order — ' + items.map((i: any) => i.name).join(', ')
        : 'Store order';
      await sql`
        INSERT INTO revenue_entries (
          source_type,
          amount,
          currency,
          description,
          reference_id,
          idempotency_key
        )
        VALUES (
          'stripe_order',
          ${amountTotal / 100},
          ${intent.currency},
          ${description},
          ${intent.id},
          ${event.id}
        )
        ON CONFLICT (idempotency_key) DO NOTHING
      `;
    } catch (err) {
      console.error("Failed to save order to Neon:", err);
    }

    // Send confirmation email directly via Resend
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [customerEmail],
          subject: "Order Confirmed — Good Natured Souls",
          html: orderEmailHtml(
            customerName,
            (amountTotal / 100).toFixed(2),
            items
          ),
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
