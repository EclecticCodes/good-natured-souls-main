import { redirect, notFound } from 'next/navigation';

async function getQRCode(slug: string) {
  try {
    const res = await fetch(
      `${process.env.MONASTERY_OS_URL}/api/public/qr/${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function QRRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getQRCode(slug);
  if (!data) notFound();

  const { code } = data;

  if (code.destination_type === 'artist_page' && code.owner_id) {
    redirect(`/artist-links/${code.owner_id}`);
  } else if (code.destination_type === 'single_link' && code.destination_url) {
    redirect(code.destination_url);
  } else if (code.destination_url) {
    redirect(code.destination_url);
  }

  notFound();
}
