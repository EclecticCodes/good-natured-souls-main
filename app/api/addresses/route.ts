import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ addresses: [] });

    const addresses = await sql`
      SELECT * FROM customer_addresses
      WHERE customer_email = ${session.user.email}
      ORDER BY is_default DESC, created_at DESC
    `;
    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { label, name, line1, line2, city, state, zip, country, is_default } = await req.json();

    if (is_default) {
      await sql`
        UPDATE customer_addresses SET is_default = false
        WHERE customer_email = ${session.user.email}
      `;
    }

    const result = await sql`
      INSERT INTO customer_addresses (customer_email, label, name, line1, line2, city, state, zip, country, is_default)
      VALUES (${session.user.email}, ${label || 'Home'}, ${name}, ${line1}, ${line2 || null}, ${city}, ${state}, ${zip}, ${country || 'US'}, ${is_default || false})
      RETURNING *
    `;
    return NextResponse.json({ address: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    await sql`
      DELETE FROM customer_addresses
      WHERE id = ${id} AND customer_email = ${session.user.email}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
