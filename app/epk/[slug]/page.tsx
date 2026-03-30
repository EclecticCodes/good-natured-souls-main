import { getArtistWithProjects } from "../../../sanity/strapi-utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PrintButton from "./PrintButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { artist } = await getArtistWithProjects(slug);
  if (!artist) return { title: "EPK Not Found" };
  return {
    title: `${artist.name} — Electronic Press Kit`,
    description: `Official EPK for ${artist.name} — Good Natured Souls`,
    openGraph: {
      title: `${artist.name} — EPK`,
      description: `Official Electronic Press Kit for ${artist.name}`,
      images: artist.profileImage ? [artist.profileImage] : [],
    },
  };
}

const SECTION = {
  label: { fontSize: 9, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase" as const, margin: "0 0 16px", fontWeight: 700 },
  divider: { borderTop: "1px solid #1e1e1e", marginBottom: 48, paddingTop: 48 },
};

export default async function EPKPage({ params }: Props) {
  const { slug } = await params;
  const { artist, projects } = await getArtistWithProjects(slug);
  if (!artist) notFound();

  const epk = artist.epk;
  const hasMusic = artist.spotifyEmbedUrl || artist.soundcloudUrl || artist.bandcampUrl || artist.appleMusicUrl;
  const hasVideos = artist.musicVideos?.length > 0;
  const hasSocial = artist.socialMediaLinks?.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div id="epk-root" style={{ background: "#080808", color: "#fff", minHeight: "100vh", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          footer, nav, header { display: none !important; }
          #site-footer { display: none !important; }
          #epk-root { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
        @page { margin: 0.75in; size: A4; }
        .epk-section-label { font-size: 9px; letter-spacing: 4px; color: #F0B51E; text-transform: uppercase; font-weight: 700; margin: 0 0 16px; }
        .epk-divider { border-top: 1px solid #1e1e1e; margin-bottom: 48px; padding-top: 48px; }
        a { color: inherit; }
      `}</style>

      {/* Nav bar */}
      <div className="no-print" style={{ borderBottom: "1px solid #141414", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#080808", zIndex: 50 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontFamily: "serif", fontSize: 22, color: "#fff", fontWeight: 900, letterSpacing: "-0.5px" }}>GNS</span>
          <span style={{ width: 1, height: 16, background: "#2a2a2a", display: "inline-block" }} />
          <span style={{ fontSize: 9, letterSpacing: 3, color: "#444", textTransform: "uppercase" }}>Good Natured Souls</span>
        </a>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <PrintButton />
          <a href={`/artists/${slug}`} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666", padding: "9px 20px", fontSize: 11, letterSpacing: 2, textDecoration: "none", textTransform: "uppercase" }}>
            Artist Page ↗
          </a>
        </div>
      </div>

      {/* HERO */}
      <div style={{ borderBottom: "1px solid #141414", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 40px 56px" }}>
          <div style={{ display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Profile photo */}
            {artist.profileImage && (
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: 200, height: 200, overflow: "hidden", border: "1px solid #1e1e1e" }}>
                  <img src={artist.profileImage} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </div>
            )}

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ fontSize: 9, letterSpacing: 5, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 12px", fontWeight: 700 }}>Electronic Press Kit</p>
              <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-2px", lineHeight: 0.95, color: "#fff" }}>
                {artist.name}
              </h1>
              <p style={{ color: "#333", fontSize: 11, letterSpacing: 4, margin: "12px 0 20px", textTransform: "uppercase" }}>
                Good Natured Souls &nbsp;·&nbsp; The Bronx, NYC
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                {epk?.genre && (
                  <span style={{ fontSize: 10, color: "#F0B51E", letterSpacing: 2, textTransform: "uppercase", border: "1px solid #F0B51E33", padding: "4px 12px" }}>
                    {epk.genre}
                  </span>
                )}
                {epk?.location && (
                  <span style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", border: "1px solid #1e1e1e", padding: "4px 12px" }}>
                    {epk.location}
                  </span>
                )}
              </div>

              {/* Quick contact pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {epk?.bookingEmail && (
                  <a href={`mailto:${epk.bookingEmail}`} style={{ fontSize: 11, color: "#F0B51E", background: "#F0B51E11", border: "1px solid #F0B51E22", padding: "6px 14px", textDecoration: "none", letterSpacing: 1 }}>
                    Booking
                  </a>
                )}
                {epk?.pressEmail && (
                  <a href={`mailto:${epk.pressEmail}`} style={{ fontSize: 11, color: "#aaa", background: "#ffffff08", border: "1px solid #2a2a2a", padding: "6px 14px", textDecoration: "none", letterSpacing: 1 }}>
                    Press
                  </a>
                )}
                {epk?.website && (
                  <a href={epk.website.startsWith("http") ? epk.website : `https://${epk.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#aaa", background: "#ffffff08", border: "1px solid #2a2a2a", padding: "6px 14px", textDecoration: "none", letterSpacing: 1 }}>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 40px 80px" }}>

        {/* Press quote */}
        {epk?.pressQuote && (
          <div style={{ marginBottom: 56, borderLeft: "3px solid #F0B51E", paddingLeft: 28 }}>
            <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", fontStyle: "italic", color: "#ddd", lineHeight: 1.6, margin: "0 0 10px", fontWeight: 300 }}>
              "{epk.pressQuote}"
            </p>
            {epk.pressQuoteSource && (
              <p style={{ fontSize: 10, color: "#F0B51E", letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>— {epk.pressQuoteSource}</p>
            )}
          </div>
        )}

        {/* BIO */}
        {(epk?.bio || artist.about) && (
          <div className="epk-divider">
            <p className="epk-section-label">Biography</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0, maxWidth: 720 }}>
              {(epk?.bio || artist.about || "").split("\n\n").filter(Boolean).map((para: string, i: number) => (
                <p key={i} style={{ fontSize: 14, color: "#aaa", lineHeight: 1.9, margin: "0 0 16px" }}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* MUSIC LINKS */}
        {hasMusic && (
          <div className="epk-divider">
            <p className="epk-section-label">Music</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {artist.spotifyEmbedUrl && (
                <a href={artist.spotifyEmbedUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#1DB95411", border: "1px solid #1DB95433", color: "#1DB954", padding: "10px 18px", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                  <span>▶</span> Spotify
                </a>
              )}
              {artist.soundcloudUrl && (
                <a href={artist.soundcloudUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#FF550011", border: "1px solid #FF550033", color: "#FF5500", padding: "10px 18px", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                  ☁ SoundCloud
                </a>
              )}
              {artist.appleMusicUrl && (
                <a href={artist.appleMusicUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#FC3C4411", border: "1px solid #FC3C4433", color: "#FC3C44", padding: "10px 18px", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                  🍎 Apple Music
                </a>
              )}
              {artist.bandcampUrl && (
                <a href={artist.bandcampUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#1da0c311", border: "1px solid #1da0c333", color: "#1da0c3", padding: "10px 18px", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                  🎸 Bandcamp
                </a>
              )}
            </div>
          </div>
        )}

        {/* DISCOGRAPHY */}
        {hasProjects && (
          <div className="epk-divider">
            <p className="epk-section-label">Discography</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 16 }}>
              {projects.map((p: any) => (
                <div key={p._id}>
                  {p.coverImageUrl && (
                    <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", marginBottom: 8, border: "1px solid #1e1e1e" }}>
                      <img src={p.coverImageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                  <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 3px", color: "#fff" }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: "#444", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>{p.type} · {p.releaseYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MUSIC VIDEOS / LIVE PERFORMANCES */}
        {hasVideos && (
          <div className="epk-divider">
            <p className="epk-section-label">Performances & Videos</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {artist.musicVideos.map((v: any, i: number) => {
                const ytId = v.videoUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
                const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
                return (
                  <a key={i} href={v.videoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                    {thumb && (
                      <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", marginBottom: 8, position: "relative", border: "1px solid #1e1e1e" }}>
                        <img src={thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F0B51E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 14, marginLeft: 3 }}>▶</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>{v.title}</p>
                    {v.description && <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{v.description}</p>}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* PRESS PHOTOS */}
        {epk?.pressPhotos?.length > 0 && (
          <div className="epk-divider">
            <p className="epk-section-label">Press Photos</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {epk.pressPhotos.map((photo: string, i: number) => (
                <div key={i} style={{ overflow: "hidden", border: "1px solid #1e1e1e" }}>
                  <img src={photo} alt={`${artist.name} press photo ${i + 1}`}
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: "#444", marginTop: 12, letterSpacing: 1 }}>
              High-resolution photos available upon request — {epk?.pressEmail || "press@goodnaturedsouls.com"}
            </p>
          </div>
        )}

        {/* SOCIAL MEDIA */}
        {hasSocial && (
          <div className="epk-divider">
            <p className="epk-section-label">Social Media</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {artist.socialMediaLinks.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "#888", border: "1px solid #1e1e1e", padding: "8px 16px", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", background: "#0e0e0e" }}>
                  {link.name} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT */}
        <div className="epk-divider">
          <p className="epk-section-label">Contact</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>

            <div style={{ borderLeft: "2px solid #F0B51E", paddingLeft: 16 }}>
              <p style={{ fontSize: 9, letterSpacing: 3, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 6px" }}>Booking</p>
              <a href={`mailto:${epk?.bookingEmail || "booking@goodnaturedsouls.com"}`}
                style={{ fontSize: 13, color: "#fff", textDecoration: "none", display: "block", marginBottom: 3 }}>
                {epk?.bookingEmail || "booking@goodnaturedsouls.com"}
              </a>
            </div>

            {epk?.pressEmail && (
              <div style={{ borderLeft: "2px solid #1e1e1e", paddingLeft: 16 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Press</p>
                <a href={`mailto:${epk.pressEmail}`} style={{ fontSize: 13, color: "#aaa", textDecoration: "none", display: "block" }}>
                  {epk.pressEmail}
                </a>
              </div>
            )}

            <div style={{ borderLeft: "2px solid #1e1e1e", paddingLeft: 16 }}>
              <p style={{ fontSize: 9, letterSpacing: 3, color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Label</p>
              <a href="https://goodnaturedsouls.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#aaa", textDecoration: "none", display: "block" }}>
                goodnaturedsouls.com
              </a>
              <span style={{ fontSize: 11, color: "#333" }}>Good Natured Souls</span>
            </div>

            {epk?.website && (
              <div style={{ borderLeft: "2px solid #1e1e1e", paddingLeft: 16 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Website</p>
                <a href={epk.website.startsWith("http") ? epk.website : `https://${epk.website}`}
                  target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>
                  {epk.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #141414", paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "serif", fontSize: 18, color: "#fff", fontWeight: 900 }}>GNS</span>
            <span style={{ fontSize: 9, letterSpacing: 3, color: "#333", textTransform: "uppercase" }}>Exist Altruistic</span>
          </div>
          <p style={{ fontSize: 9, letterSpacing: 2, color: "#2a2a2a", textTransform: "uppercase", margin: 0 }}>
            Good Natured Souls · The Bronx, NYC · goodnaturedsouls.com
          </p>
        </div>
      </div>
    </div>
  );
}
