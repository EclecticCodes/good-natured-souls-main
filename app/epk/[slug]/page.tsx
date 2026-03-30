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
  };
}

export default async function EPKPage({ params }: Props) {
  const { slug } = await params;
  const { artist, projects } = await getArtistWithProjects(slug);
  if (!artist) notFound();

  const epk = artist.epk;

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { margin: 0.75in; }
      `}</style>

      {/* Header bar */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="no-print">
        <a href="/" style={{ fontFamily: "serif", fontSize: 28, color: "#fff", textDecoration: "none", fontWeight: 900 }}>GNS</a>
        <div style={{ display: "flex", gap: 12 }}>
          <PrintButton />
          <a href={`/artists/${slug}`}
            style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "10px 24px", fontSize: 12, letterSpacing: 2, textDecoration: "none" }}>
            VIEW ARTIST PAGE
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px" }}>

        {/* Hero */}
        <div style={{ display: "flex", gap: 40, marginBottom: 48, alignItems: "flex-start" }}>
          {artist.profileImage && (
            <div style={{ width: 180, height: 180, flexShrink: 0, overflow: "hidden", border: "2px solid #F0B51E" }}>
              <img src={artist.profileImage} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 8px" }}>Electronic Press Kit</p>
            <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1 }}>{artist.name}</h1>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 3, margin: "0 0 16px", textTransform: "uppercase" }}>Good Natured Souls · New York City</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {epk?.genre && <span style={{ fontSize: 11, color: "#F0B51E", letterSpacing: 2, textTransform: "uppercase", borderBottom: "1px solid #F0B51E33", paddingBottom: 2 }}>{epk.genre}</span>}
              {epk?.location && <span style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>{epk.location}</span>}
            </div>
          </div>
        </div>

        {/* Bio */}
        {(epk?.bio || artist.about) && (
          <div style={{ marginBottom: 40, borderLeft: "3px solid #F0B51E", paddingLeft: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 12px" }}>Biography</p>
            <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.8, margin: 0 }}>{epk?.bio || artist.about}</p>
          </div>
        )}

        {/* Press quote */}
        {epk?.pressQuote && (
          <div style={{ marginBottom: 40, background: "#111", border: "1px solid #1a1a1a", padding: "24px 32px" }}>
            <p style={{ fontSize: 20, fontStyle: "italic", color: "#fff", lineHeight: 1.6, margin: "0 0 12px" }}>"{epk.pressQuote}"</p>
            {epk.pressQuoteSource && <p style={{ fontSize: 11, color: "#F0B51E", letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>— {epk.pressQuoteSource}</p>}
          </div>
        )}

        {/* Releases */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 16px" }}>Discography</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {projects.map((p: any) => (
                <div key={p._id}>
                  {p.coverImageUrl && <img src={p.coverImageUrl} alt={p.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", marginBottom: 6 }} />}
                  <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 2px", color: "#fff" }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: "#555", margin: 0, letterSpacing: 1 }}>{p.type?.toUpperCase()} · {p.releaseYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {artist.socialMediaLinks?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 12px" }}>Social Media</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {artist.socialMediaLinks.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "#aaa", border: "1px solid #2a2a2a", padding: "6px 14px", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
                  {link.name} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Press photos */}
        {epk?.pressPhotos?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 16px" }}>Press Photos</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {epk.pressPhotos.map((photo: string, i: number) => (
                <img key={i} src={photo} alt={`${artist.name} press photo ${i + 1}`}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 32, display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 8px" }}>Booking</p>
            {epk?.bookingEmail
              ? <a href={`mailto:${epk.bookingEmail}`} style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}>{epk.bookingEmail}</a>
              : <a href="mailto:booking@goodnaturedsouls.com" style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}>booking@goodnaturedsouls.com</a>
            }
          </div>
          {epk?.pressEmail && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 8px" }}>Press</p>
              <a href={`mailto:${epk.pressEmail}`} style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}>{epk.pressEmail}</a>
            </div>
          )}
          {epk?.website && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 8px" }}>Website</p>
              <a href={epk.website} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}>{epk.website}</a>
            </div>
          )}
          <div>
            <p style={{ fontSize: 10, letterSpacing: 4, color: "#F0B51E", textTransform: "uppercase", margin: "0 0 8px" }}>Label</p>
            <a href="https://goodnaturedsouls.com" style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}>goodnaturedsouls.com</a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center", borderTop: "1px solid #1a1a1a", paddingTop: 24 }}>
          <p style={{ fontSize: 9, letterSpacing: 3, color: "#333", textTransform: "uppercase" }}>
            Good Natured Souls · New York City · goodnaturedsouls.com · Exist Altruistic
          </p>
        </div>
      </div>
    </div>
  );
}
