"use client";

import { usePathname } from "next/navigation";

type Link = {
  name: string;
  href: string;
};

const links: Link[] = [
  { name: "About", href: "/about" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Contact", href: "/contact" },
  { name: "Licensing", href: "/licensing" },
];

const Footer = () => {
  console.log("Footer rendered");
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-primary border-t border-gray-200 py-8">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <a
              href="/"
              className="flex mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
            >
              <span className="self-center text-4xl font-erica whitespace-nowrap">
                GNS
              </span>
            </a>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              © 2024{" "}
              <a href="/" className="hover:underline">
                Good Natured Souls™
              </a>
              . All Rights Reserved.
            </span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Site Credits
            </span>
          </div>
          <ul className="flex flex-wrap items-center  my-6 text-sm font-medium text-gray-500 sm:my-6 dark:text-gray-400">
            {links.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:underline me-4 md:me-6">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
