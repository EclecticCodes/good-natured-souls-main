import { NextResponse } from 'next/server';
import { initCustomerSchema, initNotificationsSchema } from '@/lib/db';

export async function GET() {
  try {
    await initCustomerSchema();
    await initNotificationsSchema();
    return NextResponse.json({ success: true, message: 'Customer schema initialized' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
