import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ items: [] });

    const items = await sql`
      SELECT * FROM customer_wishlist
      WHERE customer_email = ${session.user.email}
      ORDER BY added_at DESC
    `;
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, productName, productType, productPrice } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    await sql`
      INSERT INTO customer_wishlist (customer_email, product_id, product_name, product_type, product_price)
      VALUES (${session.user.email}, ${productId}, ${productName}, ${productType}, ${productPrice})
      ON CONFLICT (customer_email, product_id) DO NOTHING
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    await sql`
      DELETE FROM customer_wishlist
      WHERE customer_email = ${session.user.email} AND product_id = ${productId}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
