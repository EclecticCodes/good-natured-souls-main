"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";
import { motion } from "framer-motion";

const DISCORD_LINK = "https://discord.gg/tr6Gybnu";

const PERKS = [
  { icon: "★", title: "Exclusive Content", description: "Access to unreleased tracks, behind the scenes footage, and exclusive GNS content before anyone else." },
  { icon: "⚡", title: "Early Ticket Access", description: "Get first access to show tickets before they go on sale to the public. Never miss a GNS event again." },
  { icon: "◆", title: "Members-Only Discord Role", description: "Verified fan role in the GNS Discord with access to exclusive channels and direct artist interaction." },
  { icon: "✉", title: "Monthly Newsletter", description: "Curated monthly updates on new releases, upcoming shows, label news, and exclusive fan content." },
  { icon: "%", title: "Merch Discounts", description: "Exclusive fan club discount codes for the GNS store. Members save on every purchase." },
];

const TIERS = [
  {
    name: "PAY WHAT YOU WILL",
    price: "Your Choice",
    perks: ["Choose your own contribution", "Everything in Fan tier", "Special supporter badge in Discord", "Listed as a GNS Patron"],
    accent: false,
    badge: "COMMUNITY LOVE",
    payWhatYouWill: true,
  },
  {
    name: "SUPPORTER",
    price: "Free",
    perks: ["Monthly Newsletter", "GNS Discord Access"],
    accent: false,
  },
  {
    name: "FAN",
    price: "$4.99/mo",
    perks: ["Everything in Supporter", "10% Merch Discount", "Exclusive Content Access", "Fan Discord Role"],
    accent: true,
    badge: "MOST POPULAR",
  },
  {
    name: "SUPER FAN",
    price: "$9.99/mo",
    perks: ["Everything in Fan", "20% Merch Discount", "Early Ticket Access", "Direct Artist Q&A"],
    accent: false,
  },
];

export default function FanClubPage() {
  const { data: session } = useSession();
  const [joined, setJoined] = useState(false);
  const [customAmount, setCustomAmount] = useState('5');
  const [selectedTier, setSelectedTier] = useState("SUPPORTER");
  const [email, setEmail] = useState(session?.user?.email || "");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/mailing-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "fanclub" }),
    });
    setJoined(true);
  };

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center">GNS Fan Club</h1>
        </Header>

        {/* Hero */}
        <section className="py-16 px-4 text-center border-b border-secondaryInteraction">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-oswald text-gray-400 tracking-widest text-sm uppercase mb-4">Become Part of the Family</p>
            <h2 className="font-oswald text-4xl font-bold mb-4">JOIN THE GNS COMMUNITY</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
              Get closer to the artists you love. Exclusive content, early access, merch discounts, and a direct line to the Good Natured Souls family.
            </p>
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#5865F2] text-white font-oswald font-bold text-sm px-8 py-4 tracking-widest hover:opacity-90 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.132 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              JOIN OUR DISCORD
            </a>
          </motion.div>
        </section>

        {/* Perks */}
        <section className="py-12 px-4 max-w-5xl mx-auto">
          <h2 className="font-oswald text-2xl font-bold tracking-widest uppercase mb-8 text-center">MEMBER PERKS</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                className="border border-secondaryInteraction p-6 hover:border-accent transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-accent text-2xl block mb-3">{perk.icon}</span>
                <h3 className="font-oswald text-lg font-bold mb-2">{perk.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section className="py-12 px-4 max-w-5xl mx-auto border-t border-secondaryInteraction">
          <h2 className="font-oswald text-2xl font-bold tracking-widest uppercase mb-8 text-center">MEMBERSHIP TIERS</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <div
                key={i}
                onClick={() => setSelectedTier(tier.name)}
                className={"border p-6 cursor-pointer transition-all " + (selectedTier === tier.name ? "border-accent" : "border-secondaryInteraction hover:border-accent")}
              >
                {tier.badge && (
                  <span className="bg-accent text-primary font-oswald text-xs font-bold px-2 py-1 tracking-widest block w-fit mb-3">{tier.badge}</span>
                )}
                <h3 className="font-oswald text-2xl font-bold mb-1">{tier.name}</h3>
                {(tier as any).payWhatYouWill ? (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-oswald text-2xl font-bold text-accent">$</span>
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      onClick={e => { e.stopPropagation(); setSelectedTier('PAY WHAT YOU WILL'); }}
                      className="w-24 bg-primary border border-accent text-accent font-oswald text-2xl font-bold px-2 py-1 focus:outline-none"
                    />
                    <span className="font-oswald text-sm text-gray-500">/mo</span>
                  </div>
                ) : (
                  <p className="font-oswald text-3xl font-bold text-accent mb-4">{tier.price}</p>
                )}
                <ul className="flex flex-col gap-2">
                  {tier.perks.map((perk, j) => (
                    <li key={j} className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="text-accent text-xs">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Sign up */}
        <section className="py-12 px-4 max-w-xl mx-auto border-t border-secondaryInteraction">
          <h2 className="font-oswald text-2xl font-bold tracking-widest uppercase mb-2 text-center">GET STARTED</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Selected: <span className="text-accent font-oswald font-bold">{selectedTier}</span>
          </p>
          {joined ? (
            <div className="border border-accent p-8 text-center">
              <p className="font-oswald text-2xl font-bold text-accent mb-2">WELCOME TO THE CLUB</p>
              <p className="text-gray-400 text-sm mb-4">You are now a GNS {selectedTier} member.</p>
              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#5865F2] text-white font-oswald text-sm px-6 py-3 tracking-widest hover:opacity-90 transition-opacity">
                JOIN DISCORD NOW ↗
              </a>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                  required
                />
              </div>
              <button type="submit" className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-4 tracking-widest hover:bg-accentInteraction transition-colors">
  {selectedTier === "PAY WHAT YOU WILL" ? `CONTRIBUTE $${customAmount}/MO` : `JOIN AS ${selectedTier}`}
              </button>
              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-[#5865F2] text-[#5865F2] font-oswald text-sm px-6 py-3 tracking-widest hover:bg-[#5865F2] hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.132 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                JOIN DISCORD FIRST
              </a>
            </form>
          )}
        </section>
      </main>
    </PageWrapper>
  );
}
