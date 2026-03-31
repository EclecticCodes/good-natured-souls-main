import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { Resend } from "resend";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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

async function saveInquiryToNeon(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  source?: string;
  inquiry_type?: string;
  priority?: string;
  artist_slug?: string;
  referrer?: string;
  consent_given?: boolean;
}) {
  try {
    const sql = neon(process.env.POSTGRES_URL!);
    const emailHash = hashEmail(data.email);
    const nameEnc = encrypt(data.name);
    const emailEnc = encrypt(data.email);
    const messageEnc = encrypt(data.message);

    const source = data.source || 'contact-form';
    const inquiryType = data.inquiry_type || (
      data.subject === 'Booking' ? 'booking' :
      data.subject === 'Press & Media' ? 'press' :
      data.subject === 'Licensing' ? 'licensing' :
      data.subject === 'Fan Club' ? 'fan' :
      data.subject === 'Partnership' ? 'business' :
      data.subject === 'Technical Support' ? 'support' : 'other'
    );
    const priority = data.priority || (
      data.subject === 'Booking' ? 'high' :
      data.subject === 'Press & Media' ? 'high' : 'normal'
    );

    // Upsert contact first so trigger can link inquiry
    await sql`
      INSERT INTO contacts (email_enc, email_hash, name_enc, inquiry_count, subjects, sources, inquiry_types, data_source, first_seen_at, last_seen_at)
      VALUES (${emailEnc}, ${emailHash}, ${nameEnc}, 1, ARRAY[${data.subject}], ARRAY[${source}], ARRAY[${inquiryType}], ${source}, NOW(), NOW())
      ON CONFLICT (email_hash) DO UPDATE SET
        name_enc      = EXCLUDED.name_enc,
        inquiry_count = contacts.inquiry_count + 1,
        subjects      = CASE WHEN ${data.subject} = ANY(contacts.subjects) THEN contacts.subjects ELSE contacts.subjects || ARRAY[${data.subject}] END,
        sources       = CASE WHEN ${source} = ANY(contacts.sources) THEN contacts.sources ELSE contacts.sources || ARRAY[${source}] END,
        inquiry_types = CASE WHEN ${inquiryType} = ANY(contacts.inquiry_types) THEN contacts.inquiry_types ELSE contacts.inquiry_types || ARRAY[${inquiryType}] END,
        last_seen_at  = NOW(),
        updated_at    = NOW()
    `;

    // Insert inquiry — trigger auto-links contact_id via email_hash
    await sql`
      INSERT INTO inquiries (
        name_enc, email_enc, email_hash, message_enc,
        subject, status, source, inquiry_type, priority,
        artist_slug, referrer, consent_given, consent_captured_at, consent_version
      ) VALUES (
        ${nameEnc}, ${emailEnc}, ${emailHash}, ${messageEnc},
        ${data.subject}, 'new', ${source}, ${inquiryType}, ${priority},
        ${data.artist_slug || null}, ${data.referrer || null},
        ${data.consent_given || false}, NOW(), '1.0'
      )
    `;
  } catch (err) {
    console.error('Failed to save inquiry to Neon:', err);
  }
}

const EMAILS = {
  general: 'info@goodnaturedsouls.com',
  from: 'Good Natured Souls <info@goodnaturedsouls.com>',
  booking: 'booking@goodnaturedsouls.com',
  press: 'press@goodnaturedsouls.com',
  licensing: 'licensing@goodnaturedsouls.com',
  fanclub: 'fanclub@goodnaturedsouls.com',
  support: 'support@goodnaturedsouls.com',
  newsletter: 'Good Natured Souls <newsletter@goodnaturedsouls.com>',
};

async function saveInquiryToStrapi(data: { name: string; email: string; subject: string; message: string }) {
  try {
    await fetch(`${STRAPI_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: 'new',
        }
      })
    });
  } catch (err) {
    console.error('Failed to save inquiry to Strapi:', err);
  }
}

function confirmationEmailHtml(name: string, subject: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111111;max-width:560px;width:100%;">

  <!-- Gold header bar -->
  <tr>
    <td style="background:#F0B51E;padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:11px;font-weight:700;letter-spacing:4px;color:#000000;">GOOD NATURED SOULS</td>
        <td align="right" style="font-size:9px;letter-spacing:3px;color:#00000077;">EXIST ALTRUISTIC</td>
      </tr></table>
    </td>
  </tr>

  <!-- Main body -->
  <tr><td style="padding:36px 32px 28px;">
    <p style="font-size:9px;letter-spacing:4px;color:#F0B51E;margin:0 0 10px;text-transform:uppercase;">Message Received</p>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 8px;">Thank you, ${name}.</h1>
    <p style="font-size:14px;color:#666666;margin:0 0 28px;line-height:1.7;">We have received your inquiry and will follow up within 24 to 48 hours.</p>

    <!-- Inquiry card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222222;border-left:3px solid #F0B51E;margin-bottom:32px;">
      <tr><td style="padding:18px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
          <td style="font-size:9px;letter-spacing:3px;color:#555555;text-transform:uppercase;">Your Inquiry</td>
          <td align="right" style="font-size:9px;font-weight:700;letter-spacing:1px;background:#F0B51E;color:#000000;padding:3px 10px;">${subject.toUpperCase()}</td>
        </tr></table>
        <p style="font-size:13px;color:#aaaaaa;margin:0;line-height:1.8;border-top:1px solid #1e1e1e;padding-top:12px;">${message}</p>
      </td></tr>
    </table>

    <!-- What happens next -->
    <p style="font-size:9px;letter-spacing:3px;color:#555555;text-transform:uppercase;margin:0 0 16px;text-align:center;">What happens next</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding:8px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:28px;height:28px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:50%;text-align:center;vertical-align:middle;font-size:10px;color:#F0B51E;font-weight:700;">1</td>
          <td style="padding-left:14px;font-size:13px;color:#888888;line-height:1.5;">Our ${subject.toLowerCase()} team reviews your request</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:28px;height:28px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:50%;text-align:center;vertical-align:middle;font-size:10px;color:#F0B51E;font-weight:700;">2</td>
          <td style="padding-left:14px;font-size:13px;color:#888888;line-height:1.5;">We reach out within 24 to 48 hours</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:28px;height:28px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:50%;text-align:center;vertical-align:middle;font-size:10px;color:#F0B51E;font-weight:700;">3</td>
          <td style="padding-left:14px;font-size:13px;color:#888888;line-height:1.5;">We work out the details together</td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table>

    <!-- While you wait -->
    <p style="font-size:9px;letter-spacing:3px;color:#555555;text-transform:uppercase;margin:0 0 14px;text-align:center;">While you wait</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      <td style="padding-right:4px;"><a href="https://goodnaturedsouls.com/artists" style="display:block;border:1px solid #2a2a2a;padding:12px 6px;color:#F0B51E;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:2px;text-align:center;">ARTISTS</a></td>
      <td style="padding:0 2px;"><a href="https://goodnaturedsouls.com/shows" style="display:block;border:1px solid #2a2a2a;padding:12px 6px;color:#F0B51E;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:2px;text-align:center;">SHOWS</a></td>
      <td style="padding-left:4px;"><a href="https://goodnaturedsouls.com/store" style="display:block;border:1px solid #2a2a2a;padding:12px 6px;color:#F0B51E;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:2px;text-align:center;">STORE</a></td>
    </tr></table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="https://goodnaturedsouls.com" style="display:inline-block;background:#F0B51E;color:#000000;padding:14px 40px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:3px;">JOIN THE MAILING LIST</a>
    </td></tr></table>

  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="border-top:1px solid #1a1a1a;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:10px;color:#444444;">Good Natured Souls &middot; The Bronx, NYC</td>
        <td align="right" style="font-size:10px;color:#444444;">goodnaturedsouls.com</td>
      </tr></table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req);
    const rl = rateLimit(ip, 'email', 3, 60_000); // 3 per minute per IP
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { type, data } = await req.json();
    // Honeypot — bots fill the website field, humans don't
    if (data?.website) {
      return NextResponse.json({ success: true });
    }

    if (type === "contact") {
      const toEmail =
        data.subject === 'Booking' ? EMAILS.booking :
        data.subject === 'Press & Media' ? EMAILS.press :
        data.subject === 'Licensing' ? EMAILS.licensing :
        data.subject === 'Fan Club' ? EMAILS.fanclub :
        data.subject === 'Technical Support' ? EMAILS.support :
        EMAILS.general;

      await saveInquiryToNeon(data);

      await resend.emails.send({
        from: EMAILS.from,
        to: [toEmail],
        replyTo: data.email,
        subject: `New Inquiry: ${data.subject}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#F0B51E;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#1a1a1a;padding:16px;color:#fff;">${data.message}</p>
        </div>`,
      });

      await resend.emails.send({
        from: EMAILS.from,
        to: [data.email],
        subject: "We received your message — Good Natured Souls",
        html: confirmationEmailHtml(data.name, data.subject, data.message),
      });

      return NextResponse.json({ success: true });
    }

    if (type === "welcome") {
      await resend.emails.send({
        from: EMAILS.newsletter,
        to: [data.email],
        subject: `Welcome to Good Natured Souls, ${data.name}`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111111;max-width:560px;width:100%;">

  <!-- Gold header -->
  <tr>
    <td style="background:#F0B51E;padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:11px;font-weight:700;letter-spacing:4px;color:#000000;">GOOD NATURED SOULS</td>
        <td align="right" style="font-size:9px;letter-spacing:3px;color:#00000077;">EXIST ALTRUISTIC</td>
      </tr></table>
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:40px 32px 32px;">
    <p style="font-size:9px;letter-spacing:4px;color:#F0B51E;margin:0 0 10px;text-transform:uppercase;">Welcome</p>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 12px;">Welcome, ${data.name}.</h1>
    <p style="font-size:14px;color:#666666;margin:0 0 28px;line-height:1.7;">You are now part of the Good Natured Souls family. We are a Hip-Hop and R&amp;B cooperative based in The Bronx, NYC — built on creativity, community, and the belief that music should exist for the culture.</p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table>

    <p style="font-size:9px;letter-spacing:3px;color:#555555;text-transform:uppercase;margin:0 0 14px;">Start Here</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/artists" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">ARTISTS</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Explore our roster</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/store" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">STORE</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Shop new releases and merch</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/shows" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">SHOWS</a>
          <span style="font-size:12px;color:#444444;"> &mdash; See upcoming performances</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <a href="https://goodnaturedsouls.com/about" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">ABOUT</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Our story and mission</span>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="https://goodnaturedsouls.com" style="display:inline-block;background:#F0B51E;color:#000000;padding:14px 40px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:3px;">VISIT GOODNATUREDSOULS.COM</a>
    </td></tr></table>

  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="border-top:1px solid #1a1a1a;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:10px;color:#444444;">Good Natured Souls &middot; The Bronx, NYC</td>
        <td align="right" style="font-size:10px;color:#333333;"><a href="https://goodnaturedsouls.com/privacy" style="color:#333333;text-decoration:none;">Unsubscribe</a></td>
      </tr></table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "newsletter") {
      await resend.emails.send({
        from: EMAILS.newsletter,
        to: [data.email],
        subject: "You are on the list — Good Natured Souls",
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111111;max-width:560px;width:100%;">

  <!-- Gold header -->
  <tr>
    <td style="background:#F0B51E;padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:11px;font-weight:700;letter-spacing:4px;color:#000000;">GOOD NATURED SOULS</td>
        <td align="right" style="font-size:9px;letter-spacing:3px;color:#00000077;">EXIST ALTRUISTIC</td>
      </tr></table>
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:40px 32px 32px;">
    <p style="font-size:9px;letter-spacing:4px;color:#F0B51E;margin:0 0 10px;text-transform:uppercase;">Welcome to the List</p>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 12px;">You are on the list.</h1>
    <p style="font-size:14px;color:#666666;margin:0 0 28px;line-height:1.7;">You will be the first to know about new releases, upcoming shows, exclusive drops, and everything Good Natured Souls.</p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table>

    <p style="font-size:9px;letter-spacing:3px;color:#555555;text-transform:uppercase;margin:0 0 14px;">Explore</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/artists" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">ARTISTS</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Meet the roster</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/shows" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">SHOWS</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Upcoming performances</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">
          <a href="https://goodnaturedsouls.com/store" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">STORE</a>
          <span style="font-size:12px;color:#444444;"> &mdash; New releases and merch</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <a href="https://goodnaturedsouls.com/about" style="font-size:12px;color:#F0B51E;text-decoration:none;font-weight:700;letter-spacing:1px;">ABOUT</a>
          <span style="font-size:12px;color:#444444;"> &mdash; Our story</span>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="https://goodnaturedsouls.com" style="display:inline-block;background:#F0B51E;color:#000000;padding:14px 40px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:3px;">VISIT GOODNATUREDSOULS.COM</a>
    </td></tr></table>

  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="border-top:1px solid #1a1a1a;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:10px;color:#444444;">Good Natured Souls &middot; The Bronx, NYC</td>
        <td align="right" style="font-size:10px;color:#333333;"><a href="https://goodnaturedsouls.com/privacy" style="color:#333333;text-decoration:none;">Unsubscribe</a></td>
      </tr></table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "order") {
      await resend.emails.send({
        from: EMAILS.from,
        to: [data.email],
        subject: "Order Confirmed — Good Natured Souls",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161616;color:#fff;padding:32px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;">GOOD NATURED SOULS</h1>
          <h2>Order Confirmed</h2>
          <p style="color:#888;">Thank you for your purchase, ${data.name}!</p>
          <div style="border:1px solid #2a2a2a;padding:16px;margin:24px 0;">
            <p><strong>Total:</strong> <span style="color:#F0B51E;">$${data.total}</span></p>
            ${(data.items || []).map((item: any) => `<p style="color:#888;">${item.name} x${item.quantity}</p>`).join("")}
          </div>
          <a href="https://goodnaturedsouls.com/profile" style="display:inline-block;background:#F0B51E;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;">VIEW ORDER</a>
        </div>`,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "crm-reply") {
      await resend.emails.send({
        from: EMAILS.from,
        to: [data.to],
        replyTo: EMAILS.general,
        subject: `Re: ${data.subject}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161616;color:#fff;padding:32px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;font-size:16px;">GOOD NATURED SOULS</h1>
          <p style="color:#ccc;font-size:14px;line-height:1.8;white-space:pre-wrap;">${data.message}</p>
          <hr style="border-color:#2a2a2a;margin:32px 0;"/>
          <p style="color:#555;font-size:12px;">Good Natured Souls Records · The Bronx, NYC · goodnaturedsouls.com</p>
        </div>`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
