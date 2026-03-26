'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'digital', label: 'Digital' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'tees', label: 'Tees' },
  { key: 'hoodies', label: 'Hoodies' },
  { key: 'accessories', label: 'Accessories' },
];

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  spotifyUrl:     { label: 'Spotify',      color: '#1DB954', icon: '🎵' },
  appleMusicUrl:  { label: 'Apple Music',  color: '#FC3C44', icon: '🍎' },
  youtubeUrl:     { label: 'YouTube',      color: '#FF0000', icon: '▶️' },
  soundcloudUrl:  { label: 'SoundCloud',   color: '#FF5500', icon: '☁️' },
  bandcampUrl:    { label: 'Bandcamp',     color: '#1DA0C3', icon: '🎸' },
  tidalUrl:       { label: 'Tidal',        color: '#00FFFF', icon: '🌊' },
  amazonUrl:      { label: 'Amazon',       color: '#FF9900', icon: '📦' },
  deezerUrl:      { label: 'Deezer',       color: '#A238FF', icon: '🎧' },
  mp3Url:         { label: 'MP3 Download', color: '#F0B51E', icon: '⬇️' },
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  status: string;
  featured: boolean;
  unlimited: boolean;
  stock: number;
  coverImage: string;
  images: string[];
  artist: string;
  artistSlug: string;
  tracks: { num: number; name: string; dur: string; featuring?: string }[];
  sizes: string[];
  colors: string[];
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  bandcampUrl?: string;
  tidalUrl?: string;
  amazonUrl?: string;
  deezerUrl?: string;
  mp3Url?: string;
};

export default function StoreClient({ products, initialCategory }: { products: Product[]; initialCategory: string }) {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const isDigital = (p: Product) => p.category === 'digital';

  const handleAddToCart = (product: Product) => {
    const typeMap: Record<string, any> = {
      digital: 'digital', vinyl: 'vinyl', tees: 'tees',
      hoodies: 'hoodies', accessories: 'accessories',
    };
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      type: typeMap[product.category] || 'merch',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setAddedToCart(false);
  };

  const streamingLinks = (product: Product) =>
    Object.entries(PLATFORM_CONFIG)
      .filter(([key]) => (product as any)[key])
      .map(([key, cfg]) => ({ ...cfg, url: (product as any)[key] }));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 9, letterSpacing: 4, color: '#444', textTransform: 'uppercase', margin: '0 0 8px' }}>Good Natured Souls</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '0 0 32px', letterSpacing: '-1px' }}>Store</h1>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                style={{ background: 'none', border: 'none', borderBottom: activeCategory === cat.key ? '2px solid #F0B51E' : '2px solid transparent', color: activeCategory === cat.key ? '#F0B51E' : '#555', padding: '12px 20px', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <div style={{ color: '#333', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>No products in this category yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map(product => (
              <div key={product.id} onClick={() => openProduct(product)}
                style={{ cursor: 'pointer', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}>

                {/* Cover image */}
                <div style={{ aspectRatio: '1', background: '#111', position: 'relative', overflow: 'hidden' }}>
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#222' }}>
                      {isDigital(product) ? '💿' : '👕'}
                    </div>
                  )}
                  {product.featured && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#F0B51E', color: '#000', fontSize: 8, fontWeight: 800, letterSpacing: 1, padding: '3px 8px', borderRadius: 4 }}>FEATURED</div>
                  )}
                  {product.category && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.8)', color: '#888', fontSize: 8, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{product.category}</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2, letterSpacing: '-0.3px' }}>{product.name}</div>
                  {product.artist && <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>{product.artist}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#F0B51E' }}>${product.price.toFixed(2)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span style={{ fontSize: 12, color: '#333', textDecoration: 'line-through' }}>${product.comparePrice.toFixed(2)}</span>
                      )}
                    </div>
                    {isDigital(product) && streamingLinks(product).length > 0 && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {streamingLinks(product).slice(0, 3).map(link => (
                          <span key={link.label} style={{ fontSize: 12 }}>{link.icon}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div onClick={() => setSelectedProduct(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 860, maxHeight: '92dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0e0e0e', zIndex: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedProduct.name}</div>
                {selectedProduct.artist && <div style={{ fontSize: 12, color: '#555' }}>{selectedProduct.artist}</div>}
              </div>
              <button onClick={() => setSelectedProduct(null)}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 22 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>

              {/* Left — images */}
              <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 380, padding: '20px 24px' }}>
                <div style={{ aspectRatio: '1', background: '#111', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                  {selectedProduct.images[activeImage] ? (
                    <img src={selectedProduct.images[activeImage]} alt={selectedProduct.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, color: '#222' }}>
                      {isDigital(selectedProduct) ? '💿' : '👕'}
                    </div>
                  )}
                </div>
                {selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} onClick={() => setActiveImage(idx)}
                        style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImage === idx ? '#F0B51E' : 'transparent'}` }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — details */}
              <div style={{ flex: 1, minWidth: 280, padding: '20px 24px' }}>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#F0B51E' }}>${selectedProduct.price.toFixed(2)}</span>
                  {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                    <span style={{ fontSize: 16, color: '#333', textDecoration: 'line-through' }}>${selectedProduct.comparePrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>
                )}

                {/* Sizes */}
                {selectedProduct.sizes?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>Size</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)}
                          style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${selectedSize === size ? '#F0B51E' : '#2a2a2a'}`, background: selectedSize === size ? '#F0B51E22' : 'transparent', color: selectedSize === size ? '#F0B51E' : '#888', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {selectedProduct.colors?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>Color</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedProduct.colors.map(color => (
                        <button key={color} onClick={() => setSelectedColor(color)}
                          style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${selectedColor === color ? '#F0B51E' : '#2a2a2a'}`, background: selectedColor === color ? '#F0B51E22' : 'transparent', color: selectedColor === color ? '#F0B51E' : '#888', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to cart / streaming */}
                {isDigital(selectedProduct) ? (
                  <div style={{ marginBottom: 20 }}>
                    {/* Stream/buy buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {streamingLinks(selectedProduct).map(link => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: link.color + '15', border: `1px solid ${link.color}33`, borderRadius: 8, textDecoration: 'none', color: '#fff', fontSize: 13, fontWeight: 600, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = link.color + '25')}
                          onMouseLeave={e => (e.currentTarget.style.background = link.color + '15')}>
                          <span style={{ fontSize: 18 }}>{link.icon}</span>
                          <span style={{ flex: 1 }}>Listen on {link.label}</span>
                          <span style={{ color: link.color, fontSize: 12 }}>↗</span>
                        </a>
                      ))}
                    </div>
                    {/* Buy download */}
                    <button onClick={() => handleAddToCart(selectedProduct)}
                      style={{ width: '100%', background: addedToCart ? '#22c55e' : '#F0B51E', color: '#000', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 800, cursor: 'pointer', fontSize: 15, transition: 'background 0.2s' }}>
                      {addedToCart ? '✓ Added to Cart' : `Buy Download — $${selectedProduct.price.toFixed(2)}`}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleAddToCart(selectedProduct)}
                    style={{ width: '100%', background: addedToCart ? '#22c55e' : '#F0B51E', color: '#000', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 800, cursor: 'pointer', fontSize: 15, marginBottom: 20, transition: 'background 0.2s' }}>
                    {addedToCart ? '✓ Added to Cart' : `Add to Cart — $${selectedProduct.price.toFixed(2)}`}
                  </button>
                )}

                {/* Track list */}
                {selectedProduct.tracks?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Tracklist</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedProduct.tracks.map((track, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #111' }}>
                          <span style={{ fontSize: 11, color: '#333', width: 20, textAlign: 'right', flexShrink: 0 }}>{track.num}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{track.name}</div>
                            {track.featuring && <div style={{ fontSize: 10, color: '#444' }}>ft. {track.featuring}</div>}
                          </div>
                          <span style={{ fontSize: 10, color: '#444', flexShrink: 0 }}>{track.dur}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
