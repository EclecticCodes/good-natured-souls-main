"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MarqueeItem = {
  id: string;
  text: string;
  type: "news" | "lyric" | "fact" | "show" | "artist" | "custom";
  section: "global" | "jumbotron" | "description" | "newmusic" | "artists" | "shows" | "products";
  active: boolean;
  featured: boolean;
  emoji?: string;
};

const TYPE_ICONS: Record<string, string> = {
  news: "📰",
  lyric: "🎵",
  fact: "💡",
  show: "🎤",
  artist: "⭐",
  custom: "✦",
};

const TYPE_LABELS: Record<string, string> = {
  news: "BREAKING",
  lyric: "NOW PLAYING",
  fact: "DID YOU KNOW",
  show: "UPCOMING SHOW",
  artist: "ARTIST SPOTLIGHT",
  custom: "GNS",
};

const DEFAULT_ITEMS: MarqueeItem[] = [
  { id: "d1", text: "Good Natured Souls", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d2", text: "Elevating Music & Culture", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d3", text: "Discover New Artists", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d4", text: "Support Independent Music", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d5", text: "New York City", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d6", text: "Hip Hop & R&B", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
  { id: "d7", text: "Join Our Movement", type: "custom", section: "global", active: true, featured: false, emoji: "✦" },
];

// Shared fetch — cached in module scope so all Marquee instances share one request
let cachedItems: MarqueeItem[] | null = null;
let fetchPromise: Promise<MarqueeItem[]> | null = null;

async function fetchMarqueeItems(): Promise<MarqueeItem[]> {
  if (cachedItems) return cachedItems;
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const res = await fetch(
        `${strapiUrl}/api/marquee-items?filters[active][$eq]=true&sort=createdAt:desc`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json();
        const fetched = (json.data || []).map((item: any) => ({
          id: String(item.id),
          text: item.attributes.text,
          type: item.attributes.type || "custom",
          section: item.attributes.section || "global",
          active: item.attributes.active,
          featured: item.attributes.featured || false,
          emoji: item.attributes.emoji || null,
        }));
        cachedItems = fetched.length > 0 ? fetched : DEFAULT_ITEMS;
        return cachedItems;
      }
    } catch {}
    cachedItems = DEFAULT_ITEMS;
    return cachedItems;
  })();
  return fetchPromise;
}

type Props = {
  section?: "global" | "jumbotron" | "description" | "newmusic" | "artists" | "shows" | "products";
};

const Marquee = ({ section = "global" }: Props) => {
  const [allItems, setAllItems] = useState<MarqueeItem[]>(DEFAULT_ITEMS);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    fetchMarqueeItems().then(setAllItems);
    // Reset cache after 60s so fresh data loads on next visit
    const t = setTimeout(() => { cachedItems = null; fetchPromise = null; }, 60000);
    return () => clearTimeout(t);
  }, []);

  // Filter: show items for this section OR global items
  const sectionItems = allItems.filter(
    (i) => i.section === "global" || i.section === section
  );

  // Fall back to defaults if no items match this section
  const displayItems = sectionItems.length > 0 ? sectionItems : DEFAULT_ITEMS;
  const featuredItems = displayItems.filter((i) => i.featured);

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  const scrollItems = [...displayItems, ...displayItems, ...displayItems];
  const currentFeatured = featuredItems[featuredIndex];

  return (
    <div className="w-full">
      {/* Featured spotlight — only when featured items exist for this section */}
      {featuredItems.length > 0 && currentFeatured && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeatured.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-primary border-b border-secondaryInteraction py-2 px-4 flex items-center justify-center gap-3"
          >
            <span className="text-accent font-oswald text-xs tracking-widest uppercase shrink-0">
              {TYPE_LABELS[currentFeatured.type] || "GNS"}
            </span>
            <span className="text-white/80 font-oswald text-sm tracking-wide text-center">
              {currentFeatured.emoji || TYPE_ICONS[currentFeatured.type]}{" "}
              {currentFeatured.text}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Continuous scroll bar — always visible */}
      <div className="overflow-hidden whitespace-nowrap bg-accent text-primary py-2 w-full">
        <motion.div
          className="flex text-sm font-oswald font-bold tracking-widest"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {scrollItems.map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className="mx-8 flex items-center gap-2 shrink-0"
            >
              <span>{item.emoji || TYPE_ICONS[item.type]}</span>
              <span>{item.text}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;