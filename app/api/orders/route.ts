import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ orders: [] });
    const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
    if (customers.data.length === 0) return NextResponse.json({ orders: [] });
    const customerId = customers.data[0].id;
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 10,
    });
    const orders = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      status: pi.status,
      date: new Date(pi.created * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      items: pi.metadata?.items ? JSON.parse(pi.metadata.items) : [],
    }));
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ orders: [] });
  }
}
