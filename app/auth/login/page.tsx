"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password."); }
    else { router.push("/account"); }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/account" });

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <a href="/" className="font-erica text-5xl text-white hover:text-accent transition-colors">GNS</a>
            <div className="w-8 h-0.5 bg-accent mx-auto my-3" />
            <p className="font-oswald text-xs tracking-[5px] text-gray-500 uppercase mb-3">Good Natured Souls</p>
            <p className="font-cormorant text-gray-700 text-sm italic leading-relaxed max-w-xs mx-auto">
              Your gateway to exclusive music, merch, and the GNS community.
            </p>
          </div>

          <div className="border border-secondaryInteraction border-t-2 border-t-accent">

            <div className="flex border-b border-secondaryInteraction">
              <div className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-accent font-bold border-b-2 border-accent -mb-px cursor-default">
                SIGN IN
              </div>
              <a href="/auth/signup" className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors font-bold">
                CREATE ACCOUNT
              </a>
            </div>

            <div className="p-7">

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

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-secondaryInteraction" />
                <span className="font-oswald text-xs tracking-widest text-gray-700">OR</span>
                <div className="flex-1 border-t border-secondaryInteraction" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-5">
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
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
                    autoComplete="current-password"
                    required
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

              <p className="text-center text-xs text-gray-600">
                New to GNS?{" "}
                <a href="/auth/signup" className="text-accent font-oswald tracking-widest hover:underline">Create an account</a>
              </p>

            </div>
          </div>

          <p className="text-center font-oswald text-xs tracking-[5px] text-gray-600 mt-6 hover:text-accent transition-colors cursor-default">EXIST ALTRUISTIC</p>

        </div>
      </main>
    </PageWrapper>
  );
}
