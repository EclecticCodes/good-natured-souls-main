import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`TRUNCATE customer_wishlist, customer_addresses, customers, orders RESTART IDENTITY CASCADE`;
    return NextResponse.json({ success: true, message: 'Test data cleared' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
