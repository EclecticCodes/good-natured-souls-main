import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

function strapiHeaders() {
  const token = process.env.STRAPI_API_TOKEN;
  return { cache: "no-store" as const, headers: token ? { Authorization: `Bearer ${token}` } : {} };
}

// Fetch authoritative price for a PRODUCT from Strapi products collection
async function fetchProductPrice(id: string): Promise<number | null> {
  const res = await fetch(
    `${STRAPI_URL}/api/products/${id}?fields=price,status`,
    strapiHeaders()
  );
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json?.data?.attributes;
  if (!attrs || attrs.status === "archived") return null;
  return Number(attrs.price);
}

// Fetch authoritative price for a SHOW TICKET from Strapi shows collection
async function fetchShowPrice(id: string): Promise<number | null> {
  const res = await fetch(
    `${STRAPI_URL}/api/shows/${id}?fields=price,soldOut,status,showOwner,ticketPlatform`,
    strapiHeaders()
  );
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json?.data?.attributes;
  if (!attrs) return null;
  // Block if sold out, not approved, or not a GNS/stripe ticket
  if (attrs.soldOut) return null;
  if (attrs.status && attrs.status !== "approved") return null;
  if (attrs.showOwner !== "gns" || attrs.ticketPlatform !== "stripe") return null;
  if (!attrs.price || attrs.price <= 0) return null;
  return Number(attrs.price);
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerName, customerEmail } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    let amount = 0;
    const validatedItems: { id: string; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity)));
      const rawId = String(item.id);

      let price: number | null = null;

      if (rawId.startsWith("strapi-")) {
        // Show ticket — id format is strapi-{strapiId}
        const strapiId = rawId.replace("strapi-", "");
        price = await fetchShowPrice(strapiId);
        if (price === null) {
          return NextResponse.json(
            { error: `Ticket not available: ${item.name || rawId}` },
            { status: 400 }
          );
        }
      } else {
        // Store product — id is numeric Strapi product id
        price = await fetchProductPrice(rawId);
        if (price === null) {
          return NextResponse.json(
            { error: `Product not found: ${item.name || rawId}` },
            { status: 400 }
          );
        }
      }

      amount += Math.round(price * 100) * qty;
      validatedItems.push({ id: rawId, name: item.name, price, quantity: qty });
    }

    if (amount < 50) {
      return NextResponse.json({ error: "Order total too low" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(validatedItems),
        customerName: customerName || "",
        customerEmail: customerEmail || "",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Checkout error:", error.message);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
