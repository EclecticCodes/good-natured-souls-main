"use client";
import React from "react";

export function AudioPlayer({ mp3Url, artistName }: { mp3Url: string; artistName: string }) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, maxWidth: 500 }}>
      <audio ref={audioRef} src={mp3Url}
        onTimeUpdate={e => setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)} />
      <button onClick={toggle}
        style={{ width: 40, height: 40, borderRadius: "50%", background: "#F0B51E", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontSize: 12, fontFamily: "var(--font-oswald)", letterSpacing: 2, marginBottom: 6 }}>{artistName.toUpperCase()}</p>
        <div style={{ position: "relative", height: 3, background: "#2a2a2a", borderRadius: 2, cursor: "pointer" }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audioRef.current) audioRef.current.currentTime = pct * duration;
          }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#F0B51E", borderRadius: 2, transition: "width 0.1s" }} />
        </div>
      </div>
      <span style={{ color: "#555", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>{fmt(duration * progress / 100)} / {fmt(duration)}</span>
    </div>
  );
}

function VideoModal({ video, onClose }: { video: any; onClose: () => void }) {
  const embedId = video.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: -40, right: 0, background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontFamily: "var(--font-oswald)", letterSpacing: 2 }}>✕ CLOSE</button>
        {embedId ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        ) : (
          <video src={video.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 4 }} />
        )}
        <p style={{ color: "#fff", fontFamily: "var(--font-oswald)", fontSize: 14, letterSpacing: 2, marginTop: 12 }}>{video.title}</p>
      </div>
    </div>
  );
}

export function VideoCardClient({ video }: { video: any }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="group block border border-secondaryInteraction hover:border-accent transition-colors text-left w-full">
        <div className="aspect-video overflow-hidden bg-secondaryInteraction relative">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondaryInteraction">
              <span className="text-3xl">▶</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary text-xl">▶</div>
          </div>
        </div>
        <div className="p-3">
          <p className="font-oswald text-sm font-bold truncate">{video.title}</p>
          {video.description && <p className="text-gray-600 text-xs mt-1 truncate">{video.description}</p>}
        </div>
      </button>
      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  );
}
