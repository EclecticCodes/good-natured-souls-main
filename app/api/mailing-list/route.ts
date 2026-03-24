import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function syncToResend(email: string) {
  try {
    await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });
  } catch (err) {
    console.error("Failed to sync to Resend contacts:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, source = "unknown", consentGiven = false, consentTimestamp } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!consentGiven) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    // Save to Strapi
    const res = await fetch(`${STRAPI_URL}/api/mailing-list-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          email,
          source,
          consentGiven,
          consentTimestamp: consentTimestamp || new Date().toISOString(),
          confirmed: false,
          unsubscribed: false,
        }
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      if (JSON.stringify(err).includes("unique")) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      throw new Error("Failed to save email");
    }

    // Sync to Resend contacts (non-blocking)
    await syncToResend(email);

    // Send confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://goodnaturedsouls.com"}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter", data: { email } }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
