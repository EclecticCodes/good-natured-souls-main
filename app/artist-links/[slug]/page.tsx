import { notFound } from 'next/navigation';

const ICON_MAP: Record<string, string> = {
  spotify: '🎵', apple_music: '🍎', youtube: '▶️', instagram: '📷',
  tiktok: '🎵', twitter: '🐦', x: '✖️', merch: '👕', tickets: '🎟️',
  website: '🌐', newsletter: '📧', discord: '💬', link: '🔗',
  facebook: '👥', snapchat: '👻', tidal: '🌊', soundcloud: '☁️',
  bandcamp: '🎸', audiomack: '🎧', epk: '📄', bio: '📝',
  press_kit: '🗂️', interview: '🎙️', tour_dates: '📅', venue: '📍',
  gns_site: '🌐', gns_store: '🛍️', gns_newsletter: '📧',
};

const FONTS: Record<string, string> = {
  modern: "'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
  rounded: "'Trebuchet MS', sans-serif",
};

const LAYOUTS = ['centered', 'card', 'minimal', 'bold'];

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

  const { profile, items } = data;

  const bgColor = profile.bg_color || '#0a0a0a';
  const accentColor = profile.accent_color || '#F0B51E';
  const fontFamily = FONTS[profile.font_style || 'modern'];
  const layout = profile.layout || 'centered';
  const isLight = bgColor === '#ffffff' || bgColor === '#f5f5f5' || bgColor === '#fafafa';
  const textColor = isLight ? '#111' : '#fff';
  const subTextColor = isLight ? '#555' : '#888';
  const cardBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';

  return (
    <div style={{ minHeight: '100vh', background: bgColor, fontFamily, position: 'relative', overflowX: 'hidden' }}>

      {/* Background header image */}
      {profile.header_image && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, overflow: 'hidden', zIndex: 0 }}>
          <img src={profile.header_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${bgColor})` }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: layout === 'bold' ? 560 : 420, margin: '0 auto', padding: '60px 20px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Profile header */}
        <div style={{ textAlign: 'center', marginBottom: layout === 'minimal' ? 24 : 36, width: '100%' }}>
          {profile.profile_image ? (
            <img src={profile.profile_image} alt={profile.display_title}
              style={{
                width: layout === 'bold' ? 120 : 88,
                height: layout === 'bold' ? 120 : 88,
                borderRadius: layout === 'bold' ? 16 : '50%',
                objectFit: 'cover',
                marginBottom: 16,
                border: `3px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}33`,
              }} />
          ) : (
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: accentColor + '22',
              border: `3px solid ${accentColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 16px',
            }}>🎵</div>
          )}

          <h1 style={{
            margin: '0 0 8px',
            fontSize: layout === 'bold' ? 32 : 24,
            fontWeight: 900,
            color: textColor,
            letterSpacing: layout === 'bold' ? '-1px' : '-0.5px',
          }}>{profile.display_title}</h1>

          {profile.description && (
            <p style={{ margin: 0, fontSize: 14, color: subTextColor, lineHeight: 1.6, maxWidth: 320 }}>
              {profile.description}
            </p>
          )}

          {profile.artist_type && (
            <div style={{ display: 'inline-block', marginTop: 10, fontSize: 9, letterSpacing: 2, color: accentColor, background: accentColor + '18', border: `1px solid ${accentColor}33`, borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase' }}>
              {profile.artist_type === 'affiliate' ? 'Affiliate' : 'GNS Roster'}
            </div>
          )}
        </div>

        {/* Links */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: layout === 'minimal' ? 6 : 10 }}>
          {items.map((item: any) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: layout === 'card' ? cardBg : 'transparent',
                border: layout === 'minimal' ? 'none' : `1px solid ${cardBorder}`,
                borderBottom: layout === 'minimal' ? `1px solid ${cardBorder}` : undefined,
                borderRadius: layout === 'minimal' ? 0 : layout === 'bold' ? 6 : 14,
                padding: layout === 'minimal' ? '12px 4px' : '14px 20px',
                textDecoration: 'none',
                color: textColor,
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.15s',
                backdropFilter: layout === 'card' ? 'blur(10px)' : undefined,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = accentColor + '66';
                (e.currentTarget as HTMLAnchorElement).style.background = accentColor + '11';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = cardBorder;
                (e.currentTarget as HTMLAnchorElement).style.background = layout === 'card' ? cardBg : 'transparent';
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{ICON_MAP[item.icon_type] || '🔗'}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ color: accentColor, fontSize: 14 }}>↗</span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a href="https://goodnaturedsouls.com"
            style={{ fontSize: 10, color: subTextColor, textDecoration: 'none', letterSpacing: 3, opacity: 0.5 }}>
            GOOD NATURED SOULS
          </a>
        </div>
      </div>
    </div>
  );
}
