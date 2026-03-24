"use client";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Props = {
  product: { id: string; name: string; type: string; price: number };
  onClose: () => void;
  onSaved: () => void;
};

export default function WishlistModal({ product, onClose, onSaved }: Props) {
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!session?.user?.email) return;
    setSaving(true);
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          productId: product.id,
          productName: product.name,
        }),
      });
      // Save to localStorage too
      try {
        const existing = JSON.parse(localStorage.getItem('gns-wishlist') || '[]');
        if (!existing.find((i: any) => i.id === product.id)) {
          existing.push({ id: product.id, name: product.name, type: product.type, price: product.price });
          localStorage.setItem('gns-wishlist', JSON.stringify(existing));
        }
      } catch {}
      onSaved();
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSaving(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-primary border border-secondaryInteraction w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-secondaryInteraction px-6 py-4 flex items-center justify-between">
            <p className="font-oswald text-sm tracking-widest uppercase">Save to Wishlist</p>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">✕</button>
          </div>

          <div className="px-6 py-6">
            <p className="text-sm text-gray-400 mb-1">{product.name}</p>
            <p className="font-oswald text-accent text-lg font-bold mb-6">${product.price.toFixed(2)}</p>

            {status === 'loading' ? (
              <p className="font-oswald text-xs tracking-widest text-gray-500 animate-pulse">LOADING...</p>
            ) : session ? (
              <div>
                <p className="text-xs text-gray-500 mb-4">
                  Saving to wishlist for <span className="text-accent">{session.user?.email}</span>
                </p>
                {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-accent text-primary font-oswald font-bold text-sm py-3 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-40"
                >
                  {saving ? 'SAVING...' : 'SAVE TO WISHLIST'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Sign in to save items to your wishlist and access them from any device.
                </p>
                <button
                  onClick={() => signIn(undefined, { callbackUrl: '/store' })}
                  className="w-full bg-accent text-primary font-oswald font-bold text-sm py-3 tracking-widest hover:bg-accentInteraction transition-colors mb-3"
                >
                  SIGN IN TO SAVE
                </button>
                
                  href="/auth/signup"
                  className="block w-full text-center border border-secondaryInteraction text-gray-400 font-oswald text-sm py-3 tracking-widest hover:border-accent hover:text-accent transition-colors"
                >
                  CREATE ACCOUNT
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
