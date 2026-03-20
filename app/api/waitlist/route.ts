import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, productId, productName, type } = await req.json();
    if (!email || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const res = await fetch(`${strapiUrl}/api/waitlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email, productId, productName, type: type || "waitlist" } }),
    });
    if (!res.ok) throw new Error("Failed to save");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
