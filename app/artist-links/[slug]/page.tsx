import ArtistPageClient from './client';
import { notFound } from 'next/navigation';

async function getProfile(slug: string) {
  try {
    const res = await fetch(
      `${process.env.MONASTERY_OS_URL}/api/public/artist-links/${slug}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function ArtistLinksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProfile(slug);
  if (!data) notFound();
  return <ArtistPageClient profile={data.profile} items={data.items} />;
}
