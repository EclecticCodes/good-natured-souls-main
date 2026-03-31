import { rateLimit, getIP } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const ALGORITHM = 'aes-256-gcm';
const SECRET = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || 'gns-default-secret-32-chars-long!!';
const KEY = crypto.scryptSync(SECRET, 'gns-salt', 32);

function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

async function syncToResend(email: string) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
  } catch (err) {
    console.error("Failed to sync to Resend contacts:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req);
    const rl = rateLimit(ip, 'mailinglist', 3, 300_000); // 3 per 5 min per IP
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { email, source = "newsletter", consentGiven = false, consentTimestamp } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!consentGiven) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const sql = neon(process.env.POSTGRES_URL!);
    const emailHash = hashEmail(email);
    const emailEnc = encrypt(email);

    // Upsert into contacts — newsletter subscribers get marketing_consent: true
    await sql`
      INSERT INTO contacts (
        email_enc, email_hash, inquiry_count,
        sources, marketing_consent, gdpr_consent,
        data_source, first_seen_at, last_seen_at
      ) VALUES (
        ${emailEnc}, ${emailHash}, 0,
        ARRAY['newsletter'], true, true,
        ${source}, NOW(), NOW()
      )
      ON CONFLICT (email_hash) DO UPDATE SET
        marketing_consent = true,
        gdpr_consent      = true,
        sources           = CASE
          WHEN 'newsletter' = ANY(contacts.sources)
          THEN contacts.sources
          ELSE contacts.sources || ARRAY['newsletter']
        END,
        last_seen_at = NOW(),
        updated_at   = NOW()
    `;

    // Sync to Resend audience (non-blocking)
    syncToResend(email);

    // Send confirmation email
    await fetch(`${process.env.NEXTAUTH_URL || "https://goodnaturedsouls.com"}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter", data: { email } }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mailing list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
