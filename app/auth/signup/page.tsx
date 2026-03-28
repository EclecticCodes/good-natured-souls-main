"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../Components/PageWrapper";

const GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Afrobeats", "Pop", "Electronic", "Gospel", "Reggae", "Other"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gnsArtists, setGnsArtists] = useState<{name: string; profileImage: string}[]>([]);
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    email: "", password: "", confirm: "",
    birthday: "", phone: "", theme_artist: "",
    genres: [] as string[],
    favoriteArtists: [] as string[],
  });

  React.useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "https://gns-cms-production.up.railway.app";
    fetch(`${strapiUrl}/api/artists?populate=profileImage&pagination[limit]=50&sort=orderRank:asc`)
      .then(r => r.json())
      .then(d => {
        const mapped = (d.data || []).map((a: any) => {
          const imgUrl = a.attributes?.profileImage?.data?.attributes?.url || '';
          const fullUrl = imgUrl.startsWith('http') ? imgUrl : imgUrl ? `${strapiUrl}${imgUrl}` : '';
          return { name: a.attributes?.name || a.name, profileImage: fullUrl };
        }).filter((a: any) => a.name);
        setGnsArtists(mapped);
      })
      .catch(() => {});
  }, []);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleArray = (field: "genres" | "favoriteArtists", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value]
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setError("First name is required."); return; }
    if (!form.last_name.trim()) { setError("Last name is required."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          birthday: form.birthday,
          theme_artist: form.theme_artist,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }

      // Save preferences
      if (form.genres.length > 0 || form.favoriteArtists.length > 0 || form.phone) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: form.phone,
            genres: form.genres,
            favorite_artists: form.favoriteArtists,
          }),
        });
      }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/auth/welcome");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/account" });

  const inputClass = "w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600";
  const labelClass = "font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2";

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <a href="/" className="font-erica text-5xl text-white">GNS</a>
            <div className="w-8 h-0.5 bg-accent mx-auto my-3" />
            <p className="font-oswald text-xs tracking-[5px] text-gray-600 uppercase">Good Natured Souls</p>
          </div>

          <div className="border border-secondaryInteraction border-t-2 border-t-accent">
            <div className="flex border-b border-secondaryInteraction">
              <a href="/auth/login" className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors font-bold">SIGN IN</a>
              <div className="flex-1 py-3.5 text-center font-oswald text-xs tracking-widest text-accent font-bold border-b-2 border-accent -mb-px cursor-default">CREATE ACCOUNT</div>
            </div>

            {/* Step indicator */}
            <div className="flex border-b border-secondaryInteraction">
              <div className={"flex-1 h-0.5 transition-colors " + (step >= 1 ? "bg-accent" : "bg-secondaryInteraction")} />
              <div className={"flex-1 h-0.5 transition-colors " + (step >= 2 ? "bg-accent" : "bg-secondaryInteraction")} />
            </div>

            <div className="p-7">
              {step === 1 && (
                <>
                  <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-secondaryInteraction py-3 font-oswald text-xs tracking-widest hover:border-white transition-colors mb-5">
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
                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>First Name <span className="text-accent">*</span></label>
                        <input type="text" value={form.first_name} onChange={e => update("first_name", e.target.value)} placeholder="First" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name <span className="text-accent">*</span></label>
                        <input type="text" value={form.last_name} onChange={e => update("last_name", e.target.value)} placeholder="Last" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Middle Name <span className="text-gray-600">(optional)</span></label>
                      <input type="text" value={form.middle_name} onChange={e => update("middle_name", e.target.value)} placeholder="Middle" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email <span className="text-accent">*</span></label>
                      <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" autoComplete="email" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Password <span className="text-accent">*</span></label>
                      <input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 8 characters" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm Password <span className="text-accent">*</span></label>
                      <input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder="Repeat password" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Birthday <span className="text-gray-600">(optional — cannot be changed later)</span></label>
                      <input type="date" value={form.birthday} onChange={e => update("birthday", e.target.value)} className={inputClass} />
                    </div>

                    {error && <div className="border border-red-500/30 bg-red-500/10 px-4 py-2"><p className="text-red-400 text-xs font-oswald tracking-widest">{error}</p></div>}
                    <button type="submit" className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors">NEXT</button>
                  </form>

                  <p className="text-center text-xs text-gray-600 mt-5">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-accent font-oswald tracking-widest hover:underline">Sign in</a>
                  </p>
                </>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="text-center mb-2">
                    <p className="font-oswald text-sm font-bold tracking-widest">{form.first_name} {form.last_name}</p>
                    <p className="text-gray-500 text-xs">{form.email}</p>
                  </div>

                  <div>
                    <label className={labelClass}>Phone <span className="text-gray-600">(optional)</span></label>
                    <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Favorite GNS Artists</label>
                    <div className="flex flex-wrap gap-2">
                      {gnsArtists.map(artist => (
                        <button key={artist} type="button" onClick={() => toggleArray("favoriteArtists", artist)}
                          className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (form.favoriteArtists.includes(artist) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                          {artist}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Music Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map(genre => (
                        <button key={genre} type="button" onClick={() => toggleArray("genres", genre)}
                          className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (form.genres.includes(genre) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="border border-red-500/30 bg-red-500/10 px-4 py-2"><p className="text-red-400 text-xs font-oswald tracking-widest">{error}</p></div>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border border-secondaryInteraction text-gray-500 font-oswald text-sm py-4 tracking-widest hover:border-white transition-colors">BACK</button>
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
