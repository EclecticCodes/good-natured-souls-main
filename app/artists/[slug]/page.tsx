import { getArtistWithProjects } from "../../../sanity/strapi-utils";
import React from "react";
import { PageWrapper } from "../../Components/PageWrapper";
import { TopTracks } from "./TopTracks";
import Link from "next/link";
import { AudioPlayer, VideoCardClient } from "./ArtistClientComponents";

type Props = {
  params: Promise<{ slug: string }>;
};





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

          {/* Streaming — Spotify → SoundCloud → Bandcamp → Apple Music fallback */}
          {(artist.spotifyEmbedUrl || artist.soundcloudUrl || artist.bandcampUrl || artist.appleMusicUrl) && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Streaming</p>
              {artist.spotifyEmbedUrl ? (
                <TopTracks spotifyEmbedUrl={artist.spotifyEmbedUrl} />
              ) : artist.soundcloudUrl ? (
                <iframe
                  width="100%"
                  height="166"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(artist.soundcloudUrl)}&color=%23F0B51E&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`}
                  style={{ border: 'none', maxWidth: 700 }}
                />
              ) : artist.bandcampUrl ? (
                <a href={artist.bandcampUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-secondaryInteraction hover:border-accent px-6 py-4 transition-colors group">
                  <span className="text-2xl">🎸</span>
                  <div>
                    <p className="font-oswald text-sm font-bold group-hover:text-accent transition-colors">Listen on Bandcamp</p>
                    <p className="text-gray-600 text-xs">{artist.bandcampUrl}</p>
                  </div>
                  <span className="ml-auto font-oswald text-xs text-accent tracking-widest">LISTEN ↗</span>
                </a>
              ) : artist.appleMusicUrl ? (
                <a href={artist.appleMusicUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-secondaryInteraction hover:border-accent px-6 py-4 transition-colors group">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="font-oswald text-sm font-bold group-hover:text-accent transition-colors">Listen on Apple Music</p>
                    <p className="text-gray-600 text-xs">{artist.appleMusicUrl}</p>
                  </div>
                  <span className="ml-auto font-oswald text-xs text-accent tracking-widest">LISTEN ↗</span>
                </a>
              ) : null}
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

          {/* Booking CTA */}
          <div className="mb-12 md:mb-16 border border-secondaryInteraction hover:border-accent transition-colors p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-2">Book This Artist</p>
                <h3 className="font-oswald text-2xl md:text-3xl font-bold mb-2">{artist.name}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-oswald tracking-widest">
                  {artist.epk?.genre && <span>Genre: {artist.epk.genre}</span>}
                  {artist.epk?.location && <span>Based in: {artist.epk.location}</span>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                {artist.epk?.bookingEmail ? (
                  <a href={`mailto:${artist.epk.bookingEmail}?subject=Booking Inquiry — ${artist.name}`}
                    className="font-oswald text-sm tracking-widest bg-accent text-primary px-6 py-3 hover:bg-accentInteraction transition-colors text-center font-bold">
                    BOOKING INQUIRY ↗
                  </a>
                ) : (
                  <a href={`/contact?subject=Booking — ${artist.name}`}
                    className="font-oswald text-sm tracking-widest bg-accent text-primary px-6 py-3 hover:bg-accentInteraction transition-colors text-center font-bold">
                    BOOKING INQUIRY ↗
                  </a>
                )}
                {artist.epk?.pressEmail && (
                  <a href={`mailto:${artist.epk.pressEmail}?subject=Press Inquiry — ${artist.name}`}
                    className="font-oswald text-sm tracking-widest border border-secondaryInteraction hover:border-accent text-gray-400 hover:text-accent px-6 py-3 transition-colors text-center">
                    PRESS INQUIRY ↗
                  </a>
                )}
              </div>
            </div>
          </div>

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


export default ArtistPage;
