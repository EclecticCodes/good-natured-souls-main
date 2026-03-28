import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255)`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name_changes INTEGER DEFAULT 0`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday_set BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)`;
    // Change birthday from DATE to VARCHAR to support encryption
    await sql`ALTER TABLE customers ALTER COLUMN birthday TYPE VARCHAR(500)`;
    return NextResponse.json({ success: true, message: 'Migration complete' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
