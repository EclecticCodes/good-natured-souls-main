import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ notifications: [] });
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE customer_email = ${session.user.email}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, readAll } = await req.json();
    if (readAll) {
      await sql`UPDATE notifications SET read = true WHERE customer_email = ${session.user.email}`;
    } else if (id) {
      await sql`UPDATE notifications SET read = true WHERE id = ${id} AND customer_email = ${session.user.email}`;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
