"use client";
import { useRadio } from "../context/RadioContext";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function RadioPage() {
  const { tracks, currentIndex, isPlaying, progress, duration, volume, loading, currentTrack, play, toggle, next, prev, seek, setVolume, shuffle, shuffled } = useRadio();

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const elapsed = (progress / 100) * duration;

  return (
    <PageWrapper>
      <main className="min-h-screen pb-24">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center tracking-widest">GNS RADIO</h1>
          <p className="text-center text-gray-500 font-oswald text-xs tracking-[4px] mt-2">EXIST ALTRUISTIC</p>
        </Header>

        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Now playing */}
          {currentTrack && (
            <div className="border border-accent mb-8" style={{ background: "rgba(240,181,30,0.04)" }}>
              <div className="flex gap-6 p-6">
                <div className="w-24 h-24 flex-shrink-0 border border-secondaryInteraction overflow-hidden">
                  {currentTrack.cover_image
                    ? <img src={currentTrack.cover_image} alt={currentTrack.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: "conic-gradient(#F0B51E,#b07800,#F0B51E)" }}>
                        <span className="font-oswald text-xs font-bold text-black">GNS</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-oswald text-xs tracking-widest text-accent uppercase mb-1">Now Playing</p>
                  <h2 className="font-oswald text-2xl font-bold text-white mb-1 truncate">{currentTrack.title}</h2>
                  <p className="text-gray-500 text-sm mb-4">
                    {currentTrack.artist_name}{currentTrack.featuring ? ` ft. ${currentTrack.featuring}` : ""}
                  </p>

                  {/* Progress */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-oswald text-xs text-gray-600" style={{ fontFamily: "monospace" }}>{fmt(elapsed)}</span>
                    <div className="flex-1 h-1 bg-secondaryInteraction cursor-pointer rounded"
                      onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
                      <div className="h-full bg-accent rounded transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="font-oswald text-xs text-gray-600" style={{ fontFamily: "monospace" }}>{fmt(duration)}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    <button onClick={prev} className="text-gray-500 hover:text-white transition-colors text-xl">⏮</button>
                    <button onClick={toggle}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold text-lg transition-colors"
                      style={{ background: "#F0B51E" }}>
                      {loading ? "⏳" : isPlaying ? "⏸" : "▶"}
                    </button>
                    <button onClick={next} className="text-gray-500 hover:text-white transition-colors text-xl">⏭</button>
                    <button onClick={shuffle} className="transition-colors text-lg" style={{ color: shuffled ? "#F0B51E" : "#555" }} title="Shuffle">⇄</button>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-gray-600 text-sm">{volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}</span>
                      <input type="range" min={0} max={1} step={0.01} value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        className="w-20 cursor-pointer" style={{ accentColor: "#F0B51E" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track list */}
          <div>
            <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-4">Queue — {tracks.length} Tracks</p>
            {tracks.length === 0 ? (
              <div className="border border-secondaryInteraction p-16 text-center">
                <p className="font-oswald text-gray-600 tracking-widest">NO TRACKS AVAILABLE</p>
              </div>
            ) : (
              <div className="divide-y divide-secondaryInteraction border border-secondaryInteraction">
                {tracks.map((track, i) => (
                  <button key={track.id} onClick={() => play(i)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondaryInteraction group"
                    style={{ background: i === currentIndex ? "rgba(240,181,30,0.06)" : "transparent" }}>
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center" style={{ color: i === currentIndex ? "#F0B51E" : "#444" }}>
                      {i === currentIndex && isPlaying ? (
                        <span className="text-accent text-sm">▶</span>
                      ) : (
                        <span className="font-oswald text-xs group-hover:hidden">{i + 1}</span>
                      )}
                      <span className="font-oswald text-xs hidden group-hover:block" style={{ display: i === currentIndex && isPlaying ? "none" : undefined }}>▶</span>
                    </div>
                    <div className="w-8 h-8 flex-shrink-0 overflow-hidden border border-secondaryInteraction">
                      {track.cover_image
                        ? <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full" style={{ background: "conic-gradient(#F0B51E,#b07800,#F0B51E)" }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-oswald text-sm font-bold truncate" style={{ color: i === currentIndex ? "#F0B51E" : "#fff" }}>
                        {track.title}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {track.artist_name}{track.featuring ? ` ft. ${track.featuring}` : ""}
                      </p>
                    </div>
                    {track.duration && (
                      <span className="text-gray-600 text-xs flex-shrink-0 font-mono">{track.duration}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VPS stream placeholder */}
          {process.env.NEXT_PUBLIC_RADIO_STREAM_URL && (
            <div className="mt-8 border border-accent p-4 text-center">
              <p className="font-oswald text-xs tracking-widest text-accent mb-2">LIVE STREAM</p>
              <audio src={process.env.NEXT_PUBLIC_RADIO_STREAM_URL} controls className="w-full" />
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
