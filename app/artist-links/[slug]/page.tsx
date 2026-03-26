import { notFound } from 'next/navigation';

const ICON_MAP: Record<string, string> = {
  spotify: '🎵', apple_music: '🎵', youtube: '▶️', instagram: '📷',
  tiktok: '🎵', twitter: '��', x: '✖️', merch: '👕', tickets: '🎟️',
  website: '🌐', newsletter: '📧', discord: '💬', link: '��',
};

async function getProfile(slug: string) {
  try {
    const res = await fetch(
      `${process.env.MONASTERY_OS_URL}/api/public/artist-links/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function ArtistLinksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProfile(slug);
  if (!data) notFound();

  const { profile, items } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '60px 20px 80px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Profile header */}
      <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 400, width: '100%' }}>
        {profile.profile_image ? (
          <img src={profile.profile_image} alt={profile.display_title}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '2px solid #F0B51E' }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#F0B51E22', border: '2px solid #F0B51E44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>
            🎵
          </div>
        )}
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{profile.display_title}</h1>
        {profile.description && (
          <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.6 }}>{profile.description}</p>
        )}
      </div>

      {/* Links */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item: any) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px 20px', textDecoration: 'none', color: '#fff', fontSize: 15, fontWeight: 600, transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#F0B51E44')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{ICON_MAP[item.icon_type] || '🔗'}</span>
            <span>{item.label}</span>
            <span style={{ marginLeft: 'auto', color: '#333', fontSize: 12 }}>↗</span>
          </a>
        ))}
      </div>

      {/* GNS footer */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <a href="https://goodnaturedsouls.com" style={{ fontSize: 11, color: '#333', textDecoration: 'none', letterSpacing: 2 }}>
          GOOD NATURED SOULS
        </a>
      </div>
    </div>
  );
}
