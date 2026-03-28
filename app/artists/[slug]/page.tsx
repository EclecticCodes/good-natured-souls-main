"use client";
import { getArtistWithProjects } from "../../../sanity/strapi-utils";
import React, { useState } from "react";
import { PageWrapper } from "../../Components/PageWrapper";
import { TopTracks } from "./TopTracks";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

function getYoutubeEmbedId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function VideoModal({ video, onClose }: { video: any; onClose: () => void }) {
  const embedId = getYoutubeEmbedId(video.videoUrl);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: -40, right: 0, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", fontFamily: "var(--font-oswald)" }}>✕ CLOSE</button>
        {embedId ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video src={video.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 4 }} />
        )}
        <p style={{ color: "#fff", fontFamily: "var(--font-oswald)", fontSize: 14, letterSpacing: 2, marginTop: 12 }}>{video.title}</p>
      </div>
    </div>
  );
}

function AudioPlayer({ mp3Url, artistName }: { mp3Url: string; artistName: string }) {
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
            if (audioRef.current) { audioRef.current.currentTime = pct * duration; }
          }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#F0B51E", borderRadius: 2, transition: "width 0.1s" }} />
        </div>
      </div>
      <span style={{ color: "#555", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>{fmt(duration * progress / 100)} / {fmt(duration)}</span>
    </div>
  );
}

const ArtistPage = async ({ params }: Props) => {
  const { slug } = await params;
  const { artist, projects } = await getArtistWithProjects(slug);

  if (!artist) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-oswald text-gray-500 tracking-widest">ARTIST NOT FOUND</p>
        </div>
      </PageWrapper>
    );
  }

  const aboutText = artist.about || null;

  return (
    <PageWrapper>
      <main className="min-h-screen bg-primary">

        {/* Hero */}
        <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end">
          {artist.backgroundImage && (
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${artist.backgroundImage})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
          <div className="absolute top-6 left-4 md:left-6 z-10">
            <Link href="/artists" className="flex items-center gap-2 font-oswald text-xs tracking-widest text-gray-400 hover:text-accent transition-colors">
              ← ARTISTS
            </Link>
          </div>
          <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 md:px-6 pb-8 md:pb-12 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">
            {artist.profileImage && (
              <div className="w-28 h-28 md:w-56 md:h-56 flex-shrink-0 border-2 border-accent overflow-hidden">
                <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-oswald text-xs tracking-[4px] md:tracking-[6px] text-accent uppercase mb-2">Good Natured Souls</p>
              <h1 className="font-oswald text-4xl md:text-7xl font-bold text-white leading-none mb-3 md:mb-4">{artist.name}</h1>
              {artist.socialMediaLinks && artist.socialMediaLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {artist.socialMediaLinks.map((link: any, i: number) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="font-oswald text-xs tracking-widest text-gray-400 hover:text-accent border border-secondaryInteraction hover:border-accent px-3 py-1.5 transition-colors uppercase">
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
              {/* Ticketing links */}
              {(artist.bandsintownUrl || artist.soundkickUrl) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {artist.bandsintownUrl && (
                    <a href={artist.bandsintownUrl} target="_blank" rel="noopener noreferrer"
                      className="font-oswald text-xs tracking-widest text-primary bg-accent hover:bg-accentInteraction px-3 py-1.5 transition-colors uppercase">
                      Bandsintown
                    </a>
                  )}
                  {artist.soundkickUrl && (
                    <a href={artist.soundkickUrl} target="_blank" rel="noopener noreferrer"
                      className="font-oswald text-xs tracking-widest border border-accent text-accent hover:bg-accent hover:text-primary px-3 py-1.5 transition-colors uppercase">
                      Songkick
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* About */}
          {aboutText && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-4">About</p>
              <div className="max-w-2xl">
                {aboutText.split("\n\n").map((para: string, i: number) => (
                  <p key={i} className="text-gray-400 text-base leading-relaxed mb-4">{para}</p>
                ))}
              </div>
              <div className="w-16 h-0.5 bg-accent mt-6" />
            </div>
          )}

          {/* MP3 Player */}
          {artist.mp3Url && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-4">Listen</p>
              <AudioPlayer mp3Url={artist.mp3Url} artistName={artist.name} />
            </div>
          )}

          {/* Spotify embed */}
          {artist.spotifyEmbedUrl && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Streaming</p>
              <TopTracks spotifyEmbedUrl={artist.spotifyEmbedUrl} />
            </div>
          )}

          {/* Music Videos */}
          {artist.musicVideos && artist.musicVideos.length > 0 && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Videos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {artist.musicVideos.map((video: any, i: number) => (
                  <VideoCardClient key={i} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Releases */}
          {projects.length > 0 && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Releases</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {projects.map((project: any) => (
                  <a key={project._id} href={project.url} target="_blank" rel="noopener noreferrer"
                    className="group block border border-secondaryInteraction hover:border-accent transition-colors">
                    <div className="aspect-square overflow-hidden bg-secondaryInteraction">
                      {project.coverImageUrl ? (
                        <img src={project.coverImageUrl} alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-oswald text-gray-600 text-xs tracking-widest">NO ART</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <p className="font-oswald text-xs md:text-sm font-bold truncate">{project.name}</p>
                      <p className="font-oswald text-xs text-gray-600 tracking-widest uppercase">{project.type} · {project.releaseYear}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Highlight Articles */}
          {artist.highlightArticles && artist.highlightArticles.length > 0 && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Press</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {artist.highlightArticles.map((article: any, i: number) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                    className="group block border border-secondaryInteraction hover:border-accent transition-colors">
                    {article.coverImage && (
                      <div className="aspect-video overflow-hidden bg-secondaryInteraction">
                        <img src={article.coverImage} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-oswald text-xs tracking-widest text-accent uppercase mb-1">{article.publication}</p>
                      <p className="font-oswald text-sm font-bold leading-snug group-hover:text-accent transition-colors">{article.title}</p>
                      <p className="font-oswald text-xs text-gray-600 tracking-widest mt-2 group-hover:text-accent transition-colors">READ →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* EPK press quote */}
          {artist.epk?.pressQuote && (
            <div className="mb-12 md:mb-16 border-l-2 border-accent pl-6 py-2 max-w-2xl">
              <p className="text-gray-300 text-lg italic leading-relaxed mb-3">"{artist.epk.pressQuote}"</p>
              {artist.epk.pressQuoteSource && (
                <p className="font-oswald text-xs tracking-widest text-accent uppercase">— {artist.epk.pressQuoteSource}</p>
              )}
            </div>
          )}

          {/* Bottom nav */}
          <div className="border-t border-secondaryInteraction pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/artists" className="font-oswald text-xs tracking-widest text-gray-500 hover:text-accent transition-colors">
              ← BACK TO ARTISTS
            </Link>
            <Link href="/store" className="font-oswald text-xs tracking-widest bg-accent text-primary px-6 py-3 hover:bg-accentInteraction transition-colors">
              VISIT STORE
            </Link>
          </div>

        </div>
      </main>
    </PageWrapper>
  );
};

function VideoCardClient({ video }: { video: any }) {
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

export default ArtistPage;
