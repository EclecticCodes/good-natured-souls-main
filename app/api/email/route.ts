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
    console.error('Failed to save inquiry to Strapi:', err);
  }
}

function confirmationEmailHtml(name: string, subject: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;background:#161616;border-radius:4px;overflow:hidden;">

  <div style="background:#F0B51E;padding:6px 32px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:11px;font-weight:700;letter-spacing:4px;color:#000;">GOOD NATURED SOULS</span>
    <span style="font-size:10px;letter-spacing:2px;color:#000;opacity:0.6;">EXIST ALTRUISTIC</span>
  </div>

  <div style="padding:40px 32px;">
    <p style="font-size:11px;letter-spacing:4px;color:#F0B51E;margin:0 0 12px;text-transform:uppercase;">Message Received</p>
    <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px;letter-spacing:1px;">Thank you, ${name}.</h1>
    <p style="font-size:14px;color:#888;margin:0 0 32px;line-height:1.6;">We've received your inquiry and will follow up within 24–48 hours.</p>

    <div style="border:1px solid #2a2a2a;border-left:3px solid #F0B51E;padding:20px 24px;margin-bottom:32px;border-radius:2px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;">Your Inquiry</span>
        <span style="font-size:10px;font-weight:700;letter-spacing:2px;background:#F0B51E;color:#000;padding:3px 10px;border-radius:2px;">${subject.toUpperCase()}</span>
      </div>
      <p style="font-size:13px;color:#aaa;margin:0;line-height:1.7;border-top:1px solid #222;padding-top:14px;">${message}</p>
    </div>

    <div style="margin-bottom:32px;text-align:center;">
      <p style="font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;margin:0 0 20px;">What happens next</p>
      <div style="display:flex;flex-direction:column;gap:12px;max-width:340px;margin:0 auto;">
        <div style="display:flex;align-items:flex-start;gap:14px;text-align:left;">
          <span style="width:22px;height:22px;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#F0B51E;font-weight:700;flex-shrink:0;margin-top:1px;">1</span>
          <p style="font-size:13px;color:#888;margin:0;line-height:1.5;">Our ${subject.toLowerCase()} team reviews your request</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;text-align:left;">
          <span style="width:22px;height:22px;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#F0B51E;font-weight:700;flex-shrink:0;margin-top:1px;">2</span>
          <p style="font-size:13px;color:#888;margin:0;line-height:1.5;">We reach out within 24–48 hours</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;text-align:left;">
          <span style="width:22px;height:22px;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#F0B51E;font-weight:700;flex-shrink:0;margin-top:1px;">3</span>
          <p style="font-size:13px;color:#888;margin:0;line-height:1.5;">We work out the details together</p>
        </div>
      </div>
    </div>

    <div style="border-top:1px solid #1e1e1e;margin-bottom:28px;"></div>

    <p style="font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;margin:0 0 14px;text-align:center;">While you wait</p>
    <div style="display:flex;gap:8px;margin-bottom:28px;">
      <a href="https://goodnaturedsouls.com/artists" style="flex:1;border:1px solid #2a2a2a;padding:12px 8px;color:#F0B51E;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:2px;text-align:center;">OUR ARTISTS</a>
      <a href="https://goodnaturedsouls.com/shows" style="flex:1;border:1px solid #2a2a2a;padding:12px 8px;color:#F0B51E;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:2px;text-align:center;">SHOWS</a>
      <a href="https://goodnaturedsouls.com/store" style="flex:1;border:1px solid #2a2a2a;padding:12px 8px;color:#F0B51E;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:2px;text-align:center;">STORE</a>
    </div>

    <div style="text-align:center;">
      <a href="https://goodnaturedsouls.com/fanclub" style="display:inline-block;background:#F0B51E;color:#000;padding:14px 36px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:3px;border-radius:2px;">JOIN OUR MAILING LIST</a>
    </div>
  </div>

  <div style="border-top:1px solid #1e1e1e;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:11px;color:#444;">Good Natured Souls Records · The Bronx, NYC</span>
    <span style="font-size:11px;color:#444;">goodnaturedsouls.com</span>
  </div>

</div>
</body>
</html>`;
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

      await saveInquiryToStrapi(data);

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
