'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import ProductDisplay3D from '../Components/ProductDisplay3D';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'digital', label: 'Digital' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'tees', label: 'Tees' },
  { key: 'hoodies', label: 'Hoodies' },
  { key: 'accessories', label: 'Accessories' },
];

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  spotifyUrl:    { label: 'Spotify',      color: '#1DB954', icon: '🎵' },
  appleMusicUrl: { label: 'Apple Music',  color: '#FC3C44', icon: '🍎' },
  youtubeUrl:    { label: 'YouTube',      color: '#FF0000', icon: '▶️' },
  soundcloudUrl: { label: 'SoundCloud',   color: '#FF5500', icon: '☁️' },
  bandcampUrl:   { label: 'Bandcamp',     color: '#1DA0C3', icon: '🎸' },
  tidalUrl:      { label: 'Tidal',        color: '#00FFFF', icon: '🌊' },
  amazonUrl:     { label: 'Amazon',       color: '#FF9900', icon: '📦' },
  deezerUrl:     { label: 'Deezer',       color: '#A238FF', icon: '🎧' },
  mp3Url:        { label: 'MP3 Download', color: '#F0B51E', icon: '⬇️' },
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

function get3DType(category: string): string {
  if (category === 'vinyl') return 'vinyl';
  if (category === 'digital') return 'digital';
  return 'box';
}

export default function StoreClient({ products, initialCategory, storeSettings }: { products: Product[]; initialCategory: string; storeSettings?: { heroImage?: string; heroCopy?: string; heroSubcopy?: string; categoryImages?: { categoryKey: string; image?: string }[] } }) {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const isDigital = (p: Product) => p.category === 'digital';

  const streamingLinks = (product: Product) =>
    Object.entries(PLATFORM_CONFIG)
      .filter(([key]) => (product as any)[key])
      .map(([key, cfg]) => ({ ...cfg, url: (product as any)[key] }));

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
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setAddedToCart(false);
    document.body.style.overflow = 'hidden';
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Store header */}
      <div style={{ padding: '48px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 9, letterSpacing: 4, color: '#444', textTransform: 'uppercase', margin: '0 0 6px' }}>Good Natured Souls</p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, margin: '0 0 0', letterSpacing: '-2px', lineHeight: 1 }}>Store</h1>
      </div>

      {/* Category tabs */}
      <div style={{ borderBottom: '1px solid #1a1a1a', marginTop: 32 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              style={{ background: 'none', border: 'none', borderBottom: activeCategory === cat.key ? '2px solid #F0B51E' : '2px solid transparent', color: activeCategory === cat.key ? '#fff' : '#444', padding: '14px 20px', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all 0.15s', marginBottom: -1 }}>
              {cat.label}
              <span style={{ marginLeft: 6, fontSize: 9, color: activeCategory === cat.key ? '#F0B51E' : '#333' }}>
                {cat.key === 'all' ? products.length : products.filter(p => p.category === cat.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🛍️</div>
            <div style={{ color: '#333', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>No products yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {filtered.map(product => (
              <div key={product.id}
                onClick={() => openProduct(product)}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer', position: 'relative', background: '#0e0e0e', overflow: 'hidden' }}>

                {/* Cover image / 3D fallback */}
                <div style={{ aspectRatio: '1', position: 'relative', background: '#111', overflow: 'hidden' }}>
                  {product.coverImage ? (
                    <>
                      <img src={product.coverImage} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', transform: hoveredId === product.id ? 'scale(1.04)' : 'scale(1)' }} />
                      {/* Hover overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: hoveredId === product.id ? 1 : 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#F0B51E', color: '#000', fontSize: 11, fontWeight: 800, letterSpacing: 2, padding: '10px 20px', borderRadius: 4, textTransform: 'uppercase' }}>
                          View Product
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 3D object when no cover image */
                    <div style={{ width: '100%', height: '100%', padding: 32 }}>
                      <ProductDisplay3D
                        type={get3DType(product.category)}
                        name={product.name}
                        artist={product.artist}
                        coverImage={product.coverImage}
                      />
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {product.featured && (
                      <div style={{ background: '#F0B51E', color: '#000', fontSize: 8, fontWeight: 800, letterSpacing: 1.5, padding: '3px 8px', borderRadius: 2 }}>NEW</div>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div style={{ background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, letterSpacing: 1, padding: '3px 8px', borderRadius: 2 }}>SALE</div>
                    )}
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: '14px 16px', borderTop: '1px solid #1a1a1a' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                      {product.artist && <div style={{ fontSize: 10, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.artist}</div>}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#F0B51E' }}>${product.price.toFixed(2)}</div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div style={{ fontSize: 10, color: '#333', textDecoration: 'line-through', textAlign: 'right' }}>${product.comparePrice.toFixed(2)}</div>
                      )}
                    </div>
                  </div>

                  {/* Streaming icons for digital */}
                  {isDigital(product) && streamingLinks(product).length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                      {streamingLinks(product).slice(0, 5).map(link => (
                        <span key={link.label} style={{ fontSize: 11, opacity: 0.6 }} title={link.label}>{link.icon}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product detail panel */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          {/* Backdrop */}
          <div onClick={closeProduct} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }} />

          {/* Panel */}
          <div style={{ position: 'relative', width: '100%', background: '#0a0a0a', borderTop: '1px solid #1a1a1a', borderRadius: '20px 20px 0 0', maxHeight: '92dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Panel header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 9, letterSpacing: 3, color: '#444', textTransform: 'uppercase' }}>{selectedProduct.category}</span>
                <span style={{ color: '#2a2a2a' }}>·</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedProduct.name}</span>
                {selectedProduct.artist && <span style={{ fontSize: 11, color: '#444' }}>by {selectedProduct.artist}</span>}
              </div>
              <button onClick={closeProduct} style={{ background: '#1a1a1a', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap' }}>

              {/* LEFT — 3D object + images */}
              <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 420, padding: '32px 24px' }}>
                {/* 3D display */}
                <div style={{ width: '100%', aspectRatio: '1', position: 'relative', marginBottom: 16 }}>
                  {selectedProduct.coverImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img src={selectedProduct.images[activeImage] || selectedProduct.coverImage} alt={selectedProduct.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                      {/* 3D overlay — floats above the image */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0 }}>
                        <div style={{ width: '60%', height: '60%' }}>
                          <ProductDisplay3D
                            type={get3DType(selectedProduct.category)}
                            name={selectedProduct.name}
                            artist={selectedProduct.artist}
                            coverImage={selectedProduct.coverImage}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#0e0e0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                      <ProductDisplay3D
                        type={get3DType(selectedProduct.category)}
                        name={selectedProduct.name}
                        artist={selectedProduct.artist}
                        coverImage={selectedProduct.coverImage}
                      />
                    </div>
                  )}
                </div>

                {/* Image thumbnails */}
                {selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} onClick={() => setActiveImage(idx)}
                        style={{ width: 52, height: 52, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImage === idx ? '#F0B51E' : 'transparent'}`, opacity: activeImage === idx ? 1 : 0.5, transition: 'all 0.15s' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Hint for 3D interaction */}
                <div style={{ marginTop: 12, fontSize: 10, color: '#2a2a2a', textAlign: 'center', letterSpacing: 1 }}>
                  {selectedProduct.category === 'vinyl' ? 'CLICK · SPIN THE RECORD' : 'HOVER · INTERACT'}
                </div>
              </div>

              {/* RIGHT — product details */}
              <div style={{ flex: 1, minWidth: 280, padding: '32px 24px', borderLeft: '1px solid #1a1a1a' }}>

                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>{selectedProduct.name}</h2>
                  {selectedProduct.artist && <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>{selectedProduct.artist}</div>}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: '#F0B51E' }}>${selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                      <span style={{ fontSize: 14, color: '#333', textDecoration: 'line-through' }}>${selectedProduct.comparePrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {selectedProduct.description && (
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 20, borderLeft: '2px solid #1a1a1a', paddingLeft: 12 }}>{selectedProduct.description}</p>
                )}

                {/* Sizes */}
                {selectedProduct.sizes?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>Size</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)}
                          style={{ padding: '7px 16px', borderRadius: 4, border: `1px solid ${selectedSize === size ? '#F0B51E' : '#2a2a2a'}`, background: selectedSize === size ? '#F0B51E22' : 'transparent', color: selectedSize === size ? '#F0B51E' : '#666', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: 'all 0.15s' }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {selectedProduct.colors?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>Color</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedProduct.colors.map(color => (
                        <button key={color} onClick={() => setSelectedColor(color)}
                          style={{ padding: '7px 16px', borderRadius: 4, border: `1px solid ${selectedColor === color ? '#F0B51E' : '#2a2a2a'}`, background: selectedColor === color ? '#F0B51E22' : 'transparent', color: selectedColor === color ? '#F0B51E' : '#666', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: 'all 0.15s' }}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streaming links for digital */}
                {isDigital(selectedProduct) && streamingLinks(selectedProduct).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Stream / Listen</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {streamingLinks(selectedProduct).map(link => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: link.color + '12', border: `1px solid ${link.color}25`, borderRadius: 6, textDecoration: 'none', color: '#fff', fontSize: 12, fontWeight: 600, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = link.color + '22')}
                          onMouseLeave={e => (e.currentTarget.style.background = link.color + '12')}>
                          <span style={{ fontSize: 16 }}>{link.icon}</span>
                          <span style={{ flex: 1 }}>{link.label}</span>
                          <span style={{ color: link.color, fontSize: 11 }}>↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to cart */}
                <button onClick={() => handleAddToCart(selectedProduct)}
                  style={{ width: '100%', background: addedToCart ? '#22c55e' : '#F0B51E', color: '#000', border: 'none', borderRadius: 6, padding: '15px 0', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', transition: 'background 0.25s', marginBottom: 20 }}>
                  {addedToCart ? '✓ Added to Cart' : isDigital(selectedProduct) ? `Buy Download — $${selectedProduct.price.toFixed(2)}` : `Add to Cart — $${selectedProduct.price.toFixed(2)}`}
                </button>

                {/* Tracklist */}
                {selectedProduct.tracks?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 12 }}>Tracklist</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {selectedProduct.tracks.map((track, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: '1px solid #111' }}>
                          <span style={{ fontSize: 10, color: '#2a2a2a', width: 18, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{track.num}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</div>
                            {track.featuring && <div style={{ fontSize: 10, color: '#444' }}>ft. {track.featuring}</div>}
                          </div>
                          <span style={{ fontSize: 10, color: '#333', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{track.dur}</span>
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
