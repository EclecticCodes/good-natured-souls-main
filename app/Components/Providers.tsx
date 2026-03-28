"use client";
import { CartProvider } from "../context/CartContext";
import { RadioProvider } from "../context/RadioContext";
import { SessionProvider } from "next-auth/react";
import Navbar from "./Navbar";
import RadioBar from "./RadioBar";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <RadioProvider>
          <Navbar />
          {children}
          <RadioBar />
        </RadioProvider>
      </CartProvider>
    </SessionProvider>
  );
}
