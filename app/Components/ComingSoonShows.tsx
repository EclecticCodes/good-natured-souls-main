"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { resolveUrl } from '@/lib/resolveUrl';

type Show = {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  city: string;
  price: number;
  ticketUrl?: string;
  ticketPlatform: 'stripe' | 'ticketmaster' | 'eventbrite' | 'dice' | 'posh' | 'other';
  source: 'strapi';
  soldOut?: boolean;
  flyer?: string;
  venueAddress?: string;
};

const PLATFORM_LABELS: Record<string, string> = {
  stripe: 'Buy Here',
  ticketmaster: 'Ticketmaster',
  eventbrite: 'Eventbrite',
  dice: 'Dice',
  posh: 'Posh',
  other: 'Get Tickets',
};

const PLATFORM_COLORS: Record<string, string> = {
  ticketmaster: '#026cdf',
  eventbrite: '#f05537',
  dice: '#fa2d48',
  posh: '#7c3aed',
  stripe: '#F0B51E',
  other: '#F0B51E',
};

const ShowsComponent = () => {
  const { addItem, items } = useCart();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

  const isInCart = (id: string) => items.some((i) => i.id === id);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

        const res = await fetch(`${strapiUrl}/api/shows?sort=date:asc&populate=flyer&publicationState=live`);
        if (res.ok) {
          const json = await res.json();
          const strapiShows = (json.data || []).map((item: any) => ({
            id: `strapi-${item.id}`,
            title: item.attributes.title,
            artist: item.attributes.artist,
            date: item.attributes.date,
            venue: item.attributes.venue,
            city: item.attributes.city,
            price: item.attributes.price || 0,
            ticketUrl: item.attributes.ticketUrl || null,
            ticketPlatform: item.attributes.ticketPlatform || 'stripe',
            soldOut: item.attributes.soldOut || false,
            venueAddress: item.attributes.venueAddress || null,
            flyer: item.attributes.flyer?.data?.attributes?.url
              ? resolveUrl(item.attributes.flyer.data.attributes.url, strapiUrl)
              : null,
            source: 'strapi' as const,
          }));
          setShows(strapiShows);
        }
      } catch {}
      setLoading(false);
    };
    fetchShows();
  }, []);

  const handleBuyTicket = (show: Show) => {
    if (show.soldOut) return;
    if (show.ticketPlatform !== 'stripe' && show.ticketUrl) {
      window.open(show.ticketUrl, '_blank');
    } else {
      addItem({
        id: show.id,
        name: `${show.title} — ${show.venue}`,
        price: show.price,
        quantity: 1,
        type: 'ticket',
      });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setSubError('Please enter a valid email.'); return; }
    await fetch('/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'shows', consentGiven: true, consentTimestamp: new Date().toISOString() }),
    });
    setSubscribed(true);
    setSubError('');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h2 className='font-oswald text-xl font-bold tracking-widest uppercase mb-6 text-accent border-b border-secondaryInteraction pb-3'>
        Upcoming Shows
      </h2>

      {loading ? (
        <div className='flex flex-col gap-4 mb-12'>
          {[1,2,3].map(i => (
            <div key={i} className='border border-secondaryInteraction flex flex-col sm:flex-row animate-pulse'>
              <div className='bg-secondaryInteraction flex flex-col items-center justify-center px-6 py-4 min-w-[80px] gap-2'>
                <div className='w-8 h-3 bg-primary rounded' />
                <div className='w-10 h-8 bg-primary rounded' />
                <div className='w-8 h-3 bg-primary rounded' />
              </div>
              <div className='flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4'>
                <div className='flex flex-col gap-2'>
                  <div className='w-24 h-3 bg-secondaryInteraction rounded' />
                  <div className='w-48 h-5 bg-secondaryInteraction rounded' />
                  <div className='w-36 h-3 bg-secondaryInteraction rounded' />
                </div>
                <div className='w-24 h-8 bg-secondaryInteraction rounded' />
              </div>
            </div>
          ))}
        </div>
      ) : shows.length === 0 ? (
        <div className='border border-secondaryInteraction p-12 text-center mb-12'>
          <p className='font-oswald text-2xl font-bold tracking-widest mb-3'>NO SHOWS SCHEDULED</p>
          <p className='text-gray-500 text-sm tracking-wide'>GNS artists are hitting stages soon. Sign up below to be first to know.</p>
        </div>
      ) : (
        <div className='flex flex-col gap-4 mb-12'>
          {shows.map((show) => {
            const d = formatDate(show.date);
            const inCart = isInCart(show.id);
            const label = PLATFORM_LABELS[show.ticketPlatform] || 'Get Tickets';
            const isExternal = show.ticketPlatform !== 'stripe';
            const platformColor = PLATFORM_COLORS[show.ticketPlatform] || '#F0B51E';

            return (
              <div key={show.id} className={`border transition-colors duration-200 flex flex-col sm:flex-row ${show.soldOut ? 'border-secondaryInteraction opacity-60' : 'border-secondaryInteraction hover:border-accent'}`}>
                <div className='bg-secondaryInteraction flex flex-col items-center justify-center px-6 py-4 min-w-[80px]'>
                  <span className='font-oswald text-xs text-gray-500 uppercase tracking-widest'>{d.day}</span>
                  <span className='font-oswald text-3xl font-bold text-accent leading-none'>{d.date}</span>
                  <span className='font-oswald text-sm text-gray-400 uppercase'>{d.month}</span>
                  <span className='font-oswald text-xs text-gray-600'>{d.year}</span>
                </div>

                <div className='flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4'>
                  <div>
                    <p className='text-accent font-oswald text-xs tracking-widest uppercase mb-1'>{show.artist}</p>
                    <h3 className='font-oswald text-xl font-bold'>
                      <a href={`/shows/${show.id.replace('strapi-', '')}`} className='hover:text-accent transition-colors'>
                        {show.title}
                      </a>
                    </h3>
                    {show.venueAddress ? (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.venueAddress)}`}
                        target='_blank' rel='noopener noreferrer'
                        className='text-gray-500 text-sm hover:text-accent transition-colors'>
                        {show.venue} · {show.city} ↗
                      </a>
                    ) : (
                      <p className='text-gray-500 text-sm'>{show.venue} · {show.city}</p>
                    )}
                    <p className='text-gray-600 text-xs mt-1'>{d.time}</p>
                  </div>

                  <div className='flex flex-col items-end gap-2 min-w-[140px]'>
                    <p className='font-oswald text-xl font-bold text-accent'>
                      {show.soldOut ? 'SOLD OUT' : show.price === 0 ? 'FREE' : `$${show.price.toFixed(2)}`}
                    </p>
                    {!show.soldOut && (
                      inCart ? (
                        <a href='/checkout' className='bg-secondaryInteraction text-accent border border-accent font-oswald text-xs font-bold px-4 py-2 tracking-widest hover:bg-accent hover:text-primary transition-colors text-center w-full'>
                          VIEW CART
                        </a>
                      ) : (
                        <button
                          onClick={() => handleBuyTicket(show)}
                          style={isExternal ? { background: platformColor, color: '#fff' } : {}}
                          className={`font-oswald text-xs font-bold px-4 py-2 tracking-widest transition-colors w-full ${!isExternal ? 'bg-accent text-primary hover:bg-accentInteraction' : 'hover:opacity-90'}`}
                        >
                          {label.toUpperCase()} {isExternal ? '↗' : ''}
                        </button>
                      )
                    )}
                    <a href={`/shows/${show.id.replace('strapi-', '')}`} className='text-xs text-gray-600 hover:text-accent transition-colors tracking-wider text-center w-full'>
                      VIEW DETAILS
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className='border border-secondaryInteraction p-8 text-center'>
        <h2 className='font-oswald text-2xl font-bold tracking-widest uppercase mb-2'>Get Notified</h2>
        <p className='text-gray-500 text-sm mb-6'>Be first to know when GNS artists announce shows near you.</p>
        {subscribed ? (
          <div className='border border-accent p-4 max-w-md mx-auto'>
            <p className='font-oswald text-accent tracking-widest'>YOU ARE ON THE LIST</p>
            <p className='text-gray-500 text-sm mt-1'>We will hit you when shows drop.</p>
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
    </div>
  );
};

export default ShowsComponent;
