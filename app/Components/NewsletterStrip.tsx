"use client";
import { useState } from "react";

const NewsletterStrip = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email || !email.includes("@") || !consent) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "footer",
          consentGiven: true,
          consentTimestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-t border-b border-secondaryInteraction bg-primary py-7 px-4">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="shrink-0">
          <p className="font-oswald text-xs tracking-[4px] text-accent uppercase mb-1">Mailing List</p>
          <p className="font-oswald text-xl font-bold text-white">Never miss a drop.</p>
        </div>
        {status === "success" ? (
          <p className="font-oswald text-accent tracking-widest text-sm">YOU'RE ON THE LIST ✦</p>
        ) : (
          <div className="flex flex-col gap-2 flex-1 max-w-md w-full">
            <div className="flex gap-2">
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
                className="bg-accent text-primary font-oswald font-bold text-xs px-5 py-2.5 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {status === "loading" ? "..." : "SUBSCRIBE"}
              </button>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-yellow-400"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to receive emails from Good Natured Souls. View our{" "}
                <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {status === "error" && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterStrip;
