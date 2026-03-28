"use client";
import { useRadio } from "../context/RadioContext";
import Link from "next/link";
import { useState, useEffect } from "react";

function VisualizerBars({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14, width: 18, flexShrink: 0 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: 3, borderRadius: 1, background: "#F0B51E",
          animation: active ? `barPulse${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate` : "none",
          height: active ? undefined : "20%",
        }} />
      ))}
      <style>{`
        @keyframes barPulse0 { from { height: 20% } to { height: 90% } }
        @keyframes barPulse1 { from { height: 40% } to { height: 70% } }
        @keyframes barPulse2 { from { height: 20% } to { height: 100% } }
        @keyframes barPulse3 { from { height: 50% } to { height: 60% } }
      `}</style>
    </div>
  );
}

export default function RadioBar() {
  const { currentTrack, isPlaying, progress, duration, volume, loading, toggle, next, prev, seek, setVolume, shuffle, shuffled, tracks } = useRadio();
  const [showVolume, setShowVolume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hidden until artist tracks are populated — remove this line to re-enable
  return null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!currentTrack || tracks.length === 0) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const elapsed = (progress / 100) * duration;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
      background: "rgba(10,10,10,0.97)", borderTop: "1px solid #1a1a1a",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ width: "100%", height: 2, background: "#1a1a1a", cursor: "pointer" }}
        onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#F0B51E", transition: "width 0.2s" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, padding: isMobile ? "8px 12px" : "8px 16px", height: isMobile ? 56 : 60 }}>
        <div style={{ width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, flexShrink: 0, background: "#1a1a1a", overflow: "hidden", border: "1px solid #2a2a2a" }}>
          {currentTrack.cover_image
            ? <img src={currentTrack.cover_image} alt={currentTrack.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "conic-gradient(#F0B51E,#b07800,#F0B51E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: "#000", letterSpacing: 1 }}>GNS</span>
              </div>
          }
        </div>
        <div style={{ minWidth: 0, flex: isMobile ? 1 : "0 1 160px" }}>
          <p style={{ color: "#fff", fontSize: isMobile ? 11 : 12, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-oswald)", letterSpacing: 1 }}>
            {currentTrack.title}
          </p>
          <p style={{ color: "#555", fontSize: 10, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentTrack.artist_name}{currentTrack.featuring ? ` ft. ${currentTrack.featuring}` : ""}
          </p>
        </div>
        {!isMobile && <VisualizerBars active={isPlaying} />}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 6, flexShrink: 0 }}>
          {!isMobile && <button onClick={prev} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 15, padding: "4px 6px" }}>⏮</button>}
          <button onClick={toggle} style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%", background: "#F0B51E", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {loading ? "⏳" : isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={next} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 15, padding: "4px 6px" }}>⏭</button>
        </div>
        {!isMobile && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{ color: "#444", fontSize: 10, flexShrink: 0, fontFamily: "monospace" }}>{fmt(elapsed)}</span>
            <div style={{ flex: 1, height: 2, background: "#1a1a1a", borderRadius: 2, cursor: "pointer" }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#F0B51E", borderRadius: 2, transition: "width 0.2s" }} />
            </div>
            <span style={{ color: "#444", fontSize: 10, flexShrink: 0, fontFamily: "monospace" }}>{fmt(duration)}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, flexShrink: 0 }}>
          <button onClick={shuffle} style={{ background: "none", border: "none", color: shuffled ? "#F0B51E" : "#444", cursor: "pointer", fontSize: 13, padding: "4px 6px" }} title="Shuffle">⇄</button>
          {!isMobile && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowVolume(v => !v)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 13, padding: "4px 6px" }}>
                {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
              </button>
              {showVolume && (
                <div style={{ position: "absolute", bottom: 44, right: 0, background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <input type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, cursor: "pointer", accentColor: "#F0B51E" }} />
                </div>
              )}
            </div>
          )}
          <Link href="/radio" style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 6, padding: isMobile ? "3px 8px" : "4px 10px", fontSize: isMobile ? 9 : 10, fontFamily: "var(--font-oswald)", letterSpacing: 1, textDecoration: "none", whiteSpace: "nowrap" }}>
            {isMobile ? "RADIO" : "GNS RADIO"}
          </Link>
        </div>
      </div>
    </div>
  );
}
