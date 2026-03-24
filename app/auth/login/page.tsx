"use client";
import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";

const DEFAULT_EMAIL = "goodnaturedsouls@gmail.com";
const MAX_CHANGES = 3;
const TIMER_SECONDS = 30;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [changesLeft, setChangesLeft] = useState(MAX_CHANGES);
  const [countdown, setCountdown] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gns-credential-changes");
    if (saved) setChangesLeft(Math.max(0, MAX_CHANGES - parseInt(saved)));
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && isEditing) {
      setEmail(DEFAULT_EMAIL);
      setIsEditing(false);
      setShowWarning(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [countdown, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password."); }
    else { router.push("/auth/welcome"); }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/auth/welcome" });

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-10">
            <a href="/" className="font-erica text-5xl text-white">GNS</a>
            <div className="w-8 h-0.5 bg-accent mx-auto my-3" />
            <p className="font-oswald text-xs tracking-[5px] text-gray-600 uppercase">Good Natured Souls</p>
          </div>

          {/* Card */}
          <div className="border border-secondaryInteraction border-t-2 border-t-accent">

            {/* Tabs */}
            <div className="flex border-b border-secondaryInteraction">
              <div className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-accent font-bold border-b-2 border-accent -mb-px cursor-default">
                SIGN IN
              </div>
              <a href="/auth/signup" className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors font-bold">
                CREATE ACCOUNT
              </a>
            </div>

            <div className="p-7">

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-secondaryInteraction py-3 font-oswald text-xs tracking-widest hover:border-white transition-colors mb-5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" style={{flexShrink:0}}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-secondaryInteraction" />
                <span className="font-oswald text-xs tracking-widest text-gray-700">OR</span>
                <div className="flex-1 border-t border-secondaryInteraction" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Email</label>
                    {isEditing && countdown > 0 && (
                      <span className="font-oswald text-xs text-accent">{countdown}s</span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    readOnly={!isEditing}
                    placeholder="your@email.com"
                    className={"w-full bg-primary border text-white px-4 py-3 text-sm focus:outline-none transition-colors placeholder-gray-600 " + (isEditing ? "border-accent" : "border-secondaryInteraction")}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Password</label>
                    <a href="/auth/forgot-password" className="font-oswald text-xs tracking-widest text-gray-600 hover:text-accent transition-colors">FORGOT?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                  />
                </div>
                {error && (
                  <div className="border border-red-500/30 bg-red-500/10 px-4 py-2">
                    <p className="text-red-400 text-xs font-oswald tracking-widest">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50"
                >
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>

              {/* Warning for credential changes */}
              {showWarning && (
                <div className="border border-accent p-4 mb-4">
                  <p className="font-oswald text-xs font-bold mb-1 text-accent">USE A CREDENTIAL CHANGE?</p>
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                    You have <span className="text-accent font-bold">{changesLeft} of {MAX_CHANGES}</span> changes remaining.
                    You will have <span className="text-accent font-bold">{TIMER_SECONDS} seconds</span> to enter new credentials.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const used = parseInt(localStorage.getItem("gns-credential-changes") || "0") + 1;
                        localStorage.setItem("gns-credential-changes", String(used));
                        setChangesLeft(prev => prev - 1);
                        setIsEditing(true);
                        setEmail("");
                        setCountdown(TIMER_SECONDS);
                        setShowWarning(false);
                      }}
                      className="flex-1 bg-accent text-primary font-oswald text-xs font-bold py-2 tracking-widest"
                    >
                      CONFIRM
                    </button>
                    <button
                      onClick={() => setShowWarning(false)}
                      className="flex-1 border border-secondaryInteraction text-gray-500 font-oswald text-xs py-2 tracking-widest hover:border-white transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-gray-600">
                New to GNS?{" "}
                <a href="/auth/signup" className="text-accent font-oswald tracking-widest hover:underline">Create an account</a>
              </p>

            </div>
          </div>

          <p className="text-center font-oswald text-xs tracking-[5px] text-gray-800 mt-6">EXIST ALTRUISTIC</p>

        </div>
      </main>
    </PageWrapper>
  );
}
