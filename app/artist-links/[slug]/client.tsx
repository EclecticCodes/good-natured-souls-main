'use client';

import { useState } from 'react';

const ICON_MAP: Record<string, string> = {
  spotify: '🎵', apple_music: '🍎', youtube: '▶️', instagram: '📷',
  tiktok: '��', twitter: '🐦', x: '✖️', merch: '👕', tickets: '🎟️',
  website: '🌐', newsletter: '📧', discord: '💬', link: '🔗',
  facebook: '👥', snapchat: '👻', tidal: '🌊', soundcloud: '☁️',
  bandcamp: '🎸', audiomack: '🎧', epk: '📄', bio: '📝',
  press_kit: '🗂️', interview: '🎙️', tour_dates: '📅', venue: '📍',
  gns_site: '🌐', gns_store: '🛍️', gns_newsletter: '📧',
};

const CATEGORY_MAP: Record<string, string> = {
  spotify: 'Music', apple_music: 'Music', tidal: 'Music', soundcloud: 'Music',
  bandcamp: 'Music', audiomack: 'Music',
  instagram: 'Social', tiktok: 'Social', twitter: 'Social', youtube: 'Social',
  facebook: 'Social', snapchat: 'Social',
  tickets: 'Live', tour_dates: 'Live', venue: 'Live',
  epk: 'Press', bio: 'Press', press_kit: 'Press', interview: 'Press',
  gns_site: 'GNS', gns_store: 'GNS', gns_newsletter: 'GNS', discord: 'GNS',
  merch: 'Store', website: 'More', newsletter: 'More', link: 'More',
};

const FONTS: Record<string, string> = {
  modern: "'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
  rounded: "'Trebuchet MS', sans-serif",
};

type LinkItem = {
  id: number;
  label: string;
  url: string;
  icon_type: string;
  position: number;
  is_visible: boolean;
};

type Profile = {
  id: number;
  slug: string;
  display_title: string;
  description?: string;
  profile_image?: string;
  bg_color?: string;
  accent_color?: string;
  font_style?: string;
  layout?: string;
  header_image?: string;
  artist_type?: string;
};

export default function ArtistPageClient({ profile, items }: { profile: Profile; items: LinkItem[] }) {
  const bgColor = profile.bg_color || '#0a0a0a';
  const accentColor = profile.accent_color || '#F0B51E';
  const fontFamily = FONTS[profile.font_style || 'modern'];
  const layout = profile.layout || 'centered';
  const isLight = ['#ffffff', '#f5f5f5', '#fafafa', '#f0f0f0'].includes(bgColor.toLowerCase());
  const textColor = isLight ? '#111' : '#fff';
  const subColor = isLight ? '#666' : '#888';
  const cardBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';

  // Group links by category
  const categories = [...new Set(items.map(i => CATEGORY_MAP[i.icon_type] || 'More'))];
  const allCategories = ['All', ...categories];
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterType, setNewsletterType] = useState<'artist' | 'gns'>('artist');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => (CATEGORY_MAP[i.icon_type] || 'More') === activeCategory);

  const handleNewsletter = async () => {
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_MONASTERY_OS_URL || 'https://goodnaturedsoul.com'}/api/public/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          type: newsletterType,
          artistId: profile.slug,
        }),
      });
      setNewsletterSubmitted(true);
    } catch {}
    finally { setNewsletterLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: bgColor, fontFamily, position: 'relative', overflowX: 'hidden' }}>

      {/* Header image */}
      {profile.header_image && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, overflow: 'hidden', zIndex: 0 }}>
          <img src={profile.header_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, ${bgColor})` }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, margin: '0 auto', padding: '56px 20px 100px' }}>

        {/* Profile hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {profile.profile_image ? (
            <img src={profile.profile_image} alt={profile.display_title}
              style={{ width: layout === 'bold' ? 110 : 88, height: layout === 'bold' ? 110 : 88, borderRadius: layout === 'bold' ? 16 : '50%', objectFit: 'cover', marginBottom: 14, border: `3px solid ${accentColor}`, boxShadow: `0 0 40px ${accentColor}33` }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: accentColor + '22', border: `3px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 14px' }}>🎵</div>
          )}
          <h1 style={{ margin: '0 0 8px', fontSize: layout === 'bold' ? 30 : 24, fontWeight: 900, color: textColor, letterSpacing: '-0.5px' }}>{profile.display_title}</h1>
          {profile.description && <p style={{ margin: '0 0 10px', fontSize: 14, color: subColor, lineHeight: 1.6 }}>{profile.description}</p>}
          {profile.artist_type && (
            <span style={{ fontSize: 9, letterSpacing: 2, color: accentColor, background: accentColor + '18', border: `1px solid ${accentColor}33`, borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase' }}>
              {profile.artist_type === 'affiliate' ? 'Affiliate' : 'GNS Roster'}
            </span>
          )}
        </div>

        {/* Category filter pills */}
        {allCategories.length > 2 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeCategory === cat ? accentColor : cardBorder}`, background: activeCategory === cat ? accentColor : cardBg, color: activeCategory === cat ? (isLight ? '#000' : '#000') : subColor, cursor: 'pointer', fontSize: 12, fontWeight: activeCategory === cat ? 700 : 400, whiteSpace: 'nowrap', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: layout === 'minimal' ? 0 : 10 }}>
          {filteredItems.map((item, idx) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: layout === 'card' ? cardBg : layout === 'minimal' ? 'transparent' : cardBg, border: layout === 'minimal' ? 'none' : `1px solid ${cardBorder}`, borderBottom: layout === 'minimal' ? `1px solid ${cardBorder}` : undefined, borderRadius: layout === 'minimal' ? 0 : layout === 'bold' ? 6 : 14, padding: layout === 'minimal' ? '13px 4px' : '14px 18px', textDecoration: 'none', color: textColor, fontSize: 15, fontWeight: 600, backdropFilter: layout === 'card' ? 'blur(10px)' : undefined, transition: 'all 0.15s', animationDelay: `${idx * 40}ms` }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = accentColor + '55'; (e.currentTarget as HTMLAnchorElement).style.background = accentColor + '11'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = cardBorder; (e.currentTarget as HTMLAnchorElement).style.background = layout === 'card' ? cardBg : 'transparent'; }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{ICON_MAP[item.icon_type] || '🔗'}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ color: accentColor, fontSize: 16 }}>↗</span>
            </a>
          ))}
          {filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: subColor, fontSize: 13 }}>No links in this category</div>
          )}
        </div>

        {/* Newsletter section */}
        <div style={{ marginTop: 40, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '24px 20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>📧</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 4 }}>Stay Connected</div>
            <div style={{ fontSize: 13, color: subColor }}>Get updates from {profile.display_title} and Good Natured Souls</div>
          </div>

          {/* Newsletter type toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button onClick={() => setNewsletterType('artist')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: newsletterType === 'artist' ? `1px solid ${accentColor}44` : '1px solid transparent', background: newsletterType === 'artist' ? accentColor + '22' : 'transparent', color: newsletterType === 'artist' ? accentColor : subColor, cursor: 'pointer', fontSize: 12, fontWeight: newsletterType === 'artist' ? 700 : 400 }}>
              {profile.display_title}
            </button>
            <button onClick={() => setNewsletterType('gns')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: newsletterType === 'gns' ? `1px solid ${accentColor}44` : '1px solid transparent', background: newsletterType === 'gns' ? accentColor + '22' : 'transparent', color: newsletterType === 'gns' ? accentColor : subColor, cursor: 'pointer', fontSize: 12, fontWeight: newsletterType === 'gns' ? 700 : 400 }}>
              GNS Newsletter
            </button>
          </div>

          {newsletterSubmitted ? (
            <div style={{ textAlign: 'center', padding: '14px 0', color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
              ✓ You're subscribed!
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                onKeyDown={e => e.key === 'Enter' && handleNewsletter()}
                style={{ flex: 1, background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '10px 12px', color: textColor, fontSize: 14, outline: 'none' }}
              />
              <button onClick={handleNewsletter} disabled={newsletterLoading}
                style={{ background: accentColor, color: isLight ? '#fff' : '#000', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: newsletterLoading ? 'not-allowed' : 'pointer', fontSize: 13, opacity: newsletterLoading ? 0.7 : 1, flexShrink: 0 }}>
                {newsletterLoading ? '...' : 'Join'}
              </button>
            </div>
          )}
        </div>

        {/* GNS footer */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <a href="https://goodnaturedsouls.com" style={{ fontSize: 10, color: subColor, textDecoration: 'none', letterSpacing: 3, opacity: 0.4, textTransform: 'uppercase' }}>
            Good Natured Souls
          </a>
        </div>
      </div>
    </div>
  );
}
