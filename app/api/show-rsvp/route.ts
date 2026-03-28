import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Sign in to RSVP' }, { status: 401 });
    const { show_id, show_title, type } = await req.json();
    if (!show_id) return NextResponse.json({ error: 'Missing show_id' }, { status: 400 });

    await sql`
      INSERT INTO show_rsvps (customer_email, show_id, show_title, type)
      VALUES (${session.user.email}, ${show_id}, ${show_title || ''}, ${type || 'notify'})
      ON CONFLICT (customer_email, show_id, type) DO NOTHING
    `;

    // Create a notification for the user
    await sql`
      INSERT INTO notifications (customer_email, type, title, message, link, link_label)
      VALUES (
        ${session.user.email},
        'show',
        ${type === 'presale' ? 'Presale Request Received' : type === 'rsvp' ? 'RSVP Confirmed' : 'Show Notification Set'},
        ${type === 'presale' ? `You're on the presale list for ${show_title}. We'll email you when presale opens.` :
          type === 'rsvp' ? `You're RSVPed for ${show_title}. See you there!` :
          `We'll notify you when tickets go on sale for ${show_title}.`},
        ${`/shows/${show_id}`},
        'View Show'
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ rsvps: [] });
    const { searchParams } = new URL(req.url);
    const show_id = searchParams.get('show_id');
    if (show_id) {
      const rsvps = await sql`
        SELECT type FROM show_rsvps
        WHERE customer_email = ${session.user.email} AND show_id = ${show_id}
      `;
      return NextResponse.json({ rsvps });
    }
    const rsvps = await sql`
      SELECT * FROM show_rsvps WHERE customer_email = ${session.user.email} ORDER BY created_at DESC
    `;
    return NextResponse.json({ rsvps });
  } catch (error: any) {
    return NextResponse.json({ rsvps: [] });
  }
}
