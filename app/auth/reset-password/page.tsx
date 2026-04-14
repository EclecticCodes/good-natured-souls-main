"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 3000);
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
            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">✓</span>
                </div>
                <h2 className="font-oswald text-lg font-bold tracking-widest mb-3">Password reset</h2>
                <p className="text-gray-500 text-sm">Your password has been updated. Redirecting to sign in...</p>
              </div>
            ) : (
              <>
                <h2 className="font-oswald text-lg font-bold tracking-widest mb-2">Set new password</h2>
                <p className="text-gray-500 text-sm mb-6">Choose a strong password for your GNS account.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat password"
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
                    disabled={loading || !token}
                    className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50"
                  >
                    {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center font-oswald text-xs tracking-[5px] text-gray-600 mt-6">EXIST ALTRUISTIC</p>
        </div>
      </main>
    </PageWrapper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
