"use client";
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

type ProductType = 'digital' | 'vinyl' | 'tees' | 'hoodies' | 'accessories';

type Product = {
  id: string;
  name: string;
  artist: string;
  price: number;
  type: ProductType;
  meta: string;
  bandcamp?: string;
  tracks?: { num: number; name: string; dur: string }[];
};

const products: Product[] = [
  {
    id: 'still-alive-digital',
    name: 'STILL ALIVE.',
    artist: 'Prince Inspiration',
    price: 9.99,
    type: 'digital',
    meta: '8 tracks · Hip-Hop / R&B · The Bronx, NY · MP3 + FLAC',
    bandcamp: 'https://princeinspiration.bandcamp.com/album/still-alive',
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

const StoreComponent = ({ activeCategory = 'all' }: { activeCategory?: string }) => {
  const { addItem, items } = useCart();
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.type === activeCategory);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistEmail, setWishlistEmail] = useState('');

  const handleWishlist = async (product: Product) => {
    if (wishlist.includes(product.id)) return;
    const email = wishlistEmail || window.prompt('Enter your email to save to wishlist:');
    if (!email || !email.includes('@')) return;
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId: product.id, productName: product.name }),
    });
    setWishlist((prev) => [...prev, product.id]);
    try {
      const existing = JSON.parse(localStorage.getItem('gns-wishlist') || '[]');
      existing.push({ id: product.id, name: product.name, type: product.type, price: product.price });
      localStorage.setItem('gns-wishlist', JSON.stringify(existing));
    } catch {}
    setWishlistEmail(email);
  };

  const isInCart = (id: string) => items.some((i) => i.id === id);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, type: product.type });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setSubError('Please enter a valid email.'); return; }
    await fetch('/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSubscribed(true);
    setSubError('');
  };

  const categoryLabel = activeCategory === 'all' ? 'All Products' : CATEGORY_LABELS[activeCategory] || activeCategory;

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <h2 className='font-oswald text-xl font-bold tracking-widest uppercase mb-6 text-accent border-b border-secondaryInteraction pb-3'>
        {categoryLabel}
      </h2>

      {filtered.length === 0 ? (
        <div className='border border-secondaryInteraction p-12 text-center mb-12'>
          <p className='font-oswald text-2xl font-bold tracking-widest uppercase mb-3'>
            {CATEGORY_LABELS[activeCategory] || activeCategory} Coming Soon
          </p>
          <p className='text-gray-500 text-sm tracking-wide mb-6'>
            We are working on bringing you amazing {CATEGORY_LABELS[activeCategory]?.toLowerCase() || activeCategory}. Sign up below to be notified when new items drop.
          </p>
          {subscribed ? (
            <div className='border border-accent p-4 max-w-md mx-auto'>
              <p className='font-oswald text-accent tracking-widest'>YOU ARE ON THE LIST</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                className='flex-1 bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600'
              />
              <button type='submit' className='bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors'>
                NOTIFY ME
              </button>
            </form>
          )}
          {subError && <p className='text-red-500 text-sm mt-3'>{subError}</p>}
        </div>
      ) : (
        <div className='grid md:grid-cols-2 gap-6 mb-16'>
          {filtered.map((product) => (
            <div key={product.id} className='border border-secondaryInteraction hover:border-accent transition-colors duration-200'>
              <div className='w-full aspect-square bg-primary flex items-center justify-center relative'>
                <div className='w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-secondaryInteraction'>
                  <div className='w-10 h-10 rounded-full bg-accent' />
                </div>
                <span className='absolute top-3 left-3 bg-accent text-primary font-oswald text-xs font-bold px-2 py-1 tracking-widest'>NEW</span>
              </div>
              <div className='p-5'>
                <p className='text-accent font-oswald text-xs tracking-widest uppercase mb-1'>{product.artist}</p>
                <h3 className='font-oswald text-2xl font-bold mb-1'>{product.name}</h3>
                <p className='text-sm text-gray-500 mb-4'>{product.meta}</p>
                {product.tracks && (
                  <div className='mb-4'>
                    {product.tracks.map((t) => (
                      <div key={t.num} className='flex items-center gap-2 py-1 border-b border-secondaryInteraction text-sm text-gray-400 hover:text-accent transition-colors last:border-0'>
                        <span className='w-5 text-xs text-gray-600'>{t.num}</span>
                        <span className='flex-1'>{t.name}</span>
                        <span className='text-xs text-gray-600'>{t.dur}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className='flex items-center justify-between pt-4 border-t border-secondaryInteraction'>
                  <div>
                    <p className='font-oswald text-2xl font-bold text-accent'>${product.price.toFixed(2)}</p>
                    <p className='text-xs text-gray-600'>
                      {product.type === 'digital' ? 'Digital Album + Download' : product.type}
                    </p>
                  </div>
                  {isInCart(product.id) ? (
                    <a href='/checkout' className='bg-secondaryInteraction text-accent border border-accent font-oswald text-sm font-bold px-5 py-2 tracking-widest hover:bg-accent hover:text-primary transition-colors'>
                      VIEW CART
                    </a>
                  ) : (
                    <button onClick={() => handleAddToCart(product)} className='bg-accent text-primary font-oswald text-sm font-bold px-5 py-2 tracking-widest hover:bg-accentInteraction transition-colors'>
                      ADD TO CART
                    </button>
                  )}
                </div>
                  <button
                    onClick={() => handleWishlist(product)}
                    className={'mt-2 w-full font-oswald text-xs tracking-widest py-2 border transition-colors ' + (wishlist.includes(product.id) ? 'border-accent text-accent cursor-default' : 'border-secondaryInteraction text-gray-500 hover:border-accent hover:text-accent')}
                  >
                    {wishlist.includes(product.id) ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}
                  </button>
                {product.bandcamp && (
                  <a href={product.bandcamp} target='_blank' rel='noopener noreferrer' onClick={(e) => { e.stopPropagation(); window.open(product.bandcamp, '_blank'); }} className='block text-center mt-3 text-xs text-gray-600 hover:text-accent transition-colors tracking-wider'>
                    Preview on Bandcamp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className='border border-secondaryInteraction p-8 text-center mb-12'>
          <h2 className='font-oswald text-2xl font-bold tracking-widest uppercase mb-3'>Physical Merch</h2>
          <p className='text-gray-500 text-lg mb-2'>Coming Soon</p>
          <p className='text-gray-600 text-sm tracking-wide'>Tees, hoodies, vinyl and more are currently in the works.</p>
        </div>
      )}

      <div className='border border-secondaryInteraction p-8 text-center'>
        <h2 className='font-oswald text-2xl font-bold tracking-widest uppercase mb-2'>Stay in the Loop</h2>
        <p className='text-gray-500 text-sm mb-6'>Be first to know about new drops, merch releases, and exclusive offers.</p>
        {subscribed ? (
          <div className='border border-accent p-4 max-w-md mx-auto'>
            <p className='font-oswald text-accent tracking-widest'>YOU ARE ON THE LIST</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
              className='flex-1 bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600'
            />
            <button type='submit' className='bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors'>
              SUBSCRIBE
            </button>
          </form>
        )}
        {subError && <p className='text-red-500 text-sm mt-3'>{subError}</p>}
      </div>
    </div>
  );
};

export default StoreComponent;
