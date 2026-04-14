import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import crypto from "crypto";

const sql = neon(process.env.POSTGRES_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);
const EXPIRY_MINUTES = 30;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  // Always return same response to prevent email enumeration
  const genericResponse = NextResponse.json({ success: true });

  if (!email?.includes("@")) return genericResponse;

  try {
    const customers = await sql`SELECT id FROM customers WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
    if (!customers[0]) return genericResponse;

    // Invalidate prior active tokens for this email
    await sql`
      UPDATE password_reset_tokens
      SET used_at = now()
      WHERE email = ${email.toLowerCase().trim()}
        AND used_at IS NULL
        AND expires_at > now()
    `;

    // Generate raw token — send in email, store hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await sql`
      INSERT INTO password_reset_tokens (email, token_hash, expires_at, requested_ip, user_agent)
      VALUES (${email.toLowerCase().trim()}, ${tokenHash}, ${expiresAt.toISOString()}, ${ip}, ${ua})
    `;

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${rawToken}`;

    await resend.emails.send({
      from: "Good Natured Souls <no-reply@goodnaturedsouls.com>",
      to: email,
      subject: "Reset your GNS password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;font-size:14px;font-weight:700;text-transform:uppercase;">Good Natured Souls</h1>
          <h2 style="font-size:22px;font-weight:700;margin:24px 0 12px;">Reset your password</h2>
          <p style="color:#aaa;font-size:14px;line-height:1.6;margin-bottom:24px;">
            We received a request to reset the password for your GNS account.
            This link expires in ${EXPIRY_MINUTES} minutes.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#F0B51E;color:#000;font-weight:700;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
            Reset Password
          </a>
          <p style="color:#555;font-size:12px;margin-top:32px;">
            If you didn't request this, you can safely ignore this email.
            Your password won't change until you click the link above.
          </p>
          <p style="color:#333;font-size:11px;margin-top:16px;">Exist Altruistic — Good Natured Souls</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[ForgotPassword] Error:", err);
  }

  return genericResponse;
}
