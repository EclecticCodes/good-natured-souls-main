import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS theme_artist VARCHAR(255)`;
    return NextResponse.json({ success: true, message: 'Migration complete' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
