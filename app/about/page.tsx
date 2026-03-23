"use client";
import { PageWrapper } from "../Components/PageWrapper";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const MARQUEE_TEXT = [
  "EXIST ALTRUISTIC", "GOOD NATURED SOULS", "EXIST ALTRUISTIC",
  "NEW YORK CITY", "EXIST ALTRUISTIC", "THE BRONX",
  "EXIST ALTRUISTIC", "INDEPENDENT MUSIC", "EXIST ALTRUISTIC", "HIP HOP & R&B",
];

const MISSION_VALUES = [
  { number: "01", title: "Authenticity", body: "We amplify voices that are true to themselves — raw, real, and unfiltered. No compromises, no shortcuts." },
  { number: "02", title: "Community", body: "Music is nothing without the people who feel it. We build bridges between artists and the communities that need their stories." },
  { number: "03", title: "Excellence", body: "We hold ourselves to the highest standard in everything we produce, represent, and release into the world." },
  { number: "04", title: "Altruism", body: "Exist altruistic. Give more than you take. Lift as you climb. This is the code we live and work by." },
];

type ArtistData = {
  id: string;
  name: string;
  slug: string;
  profileImage: string;
  artistType: "roster" | "affiliate" | "spotlight";
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [rosterArtists, setRosterArtists] = useState<ArtistData[]>([]);

  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Handles both local Strapi URLs and absolute Cloudinary URLs
const resolveUrl = (url: string | undefined | null, strapiUrl: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${strapiUrl}${url}`;
};

    fetch(`${strapiUrl}/api/artists?populate=profileImage&sort=orderRank:asc`)
      .then((r) => r.json())
      .then((json) => {
        setRosterArtists(
          (json.data || []).map((item: any) => ({
            id: String(item.id),
            name: item.attributes.name,
            slug: item.attributes.slug,
            profileImage: item.attributes.profileImage?.data?.attributes?.url
              ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl) : "",
            artistType: item.attributes.artistType || "roster",
          }))
        );
      })
      .catch(() => {});
  }, []);

  const officialRoster = rosterArtists.filter((a) => a.artistType === "roster");
  const affiliates = rosterArtists.filter((a) => a.artistType === "affiliate");
  const spotlights = rosterArtists.filter((a) => a.artistType === "spotlight");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", data: form }),
      });
      if (res.ok) { setSent(true); setForm({ name: "", email: "", subject: "", message: "" }); }
      else setError("Something went wrong. Please try again.");
    } catch { setError("Something went wrong. Please try again."); }
    setSending(false);
  };

  const ArtistCard = ({ artist, variant }: { artist: ArtistData; variant: "roster" | "affiliate" | "spotlight" }) => (
    <motion.a
      href={`/artists/${artist.slug}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-background group hover:bg-secondaryInteraction/20 transition-colors duration-300 overflow-hidden relative"
    >
      {variant === "spotlight" && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-600 text-black font-oswald text-xs px-2 py-0.5 tracking-widest">SPOTLIGHT</div>
      )}
      <div className="aspect-square overflow-hidden">
        {artist.profileImage ? (
          <img
            src={artist.profileImage}
            alt={artist.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${variant === "affiliate" ? "grayscale group-hover:grayscale-0" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-secondaryInteraction flex items-center justify-center">
            <span className={`font-erica text-3xl ${variant === "spotlight" ? "text-yellow-600" : variant === "affiliate" ? "text-gray-500" : "text-accent"}`}>GNS</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className={`font-oswald text-sm tracking-widest transition-colors ${variant === "affiliate" ? "text-gray-400 group-hover:text-white" : "group-hover:text-accent"}`}>
          {artist.name.toUpperCase()}
        </p>
        <p className={`font-oswald text-xs tracking-widest mt-1 ${variant === "spotlight" ? "text-yellow-600" : variant === "affiliate" ? "text-gray-600" : "text-accent"}`}>
          {variant === "roster" ? "ROSTER" : variant === "affiliate" ? "AFFILIATE" : "SPOTLIGHT"}
        </p>
      </div>
    </motion.a>
  );

  return (
    <PageWrapper>
      {/* ── HERO ── */}
      <div ref={heroRef} className="relative min-h-[70vh] overflow-hidden flex items-end pb-16">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/jumbotronFive.jpg)", y: heroY }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">
            New York City · The Bronx · Est. 2020
          </motion.p>
          <motion.h1 custom={0.3} variants={fadeUp} initial="hidden" animate="visible"
            className="font-cormorant font-bold text-white text-5xl md:text-8xl leading-none tracking-tight mb-6">
            Good<br />Natured<br />Souls
          </motion.h1>
          <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate="visible" className="w-24 h-px bg-accent" />
        </motion.div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden bg-accent text-primary py-3 w-full">
        <motion.div
          className="flex whitespace-nowrap font-oswald font-bold text-sm tracking-[0.3em]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          {[...MARQUEE_TEXT, ...MARQUEE_TEXT].map((t, i) => (
            <span key={i} className="mx-10">{t}</span>
          ))}
        </motion.div>
      </div>

      {/* ── OUR STORY ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-start">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
          <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">Our Story</p>
          <h2 className="font-cormorant font-bold text-4xl md:text-5xl leading-tight mb-8">A label built on kindness, purpose & community.</h2>
          <div className="w-12 h-px bg-accent mb-8" />
          <p className="text-gray-400 leading-relaxed text-lg mb-6">
            Welcome to Good Natured Souls — a media company thriving in the cultural epicenter of New York City. We're here to nurture and showcase the vibrant, authentic talent that our city has to offer.
          </p>
          <p className="text-gray-400 leading-relaxed text-lg">
            Our name reflects our core belief that creativity flourishes best when it's rooted in kindness, purpose, and a deep connection to the community. Guided by our motto{" "}
            <span className="text-accent font-oswald tracking-widest">"Exist Altruistic,"</span>{" "}
            we aim to be a beacon of positivity and artistic growth — and set the standard for excellence in the music industry.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }} className="relative h-[500px] md:h-[600px] overflow-hidden">
          <img src="/images/jumbotronsix.jpeg" alt="Good Natured Souls" className="w-full h-full object-cover object-top" />
          <div className="absolute -bottom-4 -left-4 w-full h-full border border-accent pointer-events-none" />
        </motion.div>
      </section>

      {/* ── FOUNDER QUOTE ── */}
      <section className="bg-secondaryInteraction/30 border-y border-secondaryInteraction py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-8">A Message From Our Founder</p>
            <blockquote className="font-cormorant text-2xl md:text-4xl text-white leading-relaxed mb-10 italic">
              "Good Natured Souls was a dream from my younger self — someone who often felt overlooked, much like the borough I'm from. I conceived the idea when I felt it was time for artists from New York, and more specifically the Bronx, to be seen and felt. It felt serendipitous, like a needed return to hip hop's origins, intertwined with my personal philosophy and ethics."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-accent" />
              <div>
                <p className="font-oswald font-bold text-white tracking-widest">ECLECTIC SAGE</p>
                <p className="font-oswald text-gray-500 text-xs tracking-widest">Founder, Good Natured Souls</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VALUES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">What We Stand For</p>
          <h2 className="font-cormorant font-bold text-4xl md:text-5xl">Mission & Values</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-px bg-secondaryInteraction">
          {MISSION_VALUES.map((v, i) => (
            <motion.div key={v.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-background p-8 group hover:bg-secondaryInteraction/20 transition-colors duration-300">
              <p className="font-oswald text-accent text-4xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{v.number}</p>
              <h3 className="font-oswald text-xl font-bold tracking-widest mb-3">{v.title.toUpperCase()}</h3>
              <p className="text-gray-500 leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ROSTER ── */}
      <section className="border-t border-secondaryInteraction py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14 flex items-end justify-between">
            <div>
              <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">The Roster</p>
              <h2 className="font-cormorant font-bold text-4xl md:text-5xl">Our Artists</h2>
            </div>
            <a href="/artists" className="font-oswald text-xs tracking-widest text-accent border border-accent px-6 py-3 hover:bg-accent hover:text-primary transition-colors hidden md:block">
              VIEW ALL ARTISTS
            </a>
          </motion.div>

          {/* Official Roster */}
          {officialRoster.length > 0 && (
            <div className="mb-12">
              <p className="font-oswald text-xs tracking-[0.3em] text-gray-500 uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-accent inline-block" />Official Roster
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-secondaryInteraction">
                {officialRoster.map((a) => <ArtistCard key={a.id} artist={a} variant="roster" />)}
              </div>
            </div>
          )}

          {/* Affiliates */}
          {affiliates.length > 0 && (
            <div className="mb-12">
              <p className="font-oswald text-xs tracking-[0.3em] text-gray-500 uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-gray-600 inline-block" />Affiliates
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-secondaryInteraction">
                {affiliates.map((a) => <ArtistCard key={a.id} artist={a} variant="affiliate" />)}
              </div>
            </div>
          )}

          {/* Spotlights */}
          {spotlights.length > 0 && (
            <div className="mb-12">
              <p className="font-oswald text-xs tracking-[0.3em] text-gray-500 uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-yellow-600 inline-block" />Artist Spotlight
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-secondaryInteraction">
                {spotlights.map((a) => <ArtistCard key={a.id} artist={a} variant="spotlight" />)}
              </div>
            </div>
          )}

          {rosterArtists.length === 0 && (
            <div className="border border-dashed border-secondaryInteraction p-16 text-center">
              <p className="font-oswald text-xs tracking-widest text-gray-600">ARTISTS COMING SOON</p>
            </div>
          )}

          <div className="mt-6 md:hidden">
            <a href="/artists" className="font-oswald text-xs tracking-widest text-accent border border-accent px-6 py-3 hover:bg-accent hover:text-primary transition-colors block text-center">
              VIEW ALL ARTISTS
            </a>
          </div>
        </div>
      </section>

      {/* ── PRESS & MEDIA ── */}
      <section className="bg-secondaryInteraction/20 border-y border-secondaryInteraction py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">Press & Media</p>
            <h2 className="font-cormorant font-bold text-4xl md:text-5xl mb-6">Media Inquiries</h2>
            <p className="text-gray-400 max-w-xl leading-relaxed">
              For press coverage, interview requests, photo/video usage, and media partnerships, reach out to our team. Each inquiry routes to the right person.
            </p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/contact?subject=Press+%26+Media" className="font-oswald text-sm tracking-widest px-8 py-4 border border-accent text-accent hover:bg-accent hover:text-primary transition-colors text-center">PRESS INQUIRIES ↗</a>
            <a href="/contact?subject=Booking" className="font-oswald text-sm tracking-widest px-8 py-4 border border-secondaryInteraction text-white hover:border-white transition-colors text-center">BOOKING INQUIRIES ↗</a>
            <a href="/contact?subject=Licensing" className="font-oswald text-sm tracking-widest px-8 py-4 border border-secondaryInteraction text-white hover:border-white transition-colors text-center">LICENSING ↗</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="font-oswald text-accent text-xs tracking-[0.4em] uppercase mb-4">Get In Touch</p>
          <h2 className="font-cormorant font-bold text-4xl md:text-5xl mb-4">Contact Us</h2>
          <p className="text-gray-500 leading-relaxed">Have a question, a collaboration idea, or just want to connect? We'd love to hear from you.</p>
        </motion.div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-accent p-12 text-center">
            <p className="font-oswald text-accent text-2xl tracking-widest mb-2">MESSAGE SENT</p>
            <p className="text-gray-500 text-sm">We'll get back to you shortly. Thanks for reaching out.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-transparent border border-gray-600 text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-transparent border border-gray-600 text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Subject</label>
              <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="bg-background border border-gray-600 text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors">
                <option value="">Select a subject</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Booking">Booking</option>
                <option value="Press & Media">Press & Media</option>
                <option value="Licensing">Licensing</option>
                <option value="Fan Club">Fan Club</option>
                <option value="Artist Submission">Artist Submission</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase">Message</label>
              <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind..."
                className="bg-transparent border border-gray-600 text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-500 resize-none" />
            </div>
            {error && <p className="text-red-500 text-sm font-oswald">{error}</p>}
            <button type="submit" disabled={sending}
              className="font-oswald font-bold text-sm tracking-widest px-8 py-4 bg-accent text-primary hover:bg-accentInteraction transition-colors disabled:opacity-50 self-start">
              {sending ? "SENDING..." : "SEND MESSAGE →"}
            </button>
          </form>
        )}
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="border-t border-secondaryInteraction py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="font-cormorant text-gray-600 text-lg italic mb-4">Guided by our motto</p>
          <h2 className="font-oswald font-bold text-4xl md:text-6xl tracking-widest text-accent mb-8">EXIST ALTRUISTIC</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/artists" className="font-oswald font-bold text-sm tracking-widest px-8 py-4 bg-accent text-primary hover:bg-accentInteraction transition-colors">MEET OUR ARTISTS</a>
            <a href="/fanclub" className="font-oswald font-bold text-sm tracking-widest px-8 py-4 border border-white text-white hover:bg-white hover:text-primary transition-colors">JOIN THE FAN CLUB</a>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  );
}