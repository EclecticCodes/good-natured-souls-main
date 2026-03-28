import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artistSlug = searchParams.get('artist');
    const publishedOnly = searchParams.get('published') !== 'false';

    let tracks;
    if (artistSlug) {
      tracks = publishedOnly
        ? await sql`SELECT * FROM artist_tracks WHERE artist_slug = ${artistSlug} AND is_published = true ORDER BY order_rank ASC, released_at DESC`
        : await sql`SELECT * FROM artist_tracks WHERE artist_slug = ${artistSlug} ORDER BY order_rank ASC, released_at DESC`;
    } else {
      tracks = await sql`SELECT * FROM artist_tracks WHERE is_published = true ORDER BY released_at DESC LIMIT 50`;
    }

    return NextResponse.json({ tracks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      artist_slug, artist_name, title, duration, featuring,
      mp3_url, cover_image, spotify_url, apple_music_url,
      bandcamp_url, youtube_url, soundcloud_url, tidal_url,
      released_at, is_published, order_rank
    } = await req.json();

    if (!artist_slug || !title) return NextResponse.json({ error: 'artist_slug and title required' }, { status: 400 });

    const result = await sql`
      INSERT INTO artist_tracks (
        artist_slug, artist_name, title, duration, featuring,
        mp3_url, cover_image, spotify_url, apple_music_url,
        bandcamp_url, youtube_url, soundcloud_url, tidal_url,
        released_at, is_published, order_rank
      ) VALUES (
        ${artist_slug}, ${artist_name}, ${title}, ${duration || null}, ${featuring || null},
        ${mp3_url || null}, ${cover_image || null}, ${spotify_url || null}, ${apple_music_url || null},
        ${bandcamp_url || null}, ${youtube_url || null}, ${soundcloud_url || null}, ${tidal_url || null},
        ${released_at || null}, ${is_published ?? false}, ${order_rank ?? 0}
      ) RETURNING *
    `;

    return NextResponse.json({ track: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
