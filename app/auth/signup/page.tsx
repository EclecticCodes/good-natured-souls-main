"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Afrobeats", "Pop", "Electronic", "Gospel", "Reggae", "Other"];
const TOTAL_STEPS = 3;

type Form = {
  first_name: string; last_name: string; middle_name: string;
  email: string; password: string; confirm: string;
  birthday: string; phone: string;
  genres: string[]; theme_artist: string;
};

export default function SignupPage() {
  const router  = useRouter();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [gnsArtists, setGnsArtists] = useState<{ name: string; profileImage: string }[]>([]);
  const [form, setForm] = useState<Form>({
    first_name: "", last_name: "", middle_name: "",
    email: "", password: "", confirm: "",
    birthday: "", phone: "", genres: [], theme_artist: "",
  });

  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "https://gns-cms-production.up.railway.app";
    fetch(`${strapiUrl}/api/artists?populate=profileImage&pagination[limit]=50&sort=orderRank:asc`)
      .then(r => r.json())
      .then(d => {
        const mapped = (d.data || []).map((a: any) => {
          const imgUrl = a.attributes?.profileImage?.data?.attributes?.url || "";
          return { name: a.attributes?.name || "", profileImage: imgUrl.startsWith("http") ? imgUrl : imgUrl ? `${strapiUrl}${imgUrl}` : "" };
        }).filter((a: any) => a.name);
        setGnsArtists(mapped);
      })
      .catch(() => {});
  }, []);

  const update = (field: keyof Form, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleGenre = (g: string) => setForm(prev => ({ ...prev, genres: prev.genres.includes(g) ? prev.genres.filter(x => x !== g) : [...prev.genres, g] }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.first_name.trim() || !form.last_name.trim()) { setError("First and last name required."); return; }
      if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    }
    setError(""); setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, password: form.password,
          first_name: form.first_name, middle_name: form.middle_name,
          last_name: form.last_name, birthday: form.birthday,
          theme_artist: form.theme_artist,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      if (form.genres.length > 0 || form.phone) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, genres: form.genres }),
        });
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/auth/welcome");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/account" });

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a",
    borderRadius: 10, padding: "14px 16px", color: "#fff", fontSize: 15,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#0d0d0d", display: "flex", flexDirection: "column", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Top bar */}
      <div style={{ padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", fontFamily: "serif" }}>GNS</span>
        </a>
        <a href="/auth/login" style={{ fontSize: 12, color: "#555", textDecoration: "none", letterSpacing: "1px" }}>
          Sign in →
        </a>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#1a1a1a" }}>
        <motion.div animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ height: "100%", background: "#F0B51E", borderRadius: "0 2px 2px 0" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px 80px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          <AnimatePresence mode="wait">

            {/* Step 1 — Account */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p style={{ fontSize: 9, letterSpacing: "4px", color: "#F0B51E", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 700 }}>Step 1 of {TOTAL_STEPS}</p>
                <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px", lineHeight: 1.1 }}>Create your<br />account.</h1>
                <p style={{ fontSize: 14, color: "#555", margin: "0 0 32px", lineHeight: 1.6 }}>Join the GNS community to access music, merch, and more.</p>

                {/* Google */}
                <motion.button onClick={handleGoogle} whileHover={{ borderColor: "#fff" }} whileTap={{ scale: 0.98 }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "none", border: "1px solid #2a2a2a", borderRadius: 10, padding: "13px 0", cursor: "pointer", color: "#ccc", fontSize: 13, fontWeight: 600, letterSpacing: "1px", marginBottom: 20, fontFamily: "inherit" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </motion.button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
                  <span style={{ fontSize: 10, color: "#333", letterSpacing: "2px" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
                </div>

                <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>First Name</label>
                      <input type="text" value={form.first_name} onChange={e => update("first_name", e.target.value)} placeholder="First" style={inputStyle} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>Last Name</label>
                      <input type="text" value={form.last_name} onChange={e => update("last_name", e.target.value)} placeholder="Last" style={inputStyle} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>Email</label>
                    <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" autoComplete="email" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 8 characters" style={{ ...inputStyle, paddingRight: 48 }} required />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#444", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>Confirm Password</label>
                    <input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder="Repeat password" style={inputStyle} required />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" whileTap={{ scale: 0.99 }}
                    style={{ background: "#F0B51E", color: "#000", border: "none", borderRadius: 10, padding: "15px 0", fontWeight: 800, cursor: "pointer", fontSize: 15, marginTop: 4, fontFamily: "inherit" }}>
                    Continue →
                  </motion.button>
                </form>
                <p style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 16 }}>
                  Already have an account?{" "}
                  <a href="/auth/login" style={{ color: "#F0B51E", textDecoration: "none", fontWeight: 600 }}>Sign in</a>
                </p>
              </motion.div>
            )}

            {/* Step 2 — Your sounds */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p style={{ fontSize: 9, letterSpacing: "4px", color: "#F0B51E", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 700 }}>Step 2 of {TOTAL_STEPS}</p>
                <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px", lineHeight: 1.1 }}>What moves<br />you?</h1>
                <p style={{ fontSize: 14, color: "#555", margin: "0 0 32px", lineHeight: 1.6 }}>Pick the genres that describe your taste. We'll use this to personalize your experience.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                  {GENRES.map(g => (
                    <motion.button key={g} type="button" onClick={() => toggleGenre(g)} whileTap={{ scale: 0.95 }}
                      style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${form.genres.includes(g) ? "#F0B51E" : "#2a2a2a"}`, background: form.genres.includes(g) ? "#F0B51E18" : "transparent", color: form.genres.includes(g) ? "#F0B51E" : "#555", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" }}>
                      {form.genres.includes(g) ? "✓ " : ""}{g}
                    </motion.button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setStep(1); setError(""); }}
                    style={{ flex: 1, background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 10, padding: "14px 0", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                    ← Back
                  </button>
                  <motion.button onClick={() => { setError(""); setStep(3); }} whileTap={{ scale: 0.99 }}
                    style={{ flex: 2, background: "#F0B51E", color: "#000", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 800, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>
                    Continue →
                  </motion.button>
                </div>
                <p style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 12 }}>
                  <button onClick={() => { setStep(3); setError(""); }} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "inherit" }}>
                    Skip for now
                  </button>
                </p>
              </motion.div>
            )}

            {/* Step 3 — Favorite GNS artist */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p style={{ fontSize: 9, letterSpacing: "4px", color: "#F0B51E", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 700 }}>Step 3 of {TOTAL_STEPS}</p>
                <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px", lineHeight: 1.1 }}>Who's your<br />favorite?</h1>
                <p style={{ fontSize: 14, color: "#555", margin: "0 0 28px", lineHeight: 1.6 }}>Pick a GNS artist to follow. You can always change this later.</p>

                {gnsArtists.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
                    {gnsArtists.map(artist => (
                      <motion.button key={artist.name} type="button" onClick={() => update("theme_artist", artist.name)} whileTap={{ scale: 0.97 }}
                        style={{ background: form.theme_artist === artist.name ? "#F0B51E18" : "#111", border: `1px solid ${form.theme_artist === artist.name ? "#F0B51E" : "#2a2a2a"}`, borderRadius: 10, padding: "14px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit", transition: "all 0.15s" }}>
                        {artist.profileImage ? (
                          <img src={artist.profileImage} alt={artist.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0B51E22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#F0B51E", flexShrink: 0 }}>
                            {artist.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 700, color: form.theme_artist === artist.name ? "#F0B51E" : "#ccc", textAlign: "left", lineHeight: 1.3 }}>{artist.name}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 13, marginBottom: 28 }}>Loading artists...</div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 14 }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => { setStep(2); setError(""); }}
                      style={{ flex: 1, background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 10, padding: "14px 0", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                      ← Back
                    </button>
                    <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.99 }}
                      style={{ flex: 2, background: "#F0B51E", color: "#000", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                      {loading ? "Creating account..." : "Join GNS →"}
                    </motion.button>
                  </div>
                  {!form.theme_artist && (
                    <button type="submit" disabled={loading} onClick={() => update("theme_artist", "")}
                      style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "inherit", padding: "4px 0" }}>
                      Skip and finish
                    </button>
                  )}
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <div style={{ padding: "14px 24px", display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 9, letterSpacing: "4px", color: "#222", textTransform: "uppercase" }}>Exist Altruistic</span>
      </div>
    </div>
  );
}
