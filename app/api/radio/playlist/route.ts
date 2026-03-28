import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.POSTGRES_URL!);

// Returns an M3U playlist of approved GNS tracks for Liquidsoap
// Liquidsoap polls this every 5 minutes to pick up newly approved tracks
export async function GET() {
  try {
    const tracks = await sql`
      SELECT title, artist_name, mp3_url, duration
      FROM artist_tracks
      WHERE is_published = true AND mp3_url IS NOT NULL AND mp3_url != ''
      ORDER BY order_rank ASC, released_at DESC
    `;

    const m3u = [
      '#EXTM3U',
      '#PLAYLIST:GNS Radio',
      ...tracks.map((t: any) => [
        `#EXTINF:${t.duration ? parseDuration(t.duration) : -1},${t.artist_name} - ${t.title}`,
        t.mp3_url,
      ]).flat(),
    ].join('\n');

    return new NextResponse(m3u, {
      headers: {
        'Content-Type': 'audio/x-mpegurl',
        'Cache-Control': 'no-cache, no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Convert "3:45" duration string to seconds for M3U EXTINF
function parseDuration(dur: string): number {
  const parts = dur.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return -1;
}
