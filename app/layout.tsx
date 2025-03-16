import type { Metadata } from "next";
import {
  Inter,
  Erica_One,
  Cormorant,
  Homemade_Apple,
  Oswald,
} from "next/font/google";
import "./globals.css";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Marquee from "./marquee";
import { AnimatePresence, motion } from "framer-motion";
import { delay } from "sanity/migrate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ericaOne = Erica_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-erica",
});

const cormorant = Cormorant({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const homemadeApple = Homemade_Apple({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-homemadeApple",
});

const oswald = Oswald({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Good Natured Souls",
  description: "Website showing Good Natured Souls Records",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`text-text bg-background ${inter.variable} ${ericaOne.variable} ${cormorant.variable} ${homemadeApple.variable} ${oswald.variable}`}
      >

        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
