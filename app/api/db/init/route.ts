import { NextResponse } from 'next/server';
import { initCustomerSchema } from '@/lib/db';

export async function GET() {
  try {
    await initCustomerSchema();
    return NextResponse.json({ success: true, message: 'Customer schema initialized' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
