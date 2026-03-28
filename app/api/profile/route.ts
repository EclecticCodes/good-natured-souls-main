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

    // Name change enforcement
    const nameChanges = current?.name_changes || 0;
    const nameChanged = (first_name && first_name !== current?.first_name) || (last_name && last_name !== current?.last_name);
    if (nameChanged && nameChanges >= MAX_NAME_CHANGES) {
      return NextResponse.json({ error: `Name can only be changed ${MAX_NAME_CHANGES} times.` }, { status: 403 });
    }

    // Birthday enforcement — once set cannot change
    const birthdaySet = current?.birthday_set || false;
    const encryptedPhone = phone ? encrypt(phone) : null;
    const encryptedBirthday = birthday && !birthdaySet ? encrypt(birthday) : null;

    const full_name = [first_name || current?.first_name, middle_name !== undefined ? middle_name : current?.middle_name, last_name || current?.last_name].filter(Boolean).join(' ');

    await sql`
      INSERT INTO customers (email, first_name, middle_name, last_name, name, phone, birthday, birthday_set, genres, favorite_artists, name_changes)
      VALUES (
        ${session.user.email},
        ${first_name || null},
        ${middle_name || null},
        ${last_name || null},
        ${full_name},
        ${encryptedPhone},
        ${encryptedBirthday},
        ${!!encryptedBirthday},
        ${genres || []},
        ${favorite_artists || []},
        0
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = CASE WHEN ${nameChanged} AND customers.name_changes < ${MAX_NAME_CHANGES}
                         THEN COALESCE(${first_name || null}, customers.first_name)
                         ELSE customers.first_name END,
        middle_name = COALESCE(${middle_name !== undefined ? middle_name || null : null}, customers.middle_name),
        last_name = CASE WHEN ${nameChanged} AND customers.name_changes < ${MAX_NAME_CHANGES}
                        THEN COALESCE(${last_name || null}, customers.last_name)
                        ELSE customers.last_name END,
        name = CASE WHEN ${nameChanged} AND customers.name_changes < ${MAX_NAME_CHANGES}
                    THEN ${full_name} ELSE customers.name END,
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
