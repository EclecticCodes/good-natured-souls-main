"use client";
import React, { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";

const GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Afrobeats", "Pop", "Electronic", "Gospel", "Reggae", "Other"];
const GNS_ARTISTS = ["Eclectic Sage", "Prince Inspiration", "Tiarra", "Jewel$ From The X"];

export default function SignupPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "", firstName: "", lastName: "",
    phone: "", birthday: "", genres: [] as string[], favoriteArtists: [] as string[],
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleArray = (field: "genres" | "favoriteArtists", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value]
    }));
  };
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setStep(2);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const res = await fetch(`${strapiUrl}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error.message || "Registration failed."); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/auth/welcome");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
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
              <a href="/auth/login" className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors font-bold">
                SIGN IN
              </a>
              <div className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-accent font-bold border-b-2 border-accent -mb-px cursor-default">
                CREATE ACCOUNT
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex border-b border-secondaryInteraction">
              <div className={"flex-1 h-0.5 transition-colors " + (step >= 1 ? "bg-accent" : "bg-secondaryInteraction")} />
              <div className={"flex-1 h-0.5 transition-colors " + (step >= 2 ? "bg-accent" : "bg-secondaryInteraction")} />
            </div>

            <div className="p-7">

              {step === 1 && (
                <>
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
                    SIGN UP WITH GOOGLE
                  </button>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 border-t border-secondaryInteraction" />
                    <span className="font-oswald text-xs tracking-widest text-gray-700">OR</span>
                    <div className="flex-1 border-t border-secondaryInteraction" />
                  </div>

                  <form onSubmit={handleNext} className="flex flex-col gap-4">
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Username</label>
                      <input type="text" value={form.username} onChange={e => update("username", e.target.value)} placeholder="yourname" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">First Name</label>
                        <input type="text" value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="First" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Last Name</label>
                        <input type="text" value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Last" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                      </div>
                    </div>
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Email</label>
                      <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                    </div>
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Password</label>
                      <input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 8 characters" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                    </div>
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Confirm Password</label>
                      <input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder="Repeat password" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                    </div>
                    {error && (
                      <div className="border border-red-500/30 bg-red-500/10 px-4 py-2">
                        <p className="text-red-400 text-xs font-oswald tracking-widest">{error}</p>
                      </div>
                    )}
                    <button type="submit" className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors">
                      NEXT
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-600 mt-5">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-accent font-oswald tracking-widest hover:underline">Sign in</a>
                  </p>
                </>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-full border-2 border-accent mx-auto mb-2 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => fileRef.current?.click()}
                    >
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-accent text-xl font-bold">+</span>
                          <p className="font-oswald text-xs text-gray-600">PHOTO</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    <p className="text-gray-600 text-xs">Click to upload profile photo</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                    </div>
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Birthday</label>
                      <input type="date" value={form.birthday} onChange={e => update("birthday", e.target.value)} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-3">Favorite GNS Artists</label>
                    <div className="flex flex-wrap gap-2">
                      {GNS_ARTISTS.map(artist => (
                        <button key={artist} type="button" onClick={() => toggleArray("favoriteArtists", artist)}
                          className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (form.favoriteArtists.includes(artist) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                          {artist}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-3">Music Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map(genre => (
                        <button key={genre} type="button" onClick={() => toggleArray("genres", genre)}
                          className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (form.genres.includes(genre) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="border border-red-500/30 bg-red-500/10 px-4 py-2">
                      <p className="text-red-400 text-xs font-oswald tracking-widest">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border border-secondaryInteraction text-gray-500 font-oswald text-sm py-4 tracking-widest hover:border-white transition-colors">
                      BACK
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50">
                      {loading ? "CREATING..." : "CREATE ACCOUNT"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          <p className="text-center font-oswald text-xs tracking-[5px] text-gray-800 mt-6">EXIST ALTRUISTIC</p>

        </div>
      </main>
    </PageWrapper>
  );
}
