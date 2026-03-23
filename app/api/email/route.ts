import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const EMAILS = {
  general: 'info@goodnaturedsouls.com',
  from: 'Good Natured Souls <info@goodnaturedsouls.com>',
  booking: 'booking@goodnaturedsouls.com',
  press: 'press@goodnaturedsouls.com',
  licensing: 'licensing@goodnaturedsouls.com',
  fanclub: 'fanclub@goodnaturedsouls.com',
  support: 'support@goodnaturedsouls.com',
  newsletter: 'Good Natured Souls <info@goodnaturedsouls.com>',
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
    // Non-blocking — don't fail the email if Strapi is down
    console.error('Failed to save inquiry to Strapi:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (type === "contact") {
      const toEmail =
        data.subject === 'Booking' ? EMAILS.booking :
        data.subject === 'Press & Media' ? EMAILS.press :
        data.subject === 'Licensing' ? EMAILS.licensing :
        data.subject === 'Fan Club' ? EMAILS.fanclub :
        data.subject === 'Technical Support' ? EMAILS.support :
        EMAILS.general;

      // Save to Strapi first (non-blocking)
      await saveInquiryToStrapi(data);

      // Send notification to GNS team
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

      // Send confirmation to sender
      await resend.emails.send({
        from: EMAILS.from,
        to: [data.email],
        subject: "We received your message — Good Natured Souls",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161616;color:#fff;padding:32px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;">GOOD NATURED SOULS</h1>
          <h2>Thank you, ${data.name}.</h2>
          <p style="color:#888;">We have received your message and will get back to you within 24-48 hours.</p>
          <div style="border-left:3px solid #F0B51E;padding-left:16px;margin:24px 0;">
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p style="color:#666;">${data.message}</p>
          </div>
          <a href="https://discord.gg/tr6Gybnu" style="display:inline-block;background:#5865F2;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;margin-top:8px;">JOIN DISCORD</a>
          <hr style="border-color:#2a2a2a;margin:32px 0;"/>
          <p style="color:#555;font-size:12px;">Good Natured Souls Records · New York City · goodnaturedsouls.com</p>
        </div>`,
      });

      return NextResponse.json({ success: true });
    }

    if (type === "welcome") {
      await resend.emails.send({
        from: EMAILS.from,
        to: [data.email],
        subject: "Welcome to Good Natured Souls",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161616;color:#fff;padding:32px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;">GOOD NATURED SOULS</h1>
          <h2>Welcome, ${data.name}!</h2>
          <p style="color:#888;">You are now part of the Good Natured Souls family.</p>
          <a href="https://goodnaturedsouls.com/artists" style="display:block;border:1px solid #2a2a2a;padding:16px;color:#F0B51E;text-decoration:none;margin:8px 0;">ARTISTS — Explore our roster</a>
          <a href="https://goodnaturedsouls.com/store" style="display:block;border:1px solid #2a2a2a;padding:16px;color:#F0B51E;text-decoration:none;margin:8px 0;">STORE — Shop new releases</a>
          <a href="https://goodnaturedsouls.com/fanclub" style="display:block;border:1px solid #2a2a2a;padding:16px;color:#F0B51E;text-decoration:none;margin:8px 0;">FAN CLUB — Exclusive perks</a>
          <a href="https://discord.gg/tr6Gybnu" style="display:inline-block;background:#5865F2;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;margin-top:16px;">JOIN OUR DISCORD</a>
          <hr style="border-color:#2a2a2a;margin:32px 0;"/>
          <p style="color:#555;font-size:12px;">Good Natured Souls Records · New York City · goodnaturedsouls.com</p>
        </div>`,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "newsletter") {
      await resend.emails.send({
        from: EMAILS.newsletter,
        to: [data.email],
        subject: "You are on the list — Good Natured Souls",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161616;color:#fff;padding:32px;">
          <h1 style="color:#F0B51E;letter-spacing:4px;">GOOD NATURED SOULS</h1>
          <h2>You are on the list.</h2>
          <p style="color:#888;">You will be the first to know about new releases, upcoming shows, and exclusive offers.</p>
          <a href="https://goodnaturedsouls.com" style="display:inline-block;background:#F0B51E;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;margin-top:16px;">VISIT GNS</a>
          <hr style="border-color:#2a2a2a;margin:32px 0;"/>
          <p style="color:#555;font-size:12px;">You can unsubscribe at any time. Good Natured Souls Records · New York City</p>
        </div>`,
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

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
