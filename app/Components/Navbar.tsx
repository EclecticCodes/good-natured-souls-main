"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const headers = [
  { key: "home", name: "Home", route: "/" },
  { key: "artists", name: "Artists", route: "/artists" },
  { key: "shows", name: "Shows", route: "/shows" },
  { key: "about", name: "About", route: "/about" },
  { key: "store", name: "Store", route: "/store" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Refactor: Moved the conditional return statement below hook calls
  const isAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    if (pathname !== "/" || isAdminPath) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, isAdminPath]);

  // Function to check screen size and update menuOpen state
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setMenuOpen(false); // Automatically close the menu if the screen width is >= 768px (e.g., when switching to a larger screen)
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check to set the correct menu state on page load

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Early return for admin routes after hooks
  if (isAdminPath) {
    return null;
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <nav
        className={`${pathname === "/" ? "fixed top-0 left-0 w-full" : "sticky top-0 bg-background"} z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background bg-opacity-100"
            : pathname === "/" && "bg-transparent"
        }`}
      >
        <section className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <motion.a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
          >
            <span className="self-center text-4xl whitespace-nowrap dark:text-white font-erica">
              GNS
            </span>
          </motion.a>
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-primary focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span className="sr-only">Toggle menu</span>
            <motion.div
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-center items-center"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              )}
            </motion.div>
          </button>
          <div
            className="hidden w-full md:block md:w-auto"
            id="navbar-multi-level"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
              {headers.map((header) => (
                <li key={header.key}>
                  <motion.a
                    href={header.route}
                    className={`block py-3 px-2 border-b-2 border-transparent hover:border-white ${
                      pathname === header.route ? "border-white" : ""
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {header.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </nav>

      {/* Overlay for Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-background flex flex-col justify-center items-center transition-all duration-300 ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="flex flex-col font-medium text-center">
          {headers.map((header) => (
            <li key={header.key} className="mb-6">
              <motion.a
                href={header.route}
                className="text-2xl block py-2 px-4 border-b-2 border-transparent hover:border-white"
                onClick={() => setMenuOpen(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {header.name}
              </motion.a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
