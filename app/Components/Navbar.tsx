"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useSession, signOut } from "next-auth/react";

const headers = [
  { key: "home", name: "Home", route: "/" },
  { key: "artists", name: "Artists", route: "/artists" },
  { key: "shows", name: "Shows", route: "/shows" },
  { key: "store", name: "Store", route: "/store" },
  { key: "articles", name: "Articles", route: "/articles" },
  { key: "fanclub", name: "Fan Club", route: "/fanclub" },
  { key: "about", name: "About", route: "/about" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { data: session } = useSession();
  const isAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    if (pathname !== "/" || isAdminPath) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isAdminPath]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isAdminPath) return null;

  return (
    <>
      <nav className={`${pathname === "/" ? "fixed top-0 left-0 w-full" : "sticky top-0 bg-background"} z-50 transition-all duration-300 ${scrolled ? "bg-background bg-opacity-100" : pathname === "/" && "bg-transparent"}`}>
        <section className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <motion.a href="/" className="flex items-center space-x-3" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
            <span className="self-center text-4xl whitespace-nowrap font-erica">GNS</span>
          </motion.a>

          <div className="flex items-center gap-4 md:order-last">
            <motion.a href="/checkout" className="relative flex items-center gap-1 font-oswald text-sm tracking-widest hover:text-accent transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{count}</span>
              )}
            </motion.a>
              {session ? (
                <div className="flex items-center gap-2">
                  <a href="/profile" className="font-oswald text-xs text-gray-400 hidden md:block hover:text-accent transition-colors">{session.user?.name || session.user?.email}</a>
                  <motion.button onClick={() => signOut()} className="font-oswald text-xs tracking-widest text-gray-500 hover:text-accent transition-colors" whileHover={{ scale: 1.05 }}>
                    SIGN OUT
                  </motion.button>
                </div>
              ) : (
                <motion.a href="/auth/login" className="font-oswald text-xs tracking-widest text-accent border border-accent px-3 py-1 hover:bg-accent hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                  SIGN IN
                </motion.a>
              )}
            <button type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-primary focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
              <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {menuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" /></svg>
                )}
              </motion.div>
            </button>
          </div>

          <div className="hidden w-full md:block md:w-auto">
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 md:flex-row md:mt-0 md:border-0">
              {headers.map((header) => (
                <li key={header.key}>
                  <motion.a href={header.route} className={`block py-3 px-2 border-b-2 border-transparent hover:border-white ${pathname === header.route ? "border-white" : ""}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {header.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </nav>

      <div className={`md:hidden fixed inset-0 z-40 bg-background flex flex-col justify-center items-center transition-all duration-300 ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <ul className="flex flex-col font-medium text-center">
          {headers.map((header) => (
            <li key={header.key} className="mb-6">
              <motion.a href={header.route} className="text-2xl block py-2 px-4 border-b-2 border-transparent hover:border-white" onClick={() => setMenuOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {header.name}
              </motion.a>
            </li>
          ))}
          <li className="mb-6">
            <motion.a href="/checkout" className="text-2xl block py-2 px-4 text-accent font-oswald tracking-widest" onClick={() => setMenuOpen(false)}>
              CART {count > 0 && `(${count})`}
            </motion.a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
