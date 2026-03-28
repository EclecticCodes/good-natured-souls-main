import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encrypt';

const MAX_NAME_CHANGES = 3;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await sql`SELECT * FROM customers WHERE email = ${session.user.email}`;
    if (!result[0]) return NextResponse.json({ customer: null });

    const c = result[0];
    return NextResponse.json({
      customer: {
        ...c,
        phone: c.phone ? decrypt(c.phone) : '',
        birthday: c.birthday ? decrypt(c.birthday) : '',
        name_changes: c.name_changes || 0,
        birthday_set: c.birthday_set || false,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { first_name, middle_name, last_name, phone, birthday, genres, favorite_artists } = await req.json();

    const existing = await sql`SELECT * FROM customers WHERE email = ${session.user.email}`;
    const current = existing[0];

    const nameChanges: number = current?.name_changes || 0;
    const nameChanged: boolean = !!(
      (first_name && first_name !== current?.first_name) ||
      (last_name && last_name !== current?.last_name)
    );

    if (nameChanged && nameChanges >= MAX_NAME_CHANGES) {
      return NextResponse.json({ error: `Name can only be changed ${MAX_NAME_CHANGES} times.` }, { status: 403 });
    }

    const birthdaySet: boolean = current?.birthday_set || false;
    const encryptedPhone: string | null = phone ? encrypt(phone) : null;
    const encryptedBirthday: string | null = birthday && !birthdaySet ? encrypt(birthday) : null;
    const newBirthdaySet: boolean = birthdaySet || !!encryptedBirthday;
    const newNameChanges: number = nameChanged ? nameChanges + 1 : nameChanges;

    const fn: string | null = nameChanged ? (first_name || current?.first_name || null) : (current?.first_name || null);
    const mn: string | null = middle_name !== undefined ? (middle_name || null) : (current?.middle_name || null);
    const ln: string | null = nameChanged ? (last_name || current?.last_name || null) : (current?.last_name || null);
    const full_name: string = [fn, mn, ln].filter(Boolean).join(' ');

    const g: string[] = genres || current?.genres || [];
    const fa: string[] = favorite_artists || current?.favorite_artists || [];

    if (!current) {
      // New customer insert
      await sql`
        INSERT INTO customers (email, first_name, middle_name, last_name, name, phone, birthday, birthday_set, genres, favorite_artists, name_changes)
        VALUES (${session.user.email}, ${fn}, ${mn}, ${ln}, ${full_name}, ${encryptedPhone}, ${encryptedBirthday}, ${newBirthdaySet}, ${g}, ${fa}, ${newNameChanges})
      `;
    } else {
      // Update existing
      await sql`
        UPDATE customers SET
          first_name = ${fn},
          middle_name = ${mn},
          last_name = ${ln},
          name = ${full_name},
          name_changes = ${newNameChanges},
          phone = COALESCE(${encryptedPhone}, phone),
          birthday = CASE WHEN birthday_set = false AND ${encryptedBirthday} IS NOT NULL THEN ${encryptedBirthday} ELSE birthday END,
          birthday_set = ${newBirthdaySet},
          genres = ${g},
          favorite_artists = ${fa},
          updated_at = NOW()
        WHERE email = ${session.user.email}
      `;
    }

    return NextResponse.json({
      success: true,
      name_changes_remaining: MAX_NAME_CHANGES - newNameChanges,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
