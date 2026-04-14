import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sql = neon(process.env.POSTGRES_URL!);

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  const rows = await sql`
    SELECT id, email, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `;

  const resetToken = rows[0];

  if (!resetToken) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }
  if (resetToken.used_at) {
    return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
  }
  if (new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  // Update password and mark token used atomically
  await sql`UPDATE customers SET password_hash = ${password_hash}, updated_at = now() WHERE email = ${resetToken.email}`;
  await sql`UPDATE password_reset_tokens SET used_at = now() WHERE id = ${resetToken.id}`;

  return NextResponse.json({ success: true });
}
