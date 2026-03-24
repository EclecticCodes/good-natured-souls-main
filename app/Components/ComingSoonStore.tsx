"use client";
import React, { useState } from 'react';
import WishlistModal from './WishlistModal';
import ProductDisplay3D from './ProductDisplay3D';
import { useCart } from '../context/CartContext';

type ProductType = 'digital' | 'vinyl' | 'tees' | 'hoodies' | 'accessories';
type PreviewType = 'spotify' | 'apple' | 'youtube' | 'soundcloud' | 'bandcamp' | 'tidal' | 'amazon' | 'deezer' | 'mp3' | null;

type Product = {
  id: string;
  name: string;
  artist: string;
  price: number;
  type: ProductType;
  meta: string;
  coverImage?: string;
  previews?: Partial<Record<PreviewType & string, string>>;
  tracks?: { num: number; name: string; dur: string }[];
};

const PLATFORM_COLORS: Record<string, string> = {
  spotify: '#1DB954',
  apple: '#FC3C44',
  youtube: '#FF0000',
  soundcloud: '#FF5500',
  bandcamp: '#1DA0C3',
  tidal: '#00FFFF',
  amazon: '#FF9900',
  deezer: '#A238FF',
  mp3: '#F0B51E',
};

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'SPOTIFY',
  apple: 'APPLE MUSIC',
  youtube: 'YOUTUBE',
  soundcloud: 'SOUNDCLOUD',
  bandcamp: 'BANDCAMP',
  tidal: 'TIDAL',
  amazon: 'AMAZON',
  deezer: 'DEEZER',
  mp3: 'MP3',
};

const products: Product[] = [
  {
    id: 'still-alive-digital',
    name: 'STILL ALIVE.',
    artist: 'Prince Inspiration',
    price: 9.99,
    type: 'digital',
    meta: '8 tracks · Hip-Hop / R&B · The Bronx, NY · MP3 + FLAC',
    coverImage: undefined,
    previews: {
      bandcamp: 'https://bandcamp.com/EmbeddedPlayer/album=2523183801/size=small/bgcol=000000/linkcol=F0B51E/transparent=true/',
    },
    tracks: [
      { num: 1, name: 'Heart(Beat)', dur: '2:35' },
      { num: 2, name: 'Runnin Up The Score', dur: '3:32' },
      { num: 3, name: 'ATW ft. Classix The Writer', dur: '3:21' },
      { num: 4, name: 'The Glory', dur: '3:48' },
      { num: 5, name: 'Still Alive...', dur: '4:02' },
      { num: 6, name: 'HomeComing ft. Mister JT', dur: '3:44' },
      { num: 7, name: 'FOREVA', dur: '3:46' },
      { num: 8, name: 'Heart(Beat) Reprise', dur: '3:45' },
    ],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  digital: 'Digital Downloads',
  vinyl: 'Vinyl',
  tees: 'Tees',
  hoodies: 'Hoodies',
  accessories: 'Accessories',
};

function getEmbedUrl(platform: string, url: string): string {
  switch (platform) {
    case 'spotify':
      return url.replace('open.spotify.com/', 'open.spotify.com/embed/').replace('/track/', '/track/').replace('/album/', '/album/');
    case 'youtube':
      return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
    case 'soundcloud':
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23F0B51E&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    case 'bandcamp':
      return url;
    case 'deezer':
      return url.replace('deezer.com/', 'widget.deezer.com/widget/dark/');
    default:
      return url;
  }
}

function PlayerEmbed({ platform, url, coverImage, productName }: { platform: string; url: string; coverImage?: string; productName: string }) {
  const [embedError, setEmbedError] = useState(false);

  if (platform === 'mp3') {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', padding: '12px' }}>
        <audio controls className="w-full" style={{ accentColor: '#F0B51E' }}>
          <source src={url} type="audio/mpeg" />
        </audio>
      </div>
    );
  }

  if (platform === 'apple') {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-oswald text-xs tracking-widest text-accent hover:underline">
          OPEN IN APPLE MUSIC →
        </a>
      </div>
    );
  }

  if (platform === 'tidal') {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-oswald text-xs tracking-widest text-accent hover:underline">
          OPEN IN TIDAL →
        </a>
      </div>
    );
  }

  if (platform === 'amazon') {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-oswald text-xs tracking-widest text-accent hover:underline">
          OPEN IN AMAZON MUSIC →
        </a>
      </div>
    );
  }

  if (embedError) {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {coverImage && <img src={coverImage} alt={productName} style={{ width: '40px', height: '40px', objectFit: 'cover', opacity: 0.6 }} />}
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-oswald text-xs tracking-widest text-accent hover:underline">
          OPEN IN {PLATFORM_LABELS[platform]} →
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={getEmbedUrl(platform, url)}
      width="100%"
      height="80"
      style={{ border: 'none', display: 'block' }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      onError={() => setEmbedError(true)}
    />
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [wishlist, setWishlist] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const availablePlatforms = Object.keys(product.previews || {}).filter(k => product.previews?.[k]);
  const [activePlatform, setActivePlatform] = useState<string>(availablePlatforms[0] || '');
  const isInCart = items.some((i) => i.id === product.id);
  const displayTracks = showAllTracks ? product.tracks : product.tracks?.slice(0, 3);
  const hiddenCount = (product.tracks?.length || 0) - 3;

  const handleWishlist = () => {
    if (wishlist) return;
    setShowWishlistModal(true);
  };

  return (
    <div className="border border-secondaryInteraction hover:border-accent transition-colors duration-200">
      {/* Cover image */}
      <div className="w-full aspect-square bg-primary flex items-center justify-center relative overflow-hidden">
        {product.coverImage && !coverError ? (
          <img
            src={product.coverImage}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="w-full h-full">
            <ProductDisplay3D type={product.type} name={product.name} artist={product.artist} />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-accent text-primary font-oswald text-xs font-bold px-2 py-1 tracking-widest">NEW</span>
      </div>

      <div className="p-5">
        <p className="text-accent font-oswald text-xs tracking-widest uppercase mb-1">{product.artist}</p>
        <h3 className="font-oswald text-2xl font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{product.meta}</p>

        {/* Player */}
        {availablePlatforms.length > 0 && (
          <div className="mb-4" style={{ background: '#111', border: '1px solid #2a2a2a', borderLeft: '3px solid #F0B51E', padding: '12px 14px' }}>
            <p className="font-oswald text-xs tracking-widest text-gray-600 uppercase mb-3">Preview on</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.keys(PLATFORM_LABELS).map(p => {
                const hasUrl = !!product.previews?.[p];
                if (!hasUrl) return null;
                const isActive = activePlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(p)}
                    style={{
                      background: isActive ? PLATFORM_COLORS[p] : 'transparent',
                      color: isActive ? '#000' : '#555',
                      border: `1px solid ${isActive ? PLATFORM_COLORS[p] : '#2a2a2a'}`,
                      fontSize: '9px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
            {activePlatform && product.previews?.[activePlatform] && (
              <PlayerEmbed
                platform={activePlatform}
                url={product.previews[activePlatform]!}
                coverImage={product.coverImage}
                productName={product.name}
              />
            )}
          </div>
        )}

        {/* Tracklist */}
        {product.tracks && (
          <div className="mb-4">
            {displayTracks?.map((t) => (
              <div key={t.num} className="flex items-center gap-2 py-1.5 border-b border-secondaryInteraction text-sm text-gray-400 hover:text-accent transition-colors last:border-0">
                <span className="w-5 text-xs text-gray-600">{t.num}</span>
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-gray-600">{t.dur}</span>
              </div>
            ))}
            {!showAllTracks && hiddenCount > 0 && (
              <button onClick={() => setShowAllTracks(true)} className="w-full text-center py-2 text-xs text-gray-600 hover:text-accent transition-colors tracking-widest font-oswald">
                + {hiddenCount} MORE TRACKS
              </button>
            )}
          </div>
        )}

        {/* Price + cart */}
        <div className="flex items-center justify-between pt-4 border-t border-secondaryInteraction">
          <div>
            <p className="font-oswald text-2xl font-bold text-accent">${product.price.toFixed(2)}</p>
            <p className="text-xs text-gray-600">{product.type === 'digital' ? 'Digital Album + Download' : product.type}</p>
          </div>
          {isInCart ? (
            <a href="/checkout" className="bg-secondaryInteraction text-accent border border-accent font-oswald text-sm font-bold px-5 py-2 tracking-widest hover:bg-accent hover:text-primary transition-colors">
              VIEW CART
            </a>
          ) : (
            <button onClick={() => addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, type: product.type })} className="bg-accent text-primary font-oswald text-sm font-bold px-5 py-2 tracking-widest hover:bg-accentInteraction transition-colors">
              ADD TO CART
            </button>
          )}
        </div>
        <button
          onClick={handleWishlist}
          className={`mt-2 w-full font-oswald text-xs tracking-widest py-2 border transition-colors ${wishlist ? 'border-accent text-accent cursor-default' : 'border-secondaryInteraction text-gray-500 hover:border-accent hover:text-accent'}`}
        >
          {wishlist ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}
        </button>
      </div>
      {showWishlistModal && (
        <WishlistModal
          product={{ id: product.id, name: product.name, type: product.type, price: product.price }}
          onClose={() => setShowWishlistModal(false)}
          onSaved={() => { setWishlist(true); setShowWishlistModal(false); }}
        />
      )}
    </div>
  );
}

const StoreComponent = ({ activeCategory = 'all', strapiProducts = [] }: { activeCategory?: string; strapiProducts?: any[] }) => {
  // Merge Strapi products with hardcoded — Strapi takes priority, hardcoded fills gaps
  const allProducts: Product[] = strapiProducts.length > 0
    ? strapiProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        artist: p.artist,
        price: p.price,
        type: p.category as ProductType,
        meta: p.description || `${p.tracks?.length || 0} tracks · ${p.artist}`,
        coverImage: p.coverImage || undefined,
        previews: {
          ...(p.spotifyUrl && { spotify: p.spotifyUrl }),
          ...(p.appleMusicUrl && { apple: p.appleMusicUrl }),
          ...(p.youtubeUrl && { youtube: p.youtubeUrl }),
          ...(p.soundcloudUrl && { soundcloud: p.soundcloudUrl }),
          ...(p.bandcampUrl && { bandcamp: p.bandcampUrl }),
          ...(p.tidalUrl && { tidal: p.tidalUrl }),
          ...(p.amazonUrl && { amazon: p.amazonUrl }),
          ...(p.deezerUrl && { deezer: p.deezerUrl }),
          ...(p.mp3Url && { mp3: p.mp3Url }),
        },
        tracks: p.tracks || [],
      }))
    : products;
  const filtered = activeCategory === 'all' ? allProducts : allProducts.filter(p => p.type === activeCategory);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setSubError('Please enter a valid email.'); return; }
    if (!consent) { setSubError('Please agree to receive emails.'); return; }
    await fetch('/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, consentGiven: true, consentTimestamp: new Date().toISOString(), source: 'store' }),
    });
    setSubscribed(true);
    setSubError('');
  };

  const categoryLabel = activeCategory === 'all' ? 'All Products' : CATEGORY_LABELS[activeCategory] || activeCategory;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="font-oswald text-xl font-bold tracking-widest uppercase mb-6 text-accent border-b border-secondaryInteraction pb-3">
        {categoryLabel}
      </h2>

      {filtered.length === 0 ? (
        <div className="border border-secondaryInteraction p-12 text-center mb-12">
          <p className="font-oswald text-2xl font-bold tracking-widest uppercase mb-3">
            {CATEGORY_LABELS[activeCategory] || activeCategory} Coming Soon
          </p>
          <p className="text-gray-500 text-sm tracking-wide mb-6">
            We are working on bringing you amazing {CATEGORY_LABELS[activeCategory]?.toLowerCase() || activeCategory}. Sign up below to be notified when new items drop.
          </p>
          {subscribed ? (
            <div className="border border-accent p-4 max-w-md mx-auto">
              <p className="font-oswald text-accent tracking-widest">YOU ARE ON THE LIST</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                />
                <button type="submit" disabled={!consent} className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-40">
                  NOTIFY ME
                </button>
              </form>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-yellow-400" />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to receive emails from Good Natured Souls. View our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
                </span>
              </label>
            </div>
          )}
          {subError && <p className="text-red-500 text-sm mt-3">{subError}</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="border border-secondaryInteraction p-8 text-center mb-12">
          <h2 className="font-oswald text-2xl font-bold tracking-widest uppercase mb-3">Physical Merch</h2>
          <p className="text-gray-500 text-lg mb-2">Coming Soon</p>
          <p className="text-gray-600 text-sm tracking-wide">Tees, hoodies, vinyl and more are currently in the works.</p>
        </div>
      )}

      <div className="border border-secondaryInteraction p-8 text-center">
        <h2 className="font-oswald text-2xl font-bold tracking-widest uppercase mb-2">Stay in the Loop</h2>
        <p className="text-gray-500 text-sm mb-6">Be first to know about new drops, merch releases, and exclusive offers.</p>
        {subscribed ? (
          <div className="border border-accent p-4 max-w-md mx-auto">
            <p className="font-oswald text-accent tracking-widest">YOU ARE ON THE LIST</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
              />
              <button type="submit" disabled={!consent} className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-40">
                SUBSCRIBE
              </button>
            </form>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-yellow-400" />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to receive emails from Good Natured Souls. View our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>
        )}
        {subError && <p className="text-red-500 text-sm mt-3">{subError}</p>}
      </div>
    </div>
  );
};

export default StoreComponent;
