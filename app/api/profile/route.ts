import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await sql`
      SELECT * FROM customers WHERE email = ${session.user.email}
    `;
    return NextResponse.json({ customer: result[0] || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, phone, birthday, genres, favorite_artists } = await req.json();

    await sql`
      INSERT INTO customers (email, name, phone, birthday, genres, favorite_artists)
      VALUES (${session.user.email}, ${name}, ${phone}, ${birthday || null}, ${genres || []}, ${favorite_artists || []})
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(${name}, customers.name),
        phone = COALESCE(${phone}, customers.phone),
        birthday = COALESCE(${birthday || null}, customers.birthday),
        genres = COALESCE(${genres || null}, customers.genres),
        favorite_artists = COALESCE(${favorite_artists || null}, customers.favorite_artists),
        updated_at = NOW()
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
