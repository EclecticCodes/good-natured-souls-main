import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

async function fetchStrapPriceMap(): Promise<Map<string, number>> {
  const token = process.env.STRAPI_API_TOKEN;
  const res = await fetch(
    `${STRAPI_URL}/api/products?fields=id,price,status&filters[status][$ne]=archived&pagination[limit]=200`,
    {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (!res.ok) throw new Error("Failed to fetch products from Strapi");
  const json = await res.json();
  const map = new Map<string, number>();
  for (const item of json.data || []) {
    map.set(String(item.id), Number(item.attributes.price));
  }
  return map;
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerName, customerEmail } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Fetch authoritative prices from Strapi
    const priceMap = await fetchStrapPriceMap();

    // Validate every item against Strapi prices
    let amount = 0;
    const validatedItems: { id: string; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const strapiPrice = priceMap.get(String(item.id));
      if (strapiPrice === undefined) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity)));
      amount += Math.round(strapiPrice * 100) * qty;
      validatedItems.push({ id: item.id, name: item.name, price: strapiPrice, quantity: qty });
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
