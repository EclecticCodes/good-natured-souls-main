"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "gns_newsletter_dismissed";
const DISMISS_DAYS = 7;

const NewsletterPopup = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (!email || !email.includes("@") || !consent) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "popup",
          consentGiven: true,
          consentTimestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        setVisible(false);
      }, 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md"
          >
            <div className="bg-primary border border-secondaryInteraction border-t-2 border-t-accent rounded-sm overflow-hidden">
              <div className="p-7">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-oswald text-xs tracking-[4px] text-accent uppercase mb-1">Good Natured Souls</p>
                    <h2 className="font-oswald text-2xl font-bold text-white">Stay in the loop.</h2>
                  </div>
                  <button onClick={dismiss} className="text-gray-600 hover:text-white transition-colors text-lg leading-none mt-1">✕</button>
                </div>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">New releases, upcoming shows, and exclusive drops — straight to your inbox. No spam, ever.</p>

                {status === "success" ? (
                  <div className="text-center py-4">
                    <p className="font-oswald text-accent text-lg tracking-widest">YOU'RE ON THE LIST</p>
                    <p className="text-gray-500 text-sm mt-1">Check your inbox for a confirmation email.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-secondaryInteraction border border-secondaryInteraction text-white px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={status === "loading" || !consent}
                        className="bg-accent text-primary font-oswald font-bold text-xs px-5 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-40"
                      >
                        {status === "loading" ? "..." : "JOIN"}
                      </button>
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 accent-yellow-400"
                      />
                      <span className="text-xs text-gray-600 leading-relaxed">
                        I agree to receive emails from Good Natured Souls. I can unsubscribe at any time. View our{" "}
                        <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {status === "error" && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}
                    <p className="text-xs text-gray-700 text-center">Unsubscribe anytime · No spam</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
