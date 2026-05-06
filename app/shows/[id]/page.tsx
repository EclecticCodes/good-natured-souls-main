"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '../../context/CartContext';
import { PageWrapper } from '../../Components/PageWrapper';
import Header from '../../Components/Header';
import Icon from '../../Components/Icon';
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
  ticketPlatform: string;
  showOwner: 'gns' | 'third_party';
  onSaleAt?: string;
  status: string;
  soldOut: boolean;
  description?: string;
  flyer?: string;
  venueAddress?: string;
  capacity?: number;
};

const PLATFORM_LABELS: Record<string, string> = {
  stripe:        'Buy Tickets',
  ticketmaster:  'Get Tickets on Ticketmaster',
  eventbrite:    'Get Tickets on Eventbrite',
  dice:          'Get Tickets on Dice',
  posh:          'Get Tickets on Posh',
  other:         'Get Tickets',
};

const PLATFORM_COLORS: Record<string, string> = {
  ticketmaster: '#026cdf',
  eventbrite:   '#f05537',
  dice:         '#fa2d48',
  posh:         '#7c3aed',
  stripe:       '#F0B51E',
  other:        '#F0B51E',
};

// ── Ticket availability logic ─────────────────────────────────

function getTicketState(show: Show): {
  canBuy: boolean;
  reason: string | null;
} {
  const now       = new Date();
  const showDate  = new Date(show.date);
  const onSaleAt  = show.onSaleAt ? new Date(show.onSaleAt) : null;

  if (show.status !== 'approved') {
    return { canBuy: false, reason: 'Tickets not yet available' };
  }
  if (show.soldOut) {
    return { canBuy: false, reason: 'Sold Out' };
  }
  if (showDate < now) {
    return { canBuy: false, reason: 'This show has already happened' };
  }
  if (onSaleAt && onSaleAt > now) {
    const diff   = onSaleAt.getTime() - now.getTime()
    const days   = Math.floor(diff / 86400000)
    const hours  = Math.floor((diff % 86400000) / 3600000)
    const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`
    return { canBuy: false, reason: `On sale in ${timeStr}` };
  }
  if (show.showOwner === 'gns' && show.price === 0) {
    return { canBuy: false, reason: 'Invalid ticket price' };
  }
  return { canBuy: true, reason: null };
}

// ── External platform embed ───────────────────────────────────

const PlatformEmbed = ({ platform, ticketUrl }: { platform: string; ticketUrl?: string }) => {
  if (!ticketUrl || platform === 'stripe') return null;
  const color = PLATFORM_COLORS[platform] || '#888';
  const name  = platform.charAt(0).toUpperCase() + platform.slice(1);
  return (
    <div className="border border-secondaryInteraction p-4 mt-4">
      <p className="font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3">
        Available on {name}
      </p>
      <a href={ticketUrl} target="_blank" rel="noopener noreferrer"
        className="font-oswald text-sm tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity inline-block"
        style={{ background: color }}>
        OPEN IN {name.toUpperCase()} ↗
      </a>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────

export default function ShowPage({ params: paramsRaw }: any) {
  const [resolvedId, setResolvedId] = useState<string>('');
  useEffect(() => {
    Promise.resolve(paramsRaw).then((p: any) => setResolvedId(p.id));
  }, [paramsRaw]);

  const { addItem, items } = useCart();
  const { data: session } = useSession();
  const [show, setShow]         = useState<Show | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rsvpTypes, setRsvpTypes]   = useState<string[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpToast, setRsvpToast]   = useState('');

  const isInCart = show ? items.some(i => i.id === `strapi-${show.id}`) : false;

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://gns-cms-production.up.railway.app';
        const res  = await fetch(`${strapiUrl}/api/shows/${resolvedId}?populate=flyer`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const json = await res.json();
        const item = json.data;
        const attrs = item.attributes;
        setShow({
          id:             String(item.id),
          title:          attrs.title,
          artist:         attrs.artist,
          date:           attrs.date,
          venue:          attrs.venue,
          city:           attrs.city,
          price:          attrs.price || 0,
          ticketUrl:      attrs.ticketUrl || null,
          ticketPlatform: attrs.ticketPlatform || 'stripe',
          showOwner:      attrs.showOwner || 'gns',
          onSaleAt:       attrs.onSaleAt || null,
          status:         attrs.status || 'approved',
          soldOut:        attrs.soldOut || false,
          description:    attrs.description || null,
          venueAddress:   attrs.venueAddress || null,
          capacity:       attrs.capacity || 0,
          flyer:          attrs.flyer?.data?.attributes?.url
            ? resolveUrl(attrs.flyer.data.attributes.url, strapiUrl)
            : null,
        });
      } catch { setNotFound(true); }
      setLoading(false);
    };
    if (resolvedId) fetchShow();
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId || !session?.user?.email) return;
    fetch(`/api/show-rsvp?show_id=${resolvedId}`)
      .then(r => r.json())
      .then(d => setRsvpTypes((d.rsvps || []).map((r: any) => r.type)));
  }, [resolvedId, session]);

  const handleRsvp = async (type: string) => {
    if (!session) { window.location.href = '/auth/login'; return; }
    setRsvpLoading(true);
    await fetch('/api/show-rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_id: resolvedId, show_title: show?.title, type }),
    });
    setRsvpTypes(prev => [...prev, type]);
    setRsvpToast(
      type === 'presale' ? 'Added to presale list!' :
      type === 'rsvp'    ? 'RSVP confirmed!' :
      "You'll be notified when tickets drop!"
    );
    setTimeout(() => setRsvpToast(''), 3000);
    setRsvpLoading(false);
  };

  const handleBuyTicket = () => {
    if (!show) return;
    const { canBuy } = getTicketState(show);
    if (!canBuy) return;

    // Third party — route to external URL
    if (show.showOwner === 'third_party' || show.ticketPlatform !== 'stripe') {
      if (show.ticketUrl) window.open(show.ticketUrl, '_blank');
      return;
    }

    // GNS internal — add to cart → Stripe checkout
    addItem({
      id:       `strapi-${show.id}`,
      name:     `${show.title} — ${show.venue} [ticket]`,
      price:    show.price,
      quantity: 1,
      type:     'ticket',
    });
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-oswald text-gray-500 tracking-widest animate-pulse">LOADING...</p>
      </div>
    </PageWrapper>
  );

  if (notFound || !show) return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-oswald text-2xl tracking-widest">SHOW NOT FOUND</p>
        <a href="/shows" className="text-accent font-oswald tracking-widest hover:underline">BACK TO SHOWS</a>
      </div>
    </PageWrapper>
  );

  const d                    = formatDate(show.date);
  const { canBuy, reason }   = getTicketState(show);
  const isExternal           = show.showOwner === 'third_party' || show.ticketPlatform !== 'stripe';
  const label                = PLATFORM_LABELS[show.ticketPlatform] || 'Get Tickets';
  const platformColor        = PLATFORM_COLORS[show.ticketPlatform] || '#F0B51E';
  const isPast               = new Date(show.date) < new Date();

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <a href="/shows" className="font-oswald font-bold text-2xl hover:underline inline-flex flex-row items-center gap-4">
            <Icon name="chevronLeft" />
            Back to Shows
          </a>
        </Header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Flyer */}
            <div className="aspect-square bg-primary border border-secondaryInteraction flex items-center justify-center overflow-hidden relative">
              {show.flyer ? (
                <img src={show.flyer} alt={show.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-secondaryInteraction">
                    <div className="w-8 h-8 rounded-full bg-accent" />
                  </div>
                  <p className="font-oswald text-gray-600 tracking-widest text-sm">NO FLYER</p>
                </div>
              )}
              {/* Show owner badge */}
              <div className="absolute top-3 left-3">
                {show.showOwner === 'gns' ? (
                  <span className="font-oswald text-xs tracking-widest bg-accent text-primary px-2 py-1 font-bold">GNS PRESENTS</span>
                ) : (
                  <span className="font-oswald text-xs tracking-widest bg-gray-800 text-gray-400 px-2 py-1 border border-gray-700">3RD PARTY</span>
                )}
              </div>
              {isPast && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-oswald text-xl tracking-widest text-gray-400 border border-gray-600 px-4 py-2">PAST EVENT</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-accent font-oswald text-sm tracking-widest uppercase mb-1">{show.artist}</p>
                <h1 className="font-oswald text-4xl font-bold mb-2">{show.title}</h1>
                <p className="text-gray-400 text-sm">{d.full} · {d.time}</p>
              </div>

              {/* Info block */}
              <div className="border border-secondaryInteraction p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Venue</span>
                  {show.venueAddress ? (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.venueAddress)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1">
                      {show.venue} <span style={{ fontSize: 10 }}>↗</span>
                    </a>
                  ) : <span>{show.venue}</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span>{show.city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hosted by</span>
                  <span className={show.showOwner === 'gns' ? 'text-accent font-bold' : 'text-gray-400'}>
                    {show.showOwner === 'gns' ? 'Good Natured Souls' : '3rd Party'}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-secondaryInteraction pt-2 mt-1">
                  <span className="text-gray-500">Price</span>
                  <span className="font-oswald text-xl font-bold text-accent">
                    {show.soldOut ? 'SOLD OUT' : show.price === 0 ? 'FREE' : `$${show.price.toFixed(2)}`}
                  </span>
                </div>
                {show.onSaleAt && new Date(show.onSaleAt) > new Date() && (
                  <div className="flex justify-between text-sm border-t border-secondaryInteraction pt-2 mt-1">
                    <span className="text-gray-500">On Sale</span>
                    <span className="text-accent font-oswald text-sm">
                      {new Date(show.onSaleAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Ticket CTA */}
              {!isPast && (
                <>
                  {isInCart ? (
                    <a href="/checkout"
                      className="text-center bg-secondaryInteraction text-accent border border-accent font-oswald font-bold py-4 tracking-widest hover:bg-accent hover:text-primary transition-colors">
                      VIEW CART →
                    </a>
                  ) : canBuy ? (
                    <button onClick={handleBuyTicket}
                      style={isExternal ? { background: platformColor, color: '#fff' } : {}}
                      className={`font-oswald font-bold py-4 tracking-widest transition-colors ${!isExternal ? 'bg-accent text-primary hover:bg-accentInteraction' : 'hover:opacity-90'}`}>
                      {label.toUpperCase()} {isExternal ? '↗' : ''}
                    </button>
                  ) : (
                    <div className="border border-secondaryInteraction p-4 text-center">
                      <p className="font-oswald text-gray-500 tracking-widest text-sm">{reason}</p>
                    </div>
                  )}
                </>
              )}

              {isPast && (
                <div className="border border-secondaryInteraction p-4 text-center">
                  <p className="font-oswald text-gray-500 tracking-widest text-sm">THIS SHOW HAS PASSED</p>
                </div>
              )}

              {!isPast && isExternal && show.ticketUrl && (
                <PlatformEmbed platform={show.ticketPlatform} ticketUrl={show.ticketUrl} />
              )}

              {/* RSVP — only for non-past, non-3rd-party or free shows */}
              {!isPast && (
                <div className="border border-secondaryInteraction p-4 mt-2">
                  <p className="font-oswald text-xs tracking-widest text-gray-500 uppercase mb-3">More Options</p>
                  <div className="flex flex-col gap-2">
                    {!rsvpTypes.includes('rsvp') ? (
                      <button onClick={() => handleRsvp('rsvp')} disabled={rsvpLoading}
                        className="font-oswald text-xs font-bold px-4 py-2.5 tracking-widest border border-accent text-accent hover:bg-accent hover:text-primary transition-colors w-full">
                        ✓ RSVP — I'M GOING
                      </button>
                    ) : (
                      <div className="font-oswald text-xs text-accent tracking-widest px-4 py-2.5 border border-accent/40 text-center">✓ RSVP CONFIRMED</div>
                    )}
                    {!rsvpTypes.includes('notify') ? (
                      <button onClick={() => handleRsvp('notify')} disabled={rsvpLoading}
                        className="font-oswald text-xs font-bold px-4 py-2.5 tracking-widest border border-secondaryInteraction text-gray-400 hover:border-accent hover:text-accent transition-colors w-full">
                        🔔 NOTIFY ME
                      </button>
                    ) : (
                      <div className="font-oswald text-xs text-gray-500 tracking-widest px-4 py-2.5 border border-secondaryInteraction text-center">✓ NOTIFICATIONS ON</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {show.description && (
            <div className="mt-8 border-t border-secondaryInteraction pt-8">
              <h2 className="font-oswald text-xl font-bold tracking-widest uppercase mb-4">About This Show</h2>
              <p className="text-gray-400 leading-relaxed">{show.description}</p>
            </div>
          )}
        </div>
      </main>

      {rsvpToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary border border-accent text-white font-oswald text-xs px-6 py-3 tracking-widest z-50 whitespace-nowrap">
          {rsvpToast}
        </div>
      )}
    </PageWrapper>
  );
}
