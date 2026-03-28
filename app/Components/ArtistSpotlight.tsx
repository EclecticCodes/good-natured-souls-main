"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveUrl } from '@/lib/resolveUrl';

type SpotlightArtist = {
  id: string;
  name: string;
  slug: string;
  profileImage: string;
  backgroundImage?: string;
  about?: string;
};

const ArtistSpotlight = () => {
  const [artists, setArtists] = useState<SpotlightArtist[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

    fetch(`${strapiUrl}/api/artists?populate=profileImage,backgroundImage&filters[isSpotlight][$eq]=true&sort=orderRank:asc`)
      .then((r) => r.json())
      .then((json) => {
        setArtists((json.data || []).map((item: any) => ({
          id: String(item.id),
          name: item.attributes.name,
          slug: item.attributes.slug,
          about: item.attributes.about || null,
          profileImage: item.attributes.profileImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl) : "",
          backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.backgroundImage.data.attributes.url, strapiUrl) : undefined,
        })));
      })
      .catch(() => {});
  }, []);

  if (artists.length === 0) return null;

  const active = artists[activeIndex];
  const bg = active.backgroundImage || active.profileImage;

  return (
    <section className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center md:items-end gap-8">
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-oswald text-yellow-500 text-xs tracking-[0.4em] uppercase mb-3 flex items-center gap-2"
          >
            <span>★</span> Artist Spotlight
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id + "-text"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-cormorant font-bold text-4xl md:text-6xl text-white mb-4 leading-tight">
                {active.name}
              </h2>
              {active.about && (
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6 line-clamp-3">
                  {active.about}
                </p>
              )}
              
              <a href={`/artists/${active.slug}`} className="font-oswald text-xs tracking-widest px-6 py-3 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors inline-block">
                DISCOVER ↗
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id + "-img"}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              transition={{ duration: 0.5 }}
              className="w-48 h-48 md:w-64 md:h-64 overflow-hidden border-2 border-yellow-500/50"
            >
              {active.profileImage ? (
                <img src={active.profileImage} alt={active.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondaryInteraction flex items-center justify-center">
                  <span className="font-erica text-4xl text-yellow-500">GNS</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {artists.length > 1 && (
            <div className="flex gap-2">
              {artists.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? "bg-yellow-500 w-6" : "bg-white/30 w-2"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArtistSpotlight;
