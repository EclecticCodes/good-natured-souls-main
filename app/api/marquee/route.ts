import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "evw8b7bx", // Your Sanity project ID
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-15",
});

export async function GET() {
  try {
    const news = await client.fetch(`*[_type == "news"] | order(_createdAt desc)[0...5]{
      title,
      description
    }`);

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
