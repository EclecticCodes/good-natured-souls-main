import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const SITE_URL = "https://goodnaturedsouls.com";

export async function GET() {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?sort=publishedAt:desc&pagination[limit]=20&populate=coverImage`,
      { cache: "no-store" }
    );

    const json = res.ok ? await res.json() : { data: [] };
    const articles = json.data || [];

    const items = articles.map((item: any) => {
      const attrs = item.attributes;
      const url = `${SITE_URL}/articles/${attrs.slug}`;
      const pubDate = new Date(attrs.publishedAt).toUTCString();
      const description = attrs.excerpt || attrs.title;
      return `
    <item>
      <title><![CDATA[${attrs.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${attrs.category || "News"}]]></category>
    </item>`;
    }).join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Good Natured Souls</title>
    <link>${SITE_URL}</link>
    <description>Independent Hip-Hop and R&amp;B from New York City. News, releases, and culture from Good Natured Souls Records.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/gns-logo.png</url>
      <title>Good Natured Souls</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to generate RSS feed", { status: 500 });
  }
}
