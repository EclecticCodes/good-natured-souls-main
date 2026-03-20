"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { PageWrapper } from '../../Components/PageWrapper';
import Header from '../../Components/Header';
import Icon from '../../Components/Icon';

type Show = {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  city: string;
  price: number;
  ticketUrl?: string;
  ticketPlatform: string;
  soldOut: boolean;
  description?: string;
  flyer?: string;
};

const PLATFORM_LABELS: Record<string, string> = {
  stripe: 'Buy Tickets Here',
  ticketmaster: 'Get Tickets on Ticketmaster',
  eventbrite: 'Get Tickets on Eventbrite',
  dice: 'Get Tickets on Dice',
  posh: 'Get Tickets on Posh',
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

const PlatformEmbed = ({ platform, ticketUrl }: { platform: string; ticketUrl?: string }) => {
  if (!ticketUrl) return null;

  if (platform === 'dice') {
    return (
      <div className='border border-secondaryInteraction p-4 mt-4'>
        <p className='font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3'>Available on Dice</p>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-full flex items-center justify-center' style={{ background: '#fa2d48' }}>
            <span className='text-white text-xs font-bold'>D</span>
          </div>
            <a
            href={ticketUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-oswald text-sm tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity'
            style={{ background: '#fa2d48' }}
          >
            OPEN IN DICE ↗
          </a>
        </div>
      </div>
    );
  }

  if (platform === 'posh') {
    return (
      <div className='border border-secondaryInteraction p-4 mt-4'>
        <p className='font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3'>Available on Posh</p>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-full flex items-center justify-center' style={{ background: '#7c3aed' }}>
            <span className='text-white text-xs font-bold'>P</span>
          </div>
            <a
            href={ticketUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-oswald text-sm tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity'
            style={{ background: '#7c3aed' }}
          >
            OPEN IN POSH ↗
          </a>
        </div>
      </div>
    );
  }

  if (platform === 'eventbrite') {
    return (
      <div className='border border-secondaryInteraction p-4 mt-4'>
        <p className='font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3'>Available on Eventbrite</p>
          <a
          href={ticketUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='font-oswald text-sm tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity inline-block'
          style={{ background: '#f05537' }}
        >
          OPEN IN EVENTBRITE ↗
        </a>
      </div>
    );
  }

  if (platform === 'ticketmaster') {
    return (
      <div className='border border-secondaryInteraction p-4 mt-4'>
        <p className='font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3'>Available on Ticketmaster</p>
          <a
          href={ticketUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='font-oswald text-sm tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity inline-block'
          style={{ background: '#026cdf' }}
        >
          OPEN IN TICKETMASTER ↗
        </a>
      </div>
    );
  }

  return null;
};

export default function ShowPage({ params }: { params: { id: string } }) {
  const { addItem, items } = useCart();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isInCart = show ? items.some((i) => i.id === `strapi-${show.id}`) : false;

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${strapiUrl}/api/shows/${params.id}?populate=flyer`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const json = await res.json();
        const item = json.data;
        setShow({
          id: String(item.id),
          title: item.attributes.title,
          artist: item.attributes.artist,
          date: item.attributes.date,
          venue: item.attributes.venue,
          city: item.attributes.city,
          price: item.attributes.price || 0,
          ticketUrl: item.attributes.ticketUrl || null,
          ticketPlatform: item.attributes.ticketPlatform || 'stripe',
          soldOut: item.attributes.soldOut || false,
          description: item.attributes.description || null,
          flyer: item.attributes.flyer?.data?.attributes?.url
            ? `${strapiUrl}${item.attributes.flyer.data.attributes.url}`
            : null,
        });
      } catch { setNotFound(true); }
      setLoading(false);
    };
    fetchShow();
  }, [params.id]);

  const handleBuyTicket = () => {
    if (!show || show.soldOut) return;
    if (show.ticketPlatform !== 'stripe' && show.ticketUrl) {
      window.open(show.ticketUrl, '_blank');
    } else {
      addItem({ id: `strapi-${show.id}`, name: `${show.title} — ${show.venue}`, price: show.price, quantity: 1, type: 'ticket' });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  if (loading) return (
    <PageWrapper>
      <div className='min-h-screen flex items-center justify-center'>
        <p className='font-oswald text-gray-500 tracking-widest animate-pulse'>LOADING...</p>
      </div>
    </PageWrapper>
  );

  if (notFound || !show) return (
    <PageWrapper>
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <p className='font-oswald text-2xl tracking-widest'>SHOW NOT FOUND</p>
        <a href='/shows' className='text-accent font-oswald tracking-widest hover:underline'>BACK TO SHOWS</a>
      </div>
    </PageWrapper>
  );

  const d = formatDate(show.date);
  const label = PLATFORM_LABELS[show.ticketPlatform] || 'Get Tickets';
  const isExternal = show.ticketPlatform !== 'stripe';
  const platformColor = PLATFORM_COLORS[show.ticketPlatform] || '#F0B51E';

  return (
    <PageWrapper>
      <main className='min-h-screen'>
        <Header>
          <a href='/shows' className='font-oswald font-bold text-2xl hover:underline inline-flex flex-row items-center gap-4'>
            <Icon name='chevronLeft' />
            Back to Shows
          </a>
        </Header>

        <div className='max-w-4xl mx-auto px-4 py-8'>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='aspect-square bg-primary border border-secondaryInteraction flex items-center justify-center overflow-hidden'>
              {show.flyer ? (
                <img src={show.flyer} alt={show.title} className='w-full h-full object-cover' />
              ) : (
                <div className='flex flex-col items-center gap-4'>
                  <div className='w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-secondaryInteraction'>
                    <div className='w-8 h-8 rounded-full bg-accent' />
                  </div>
                  <p className='font-oswald text-gray-600 tracking-widest text-sm'>NO FLYER</p>
                </div>
              )}
            </div>

            <div className='flex flex-col gap-4'>
              <div>
                <p className='text-accent font-oswald text-sm tracking-widest uppercase mb-1'>{show.artist}</p>
                <h1 className='font-oswald text-4xl font-bold mb-2'>{show.title}</h1>
                <p className='text-gray-400 text-sm'>{d.full} · {d.time}</p>
              </div>

              <div className='border border-secondaryInteraction p-4 flex flex-col gap-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Venue</span>
                  <span>{show.venue}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Location</span>
                  <span>{show.city}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Platform</span>
                  <span className='capitalize'>{show.ticketPlatform}</span>
                </div>
                <div className='flex justify-between text-sm border-t border-secondaryInteraction pt-2 mt-1'>
                  <span className='text-gray-500'>Price</span>
                  <span className='font-oswald text-xl font-bold text-accent'>
                    {show.soldOut ? 'SOLD OUT' : show.price === 0 ? 'FREE' : `$${show.price.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {!show.soldOut && (
                isInCart ? (
                  <a href='/checkout' className='text-center bg-secondaryInteraction text-accent border border-accent font-oswald font-bold py-4 tracking-widest hover:bg-accent hover:text-primary transition-colors'>
                    VIEW CART
                  </a>
                ) : (
                  <button
                    onClick={handleBuyTicket}
                    style={isExternal ? { background: platformColor, color: '#fff' } : {}}
                    className={`font-oswald font-bold py-4 tracking-widest transition-colors ${!isExternal ? 'bg-accent text-primary hover:bg-accentInteraction' : 'hover:opacity-90'}`}
                  >
                    {label.toUpperCase()} {isExternal ? '↗' : ''}
                  </button>
                )
              )}

              {show.soldOut && (
                <div className='border border-secondaryInteraction p-4 text-center'>
                  <p className='font-oswald text-gray-500 tracking-widest'>SOLD OUT</p>
                </div>
              )}

              <PlatformEmbed platform={show.ticketPlatform} ticketUrl={show.ticketUrl} />
            </div>
          </div>

          {show.description && (
            <div className='mt-8 border-t border-secondaryInteraction pt-8'>
              <h2 className='font-oswald text-xl font-bold tracking-widest uppercase mb-4'>About This Show</h2>
              <p className='text-gray-400 leading-relaxed'>{show.description}</p>
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
