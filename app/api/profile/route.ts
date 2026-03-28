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

    const { name, phone, birthday, genres, favorite_artists } = await req.json();

    // Get current customer state
    const existing = await sql`SELECT * FROM customers WHERE email = ${session.user.email}`;
    const current = existing[0];

    // Enforce name change limit
    const nameChanges = current?.name_changes || 0;
    const nameChanged = name && name !== current?.name;
    if (nameChanged && nameChanges >= MAX_NAME_CHANGES) {
      return NextResponse.json({ error: `Name can only be changed ${MAX_NAME_CHANGES} times.` }, { status: 403 });
    }

    // Enforce birthday — once set, cannot be changed
    const birthdaySet = current?.birthday_set || false;
    const birthdayChanged = birthday && !birthdaySet;

    const encryptedPhone = phone ? encrypt(phone) : null;
    const encryptedBirthday = birthday ? encrypt(birthday) : null;

    await sql`
      INSERT INTO customers (email, name, phone, birthday, genres, favorite_artists, name_changes, birthday_set)
      VALUES (
        ${session.user.email},
        ${name},
        ${encryptedPhone},
        ${encryptedBirthday},
        ${genres || []},
        ${favorite_artists || []},
        ${nameChanged ? 1 : 0},
        ${birthdayChanged ? true : false}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = CASE WHEN ${nameChanged} AND customers.name_changes < ${MAX_NAME_CHANGES}
                    THEN ${name} ELSE customers.name END,
        name_changes = CASE WHEN ${nameChanged} AND customers.name_changes < ${MAX_NAME_CHANGES}
                            THEN customers.name_changes + 1 ELSE customers.name_changes END,
        phone = COALESCE(${encryptedPhone}, customers.phone),
        birthday = CASE WHEN customers.birthday_set = false AND ${encryptedBirthday} IS NOT NULL
                        THEN ${encryptedBirthday} ELSE customers.birthday END,
        birthday_set = CASE WHEN customers.birthday_set = false AND ${encryptedBirthday} IS NOT NULL
                            THEN true ELSE customers.birthday_set END,
        genres = COALESCE(${genres || null}, customers.genres),
        favorite_artists = COALESCE(${favorite_artists || null}, customers.favorite_artists),
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      name_changes_remaining: MAX_NAME_CHANGES - (nameChanged ? nameChanges + 1 : nameChanges),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
