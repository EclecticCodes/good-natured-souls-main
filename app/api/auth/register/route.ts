import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { encrypt } from "@/lib/encrypt";

const sql = neon(process.env.POSTGRES_URL!);

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, middle_name, last_name, birthday, theme_artist } = await req.json();

    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (!first_name?.trim()) return NextResponse.json({ error: "First name is required" }, { status: 400 });
    if (!last_name?.trim()) return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await sql`SELECT id FROM customers WHERE email = ${email}`;
    if (existing.length > 0) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 12);
    const fn = first_name.trim();
    const mn = middle_name?.trim() || '';
    const ln = last_name.trim();
    const full_name = [fn, mn, ln].filter(Boolean).join(' ');
    const encryptedBirthday = birthday ? encrypt(birthday) : '';
    const ta = theme_artist || '';

    if (encryptedBirthday) {
      await sql`
        INSERT INTO customers (email, first_name, middle_name, last_name, name, password_hash, birthday, birthday_set, theme_artist)
        VALUES (${email}, ${fn}, ${mn}, ${ln}, ${full_name}, ${password_hash}, ${encryptedBirthday}, true, ${ta})
      `;
    } else {
      await sql`
        INSERT INTO customers (email, first_name, middle_name, last_name, name, password_hash, birthday_set, theme_artist)
        VALUES (${email}, ${fn}, ${mn}, ${ln}, ${full_name}, ${password_hash}, false, ${ta})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
