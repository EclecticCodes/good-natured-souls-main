"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

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
};

const PLATFORM_COLORS: Record<string, string> = {
  ticketmaster: '#026cdf',
  eventbrite: '#f05537',
  dice: '#fa2d48',
  posh: '#7c3aed',
  stripe: '#F0B51E',
  other: '#F0B51E',
};

const FeaturedShows = () => {
  const { addItem, items } = useCart();
  const [shows, setShows] = useState<Show[]>([]);
  const isInCart = (id: string) => items.some((i) => i.id === id);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${strapiUrl}/api/shows?sort=date:asc&populate=flyer&pagination[limit]=3&publicationState=live`);
        if (res.ok) {
          const json = await res.json();
          setShows((json.data || []).map((item: any) => ({
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
          })));
        }
      } catch {}
    };
    fetchShows();
  }, []);

  if (shows.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-2xl md:text-4xl font-bold">UPCOMING SHOWS</h2>
          <a href="/shows" className="font-oswald text-xs tracking-widest text-accent hover:underline shrink-0 ml-4">
            VIEW ALL
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {shows.map((show) => {
            const d = formatDate(show.date);
            const inCart = isInCart(show.id);
            const isExternal = show.ticketPlatform !== 'stripe';
            const platformColor = PLATFORM_COLORS[show.ticketPlatform] || '#F0B51E';

            return (
              <motion.div
                key={show.id}
                className="border border-secondaryInteraction hover:border-accent transition-colors duration-200 flex"
                whileHover={{ x: 2 }}
              >
                {/* Date block */}
                <div className="bg-secondaryInteraction flex flex-col items-center justify-center px-4 py-3 min-w-[64px]">
                  <span className="font-oswald text-xs text-gray-500 uppercase">{d.day}</span>
                  <span className="font-oswald text-2xl md:text-3xl font-bold text-accent leading-none">{d.date}</span>
                  <span className="font-oswald text-xs text-gray-400 uppercase">{d.month}</span>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2">
                  <div className="min-w-0">
                    <p className="text-accent font-oswald text-xs tracking-widest uppercase">{show.artist}</p>
                    <h3 className="font-oswald text-base md:text-lg font-bold truncate">
                      <a href={`/shows/${show.id.replace('strapi-', '')}`} className="hover:text-accent transition-colors">
                        {show.title}
                      </a>
                    </h3>
                    <p className="text-gray-500 text-xs">{show.venue} · {show.city} · {d.time}</p>
                  </div>

                  {/* Price + ticket */}
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-oswald text-lg font-bold text-accent">
                      {show.soldOut ? 'SOLD OUT' : show.price === 0 ? 'FREE' : `$${show.price.toFixed(2)}`}
                    </p>
                    {!show.soldOut && (
                      inCart ? (
                        <a href="/checkout" className="font-oswald text-xs font-bold px-3 py-2 tracking-widest border border-accent text-accent hover:bg-accent hover:text-primary transition-colors whitespace-nowrap">
                          CART
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            if (isExternal && show.ticketUrl) window.open(show.ticketUrl, '_blank');
                            else addItem({ id: show.id, name: `${show.title} — ${show.venue}`, price: show.price, quantity: 1, type: 'ticket' });
                          }}
                          style={isExternal ? { background: platformColor, color: '#fff' } : {}}
                          className={`font-oswald text-xs font-bold px-3 py-2 tracking-widest transition-colors whitespace-nowrap ${!isExternal ? 'bg-accent text-primary hover:bg-accentInteraction' : 'hover:opacity-90'}`}
                        >
                          TICKETS {isExternal ? '↗' : ''}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedShows;