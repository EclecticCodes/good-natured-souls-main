import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const {
      title, duration, featuring, mp3_url, cover_image,
      spotify_url, apple_music_url, bandcamp_url, youtube_url,
      soundcloud_url, tidal_url, released_at, is_published, order_rank
    } = body;

    const result = await sql`
      UPDATE artist_tracks SET
        title = COALESCE(${title}, title),
        duration = COALESCE(${duration || null}, duration),
        featuring = COALESCE(${featuring || null}, featuring),
        mp3_url = COALESCE(${mp3_url || null}, mp3_url),
        cover_image = COALESCE(${cover_image || null}, cover_image),
        spotify_url = COALESCE(${spotify_url || null}, spotify_url),
        apple_music_url = COALESCE(${apple_music_url || null}, apple_music_url),
        bandcamp_url = COALESCE(${bandcamp_url || null}, bandcamp_url),
        youtube_url = COALESCE(${youtube_url || null}, youtube_url),
        soundcloud_url = COALESCE(${soundcloud_url || null}, soundcloud_url),
        tidal_url = COALESCE(${tidal_url || null}, tidal_url),
        released_at = COALESCE(${released_at || null}, released_at),
        is_published = COALESCE(${is_published ?? null}, is_published),
        order_rank = COALESCE(${order_rank ?? null}, order_rank),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json({ track: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await sql`DELETE FROM artist_tracks WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Increment play count
  try {
    await sql`UPDATE artist_tracks SET play_count = play_count + 1 WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
