"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          data: { email: session.user.email, name: session.user.name || 'Friend' }
        }),
      });
    }
  }, [session]);
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(timer); router.push("/"); }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <a href="/" className="font-erica text-6xl block mb-8">GNS</a>
          <div className="border border-accent p-10 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-primary text-3xl font-bold">✓</span>
            </motion.div>
            <h1 className="font-oswald text-4xl font-bold mb-3">WELCOME TO GNS</h1>
            <p className="text-gray-400 mb-2">
              {session?.user?.name ? `Welcome, ${session.user.name}!` : "Your account has been created."}
            </p>
            <p className="text-gray-500 text-sm">You are now part of the Good Natured Souls family.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <a href="/artists" className="border border-secondaryInteraction p-4 hover:border-accent transition-colors group">
              <p className="font-oswald text-lg font-bold group-hover:text-accent transition-colors">ARTISTS</p>
              <p className="text-gray-600 text-xs mt-1">Explore our roster</p>
            </a>
            <a href="/store" className="border border-secondaryInteraction p-4 hover:border-accent transition-colors group">
              <p className="font-oswald text-lg font-bold group-hover:text-accent transition-colors">STORE</p>
              <p className="text-gray-600 text-xs mt-1">Shop new releases</p>
            </a>
            <a href="/shows" className="border border-secondaryInteraction p-4 hover:border-accent transition-colors group">
              <p className="font-oswald text-lg font-bold group-hover:text-accent transition-colors">SHOWS</p>
              <p className="text-gray-600 text-xs mt-1">Get tickets</p>
            </a>
            <a href="/articles" className="border border-secondaryInteraction p-4 hover:border-accent transition-colors group">
              <p className="font-oswald text-lg font-bold group-hover:text-accent transition-colors">ARTICLES</p>
              <p className="text-gray-600 text-xs mt-1">Latest news</p>
            </a>
          </div>
          <p className="text-gray-600 text-sm font-oswald tracking-widest">
            REDIRECTING TO HOME IN {count}...
          </p>
          <button onClick={() => router.push("/")} className="mt-4 font-oswald text-accent text-xs tracking-widest hover:underline">
            GO NOW
          </button>
        </motion.div>
      </main>
    </PageWrapper>
  );
}
