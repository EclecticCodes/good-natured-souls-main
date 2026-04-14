"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push("/account");
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/account" });

  return (
    <div style={{ minHeight: "100dvh", background: "#0d0d0d", display: "flex", flexDirection: "column", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Top bar */}
      <div style={{ padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", fontFamily: "serif" }}>GNS</span>
        </a>
        <a href="/auth/signup" style={{ fontSize: 12, color: "#555", textDecoration: "none", letterSpacing: "1px" }}>
          Create account →
        </a>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ width: "100%", maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 9, letterSpacing: "4px", color: "#F0B51E", textTransform: "uppercase", margin: "0 0 10px", fontWeight: 700 }}>Good Natured Souls</p>
            <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.1 }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.6 }}>
              Sign in to access your account, orders, and the GNS community.
            </p>
          </div>

          {/* Google */}
          <motion.button onClick={handleGoogle} whileHover={{ borderColor: "#fff" }} whileTap={{ scale: 0.98 }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "none", border: "1px solid #2a2a2a", borderRadius: 10, padding: "13px 0", cursor: "pointer", color: "#ccc", fontSize: 13, fontWeight: 600, letterSpacing: "1px", marginBottom: 20, transition: "border-color 0.15s", fontFamily: "inherit" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
            <span style={{ fontSize: 10, color: "#333", letterSpacing: "2px", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" required
                style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "13px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 9, letterSpacing: "2px", color: "#555", textTransform: "uppercase", fontWeight: 700 }}>Password</label>
                <a href="/auth/forgot-password" style={{ fontSize: 11, color: "#444", textDecoration: "none", letterSpacing: "1px" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required
                  style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "13px 48px 13px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: 4 }}>
                  {showPw ? "🙈" : "��"}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ background: "#F0B51E", color: "#000", border: "none", borderRadius: 10, padding: "15px 0", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, opacity: loading ? 0.7 : 1, marginTop: 4, fontFamily: "inherit" }}>
              {loading ? "Signing in..." : "Sign In →"}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 20 }}>
            New to GNS?{" "}
            <a href="/auth/signup" style={{ color: "#F0B51E", textDecoration: "none", fontWeight: 600 }}>Create an account</a>
          </p>

        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 24px", display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 9, letterSpacing: "4px", color: "#222", textTransform: "uppercase" }}>Exist Altruistic</span>
      </div>
    </div>
  );
}
