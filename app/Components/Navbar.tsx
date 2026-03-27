"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useSession, signOut } from "next-auth/react";

const headers = [
  { key: "home", name: "Home", route: "/" },
  { key: "artists", name: "Artists", route: "/artists" },
  // { key: "shows", name: "Shows", route: "/shows" },
  { key: "store", name: "Store", route: "/store" },
  // { key: "articles", name: "Articles", route: "/articles" },
  // { key: "fanclub", name: "Fan Club", route: "/fanclub" },
  { key: "about", name: "About", route: "/about" },
];

type Artist = {
  id: string;
  name: string;
  slug: string;
  profileImage: string;
};

type Project = {
  name: string;
  artist: string;
  url: string;
  coverImageUrl: string;
};

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/goodnaturedsouls",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    name: "Twitter/X",
    href: "https://twitter.com/goodnaturedsouls",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "https://discord.gg/tr6Gybnu",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
      </svg>
    ),
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistIndex, setArtistIndex] = useState(0);
  const [latestProject, setLatestProject] = useState<Project | null>(null);
  const { count } = useCart();
  const { data: session } = useSession();
  const isAdminPath = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Handles both local Strapi URLs and absolute Cloudinary URLs
const resolveUrl = (url: string | undefined | null, strapiUrl: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${strapiUrl}${url}`;
};

    fetch(`${strapiUrl}/api/artists?populate=profileImage,backgroundImage&sort=orderRank:asc`)
      .then((r) => r.json())
      .then((json) => {
        setArtists((json.data || []).map((item: any) => ({
          id: String(item.id),
          name: item.attributes.name,
          slug: item.attributes.slug,
          profileImage: item.attributes.backgroundImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.backgroundImage.data.attributes.url, strapiUrl)
            : item.attributes.profileImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl)
            : "",
        })));
      })
      .catch(() => {});

    fetch(`${strapiUrl}/api/projects?populate=cover,artist&sort=createdAt:desc&pagination[limit]=1`)
      .then((r) => r.json())
      .then((json) => {
        const item = json.data?.[0];
        if (item) {
          setLatestProject({
            name: item.attributes.name,
            artist: item.attributes.artist?.data?.attributes?.name || "",
            url: item.attributes.url || "#",
            coverImageUrl: item.attributes.cover?.data?.attributes?.url
              ? resolveUrl(item.attributes.cover.data.attributes.url, strapiUrl)
              : "",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen || artists.length <= 1) return;
    const interval = setInterval(() => {
      setArtistIndex((prev) => (prev + 1) % artists.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [menuOpen, artists.length]);

  useEffect(() => {
    if (!isHome || isAdminPath) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, isAdminPath]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isAdminPath) return null;

  const navBg = isHome
    ? scrolled ? "bg-background/95 backdrop-blur-sm" : "bg-transparent"
    : "bg-background";

  const currentArtist = artists[artistIndex];

  return (
    <>
      <nav className={`${isHome ? "fixed" : "sticky"} top-0 left-0 w-full z-50 transition-all duration-300 ${navBg} border-b ${scrolled || !isHome ? "border-secondaryInteraction" : "border-transparent"}`}>
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">

          <motion.a href="/" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
            <span className="font-erica text-3xl md:text-4xl">GNS</span>
          </motion.a>

          <ul className="hidden md:flex items-center gap-1">
            {headers.map((h) => (
              <li key={h.key}>
                <a href={h.route} className={`font-oswald text-xs tracking-widest px-3 py-2 transition-colors hover:text-accent ${pathname === h.route ? "text-accent border-b border-accent" : "text-white/80"}`}>
                  {h.name.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
{/* Cart */}

            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <>
                  <a href="/profile" className="font-oswald text-xs text-gray-400 hover:text-accent transition-colors truncate max-w-[100px]">{session.user?.name || session.user?.email}</a>
                  <button onClick={() => signOut()} className="font-oswald text-xs tracking-widest text-gray-500 hover:text-accent transition-colors">SIGN OUT</button>
                </>
              ) : (
                <a href="/auth/login" className="font-oswald text-xs tracking-widest text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-primary transition-colors">SIGN IN</a>
              )}
            </div>

            <button className="md:hidden p-2 rounded-sm hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <motion.div animate={{ rotate: menuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                {menuOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 z-40 flex"
          >
            {/* LEFT panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-3/5 h-full bg-background flex flex-col justify-between py-6 px-6 z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-erica text-3xl">GNS</span>
                <button onClick={() => setMenuOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <ul className="flex flex-col gap-1 flex-1">
                {headers.map((h, i) => (
                  <motion.li
                    key={h.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <a
                      href={h.route}
                      onClick={() => setMenuOpen(false)}
                      className={`font-oswald text-xl tracking-widest block py-2.5 border-b border-secondaryInteraction/50 hover:text-accent hover:pl-2 transition-all duration-200 ${pathname === h.route ? "text-accent" : "text-white/80"}`}
                    >
                      {h.name.toUpperCase()}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex flex-col gap-4"
              >
                {latestProject && (
                  <a href={latestProject.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    {latestProject.coverImageUrl ? (
                      <img src={latestProject.coverImageUrl} alt={latestProject.name} className="w-10 h-10 object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-secondaryInteraction flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-accent" />
                      </div>
                    )}
                    <div>
                      <p className="font-oswald text-xs text-gray-500 tracking-widest">NOW PLAYING</p>
                      <p className="font-oswald text-sm font-bold group-hover:text-accent transition-colors">{latestProject.name}</p>
                    </div>
                  </a>
                )}

                <div className="flex gap-4">
                  {SOCIAL_LINKS.map((s) => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent transition-colors" aria-label={s.name}>
                      {s.icon()}
                    </a>
                  ))}
                </div>

                {session ? (
                  <div className="flex items-center justify-between">
                    <a href="/profile" onClick={() => setMenuOpen(false)} className="font-oswald text-xs text-gray-400">{session.user?.name || session.user?.email}</a>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="font-oswald text-xs tracking-widest text-gray-500 hover:text-accent">SIGN OUT</button>
                  </div>
                ) : (
                  <a href="/auth/login" onClick={() => setMenuOpen(false)} className="font-oswald font-bold text-xs tracking-widest text-center py-3 bg-accent text-primary hover:bg-accentInteraction transition-colors">
                    SIGN IN
                  </a>
                )}
              </motion.div>
            </motion.div>

            {/* RIGHT panel — artist photo with blur transition */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1 h-full relative overflow-hidden"
              onClick={() => setMenuOpen(false)}
            >
              {/* Artist photo — blur in/out on change */}
              <AnimatePresence mode="wait">
                {currentArtist?.profileImage ? (
                  <motion.div
                    key={currentArtist.id}
                    initial={{ opacity: 0, filter: "blur(12px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(12px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentArtist.profileImage})` }}
                  />
                ) : (
                  <motion.div
                    key="fallback"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-secondaryInteraction"
                  />
                )}
              </AnimatePresence>

              {/* Black flash on transition */}
              <AnimatePresence>
                <motion.div
                  key={`flash-${artistIndex}`}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 bg-black z-10 pointer-events-none"
                />
              </AnimatePresence>

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-black/40 to-transparent z-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />

              {/* Artist name */}
              <AnimatePresence mode="wait">
                {currentArtist && (
                  <motion.div
                    key={currentArtist.id + "-name"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-6 left-4 right-4 z-30"
                  >
                    <p className="font-oswald text-xs text-accent tracking-widest uppercase mb-1">ARTIST</p>
                    <p className="font-cormorant font-bold text-2xl text-white">{currentArtist.name}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="absolute top-4 right-4 font-oswald text-xs text-white/30 tracking-widest z-30">TAP TO CLOSE</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;