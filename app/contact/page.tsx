"use client";
import React, { useState } from "react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const subjects = [
    "General Inquiry",
    "Booking",
    "Press & Media",
    "Licensing",
    "Fan Club",
    "Artist Submission",
    "Partnership",
    "Technical Support",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", data: form }),
      });
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center">Contact</h1>
        </Header>
        <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-oswald text-2xl font-bold mb-6 tracking-widest">GET IN TOUCH</h2>
            <div className="flex flex-col gap-6 mb-8">
              {[
                { label: "General", value: "goodnaturedsouls@gmail.com", href: "mailto:goodnaturedsouls@gmail.com" },
                { label: "Booking", value: "booking@goodnaturedsouls.com", href: "mailto:booking@goodnaturedsouls.com" },
                { label: "Press", value: "press@goodnaturedsouls.com", href: "mailto:press@goodnaturedsouls.com" },
                { label: "Licensing", value: "licensing@goodnaturedsouls.com", href: "mailto:licensing@goodnaturedsouls.com" },
                { label: "Discord", value: "discord.gg/tr6Gybnu", href: "https://discord.gg/tr6Gybnu" },
              ].map((item, i) => (
                <div key={i} className="border-b border-secondaryInteraction pb-4">
                  <p className="font-oswald text-xs tracking-widest text-gray-500 uppercase mb-1">{item.label}</p>
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" className="text-accent hover:underline text-sm">{item.value}</a>
                </div>
              ))}
            </div>
            <div className="border border-secondaryInteraction p-6 mb-4">
              <p className="font-oswald text-sm font-bold tracking-widest mb-2">BUSINESS HOURS</p>
              <p className="text-gray-500 text-sm">Monday - Friday: 10am - 6pm EST</p>
              <p className="text-gray-500 text-sm">Response time: 24-48 hours</p>
            </div>
            <div className="border border-secondaryInteraction p-6">
              <p className="font-oswald text-sm font-bold tracking-widest mb-2">LOCATION</p>
              <p className="text-gray-500 text-sm">New York City, NY</p>
              <p className="text-gray-500 text-sm">United States</p>
            </div>
          </div>

          <div>
            <h2 className="font-oswald text-2xl font-bold mb-6 tracking-widest">SEND A MESSAGE</h2>
            {status === "success" ? (
              <div className="border border-accent p-8 text-center">
                <p className="font-oswald text-2xl font-bold text-accent mb-2">MESSAGE SENT</p>
                <p className="text-gray-400 text-sm mb-2">Thank you for reaching out. We will get back to you within 24-48 hours.</p>
                <p className="text-gray-600 text-xs mb-6">A confirmation email has been sent to your inbox.</p>
                <button onClick={() => setStatus("idle")} className="font-oswald text-xs text-accent tracking-widest hover:underline">SEND ANOTHER</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                  </div>
                  <div>
                    <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" required />
                  </div>
                </div>
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Subject</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" required>
                    <option value="">Select a subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Message</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us what is on your mind..." rows={8} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600 resize-none" required />
                </div>
                {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again or email us directly.</p>}
                <button type="submit" disabled={status === "loading"} className="bg-accent text-primary font-oswald font-bold text-sm px-6 py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50">
                  {status === "loading" ? "SENDING..." : "SEND MESSAGE"}
                </button>
                <p className="text-gray-600 text-xs text-center">You will receive an automatic confirmation email after submitting.</p>
              </form>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
