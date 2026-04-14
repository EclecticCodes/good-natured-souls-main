"use client";
import React, { useState } from "react";
import { PageWrapper } from "../../Components/PageWrapper";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <a href="/" className="font-erica text-5xl text-white hover:text-accent transition-colors">GNS</a>
            <div className="w-8 h-0.5 bg-accent mx-auto my-3" />
            <p className="font-oswald text-xs tracking-[5px] text-gray-500 uppercase">Good Natured Souls</p>
          </div>

          <div className="border border-secondaryInteraction border-t-2 border-t-accent p-7">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">✓</span>
                </div>
                <h2 className="font-oswald text-lg font-bold tracking-widest mb-3">Check your email</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  If an account exists for <span className="text-white">{email}</span>, 
                  you'll receive a password reset link within a few minutes.
                </p>
                <a href="/auth/login" className="font-oswald text-xs tracking-widest text-accent hover:underline">
                  ← Back to sign in
                </a>
              </div>
            ) : (
              <>
                <h2 className="font-oswald text-lg font-bold tracking-widest mb-2">Forgot your password?</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50"
                  >
                    {loading ? "SENDING..." : "SEND RESET LINK"}
                  </button>
                </form>
                <p className="text-center mt-5">
                  <a href="/auth/login" className="font-oswald text-xs tracking-widest text-gray-600 hover:text-accent transition-colors">
                    ← Back to sign in
                  </a>
                </p>
              </>
            )}
          </div>

          <p className="text-center font-oswald text-xs tracking-[5px] text-gray-600 mt-6">EXIST ALTRUISTIC</p>
        </div>
      </main>
    </PageWrapper>
  );
}
