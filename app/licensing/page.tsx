"use client";
import React, { useState } from "react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function LicensingPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", useCase: "", track: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const useCases = ["Film & TV", "Advertising", "Video Game", "Podcast", "YouTube / Content Creation", "Live Performance", "Streaming", "Other"];

  const [honeypot, setHoneypot] = React.useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setStatus("loading");
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          data: {
            name: form.name,
            email: form.email,
            subject: "Licensing",
            message: `Company: ${form.company}\nUse Case: ${form.useCase}\nTrack: ${form.track}\n\n${form.message}`,
            source: "licensing",
            inquiry_type: "licensing",
            priority: "high",
            consent_given: true,
          },
        }),
      });
      setStatus("success");
      setSubmitted(true);
      setForm({ name: "", email: "", company: "", useCase: "", track: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center">Licensing</h1>
        </Header>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="font-oswald text-2xl font-bold mb-6 tracking-widest text-accent">SYNC LICENSING</h2>
              <p className="text-gray-400 leading-relaxed mb-6">Good Natured Souls represents a roster of talented Hip-Hop and R&B artists available for sync licensing opportunities. Our music is available for film, television, advertising, video games, and more.</p>
              {[
                { title: "Film & Television", desc: "Feature films, documentaries, TV shows, streaming series" },
                { title: "Advertising", desc: "Commercial spots, brand campaigns, social media ads" },
                { title: "Video Games", desc: "Background music, cutscenes, promotional trailers" },
                { title: "Digital Content", desc: "YouTube, podcasts, social media content" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <span className="text-accent mt-1">◆</span>
                  <div>
                    <p className="font-oswald font-bold text-sm">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="border border-secondaryInteraction p-4 mt-6">
                <p className="font-oswald text-xs tracking-widest text-gray-500 uppercase mb-2">Licensing Inquiries</p>
                <a href="mailto:licensing@goodnaturedsouls.com" className="text-accent hover:underline text-sm">licensing@goodnaturedsouls.com</a>
              </div>
            </div>
            <div>
              {submitted ? (
                <div className="border border-accent p-8 text-center">
                  <p className="font-oswald text-2xl font-bold text-accent mb-2">REQUEST RECEIVED</p>
                  <p className="text-gray-400 text-sm">Our licensing team will review your request and get back to you within 3-5 business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                  <h2 className="font-oswald text-xl font-bold tracking-widest">REQUEST A LICENSE</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Name</label>
                      <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                    </div>
                    <div>
                      <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Company</label>
                      <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Company name" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                    </div>
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Use Case</label>
                    <select value={form.useCase} onChange={e => setForm(p => ({ ...p, useCase: e.target.value }))} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" required>
                      <option value="">Select use case</option>
                      {useCases.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Track / Artist</label>
                    <input type="text" value={form.track} onChange={e => setForm(p => ({ ...p, track: e.target.value }))} placeholder="e.g. STILL ALIVE by Prince Inspiration" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Project Details</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your project..." rows={4} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600 resize-none" required />
                  </div>
                  <button type="submit" className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-4 tracking-widest hover:bg-accentInteraction transition-colors">
                    SUBMIT REQUEST
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
