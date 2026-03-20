"use client";
import { CartProvider } from "../context/CartContext";
import { SessionProvider } from "next-auth/react";
import Navbar from "./Navbar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <Navbar />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
