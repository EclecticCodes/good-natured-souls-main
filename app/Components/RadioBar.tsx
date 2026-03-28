"use client";
import { useRadio } from "../context/RadioContext";
import Link from "next/link";
import { useState } from "react";

function VisualizerBars({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16, width: 20 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: 3, borderRadius: 1, background: "#F0B51E",
          height: active ? `${30 + Math.sin(Date.now() / 200 + i) * 70}%` : "20%",
          animation: active ? `barPulse${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate` : "none",
          transition: "height 0.1s",
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

  if (!currentTrack || tracks.length === 0) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const elapsed = (progress / 100) * duration;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
      background: "rgba(10,10,10,0.97)", borderTop: "1px solid #1a1a1a",
      backdropFilter: "blur(12px)", display: "flex", alignItems: "center",
      gap: 12, padding: "10px 16px", height: 64,
    }}>
      {/* Cover */}
      <div style={{ width: 40, height: 40, flexShrink: 0, background: "#1a1a1a", overflow: "hidden", border: "1px solid #2a2a2a" }}>
        {currentTrack.cover_image
          ? <img src={currentTrack.cover_image} alt={currentTrack.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "conic-gradient(#F0B51E,#b07800,#F0B51E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#000", letterSpacing: 1 }}>GNS</span>
            </div>
        }
      </div>

      {/* Track info */}
      <div style={{ minWidth: 0, flexShrink: 1, width: 140 }}>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-oswald)" }}>
          {currentTrack.title}
        </p>
        <p style={{ color: "#555", fontSize: 10, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {currentTrack.artist_name}{currentTrack.featuring ? ` ft. ${currentTrack.featuring}` : ""}
        </p>
      </div>

      {/* Visualizer */}
      <VisualizerBars active={isPlaying} />

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={prev} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: "4px 6px" }}>⏮</button>
        <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0B51E", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {loading ? "⏳" : isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={next} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: "4px 6px" }}>⏭</button>
      </div>

      {/* Progress bar */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ color: "#444", fontSize: 10, flexShrink: 0, fontFamily: "monospace" }}>{fmt(elapsed)}</span>
        <div style={{ flex: 1, height: 3, background: "#1a1a1a", borderRadius: 2, cursor: "pointer", position: "relative" }}
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#F0B51E", borderRadius: 2, transition: "width 0.2s" }} />
        </div>
        <span style={{ color: "#444", fontSize: 10, flexShrink: 0, fontFamily: "monospace" }}>{fmt(duration)}</span>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={shuffle} title="Shuffle"
          style={{ background: "none", border: "none", color: shuffled ? "#F0B51E" : "#444", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>⇄</button>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowVolume(v => !v)}
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>
            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>
          {showVolume && (
            <div style={{ position: "absolute", bottom: 40, right: 0, background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <input type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, cursor: "pointer", accentColor: "#F0B51E" }} />
            </div>
          )}
        </div>
        <Link href="/radio" style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontFamily: "var(--font-oswald)", letterSpacing: 1, textDecoration: "none" }}>
          GNS RADIO
        </Link>
      </div>
    </div>
  );
}
