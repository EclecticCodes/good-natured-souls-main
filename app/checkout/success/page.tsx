"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { PageWrapper } from "../../Components/PageWrapper";
import Header from "../../Components/Header";

export default function SuccessPage() {
  const { items, total, clearCart } = useCart();
  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Capture items before clearing cart
    if (items.length > 0) {
      setOrderItems(items);
      setOrderTotal(total);
      clearCart();
    }
  }, []);

  const handleMailingList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    await fetch("/api/mailing-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "checkout-success", consentGiven: true, consentTimestamp: new Date().toISOString() }),
    });
    setSubscribed(true);
  };

  return (
    <PageWrapper>
      <Header><h1 className="font-oswald text-4xl font-bold">Order Confirmed</h1></Header>
      <div className="max-w-xl mx-auto px-4 py-16">

        {/* Confirmation banner */}
        <div className="border border-accent p-8 mb-6 text-center">
          <p className="font-oswald text-3xl font-bold text-accent tracking-widest mb-2">THANK YOU</p>
          <p className="text-gray-400 text-sm">Your order has been confirmed. A receipt and download links have been sent to your email.</p>
        </div>

        {/* Order summary */}
        {orderItems.length > 0 && (
          <div className="border border-secondaryInteraction p-4 mb-6">
            <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-gray-400 mb-3">What You Ordered</h3>
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-secondaryInteraction last:border-0">
                <span className="text-gray-300">
                  {item.name}
                  <span className="ml-2 text-xs text-accent uppercase">[{item.type}]</span>
                  {item.quantity > 1 && <span className="ml-1 text-gray-600">x{item.quantity}</span>}
                </span>
                <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-oswald font-bold text-base pt-3 mt-1">
              <span className="text-gray-400">Total Paid</span>
              <span className="text-accent">${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Mailing list */}
        {!subscribed ? (
          <div className="border border-secondaryInteraction p-6 mb-6">
            <p className="font-oswald text-lg font-bold tracking-widest mb-1">STAY IN THE LOOP</p>
            <p className="text-gray-500 text-sm mb-4">Get notified about new releases, shows, and merch drops.</p>
            <form onSubmit={handleMailingList} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
              />
              <button type="submit" className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors">
                SUBSCRIBE
              </button>
            </form>
          </div>
        ) : (
          <div className="border border-accent p-6 mb-6 text-center">
            <p className="font-oswald text-accent tracking-widest">YOU&apos;RE ON THE LIST ✓</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <a href="/store" className="border border-secondaryInteraction text-white font-oswald text-sm px-6 py-3 tracking-widest hover:border-accent transition-colors">
            BACK TO STORE
          </a>
          <a href="/" className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-3 tracking-widest hover:bg-accentInteraction transition-colors">
            HOME
          </a>
        </div>

      </div>
    </PageWrapper>
  );
}
