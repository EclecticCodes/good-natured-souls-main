import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ orders: [] });

    const orders = await sql`
      SELECT * FROM orders
      WHERE customer_email = ${session.user.email}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const formatted = orders.map(o => ({
      id: o.id,
      stripeId: o.stripe_payment_intent_id,
      amount: o.amount_total / 100,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]'),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error: any) {
    return NextResponse.json({ orders: [] });
  }
}
