import { getArtistWithProjects } from "../../../sanity/strapi-utils";
import React from "react";
import { PageWrapper } from "../../Components/PageWrapper";
import { TopTracks } from "./TopTracks";
import Link from "next/link";

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

        {/* Hero — full bleed background */}
        <div className="relative w-full min-h-[70vh] flex items-end">
          {/* Background image */}
          {artist.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${artist.backgroundImage})` }}
            />
          )}
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-6 z-10">
            <Link href="/artists" className="flex items-center gap-2 font-oswald text-xs tracking-widest text-gray-400 hover:text-accent transition-colors">
              ← ARTISTS
            </Link>
          </div>

          {/* Hero content */}
          <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end gap-8">
            {/* Profile image */}
            {artist.profileImage && (
              <div className="w-40 h-40 md:w-56 md:h-56 flex-shrink-0 border-2 border-accent overflow-hidden">
                <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Name + socials */}
            <div className="flex-1">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-2">Good Natured Souls</p>
              <h1 className="font-oswald text-5xl md:text-7xl font-bold text-white leading-none mb-4">{artist.name}</h1>
              {artist.socialMediaLinks && artist.socialMediaLinks.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {artist.socialMediaLinks.map((link: any, i: number) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="font-oswald text-xs tracking-widest text-gray-400 hover:text-accent border border-secondaryInteraction hover:border-accent px-3 py-1.5 transition-colors uppercase">
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 py-12">

          {/* About */}
          {aboutText && (
            <div className="mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-4">About</p>
              <div className="max-w-2xl">
                {aboutText.split('\n\n').map((para: string, i: number) => (
                  <p key={i} className="text-gray-400 text-base leading-relaxed mb-4">{para}</p>
                ))}
              </div>
              <div className="w-16 h-0.5 bg-accent mt-6" />
            </div>
          )}

          {/* Projects / Releases */}
          {projects.length > 0 && (
            <div className="mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Releases</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    <div className="p-3">
                      <p className="font-oswald text-sm font-bold truncate">{project.name}</p>
                      <p className="font-oswald text-xs text-gray-600 tracking-widest uppercase">{project.type} · {project.releaseYear}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Spotify embed */}
          {artist.spotifyEmbedUrl && (
            <div className="mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Listen</p>
              <TopTracks spotifyEmbedUrl={artist.spotifyEmbedUrl} />
            </div>
          )}

          {/* YouTube video */}
          {artist.youtubeUrl && (
            <div className="mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Watch</p>
              <div className="aspect-video w-full max-w-2xl overflow-hidden">
                <iframe
                  src={(() => {
                    const url = artist.youtubeUrl;
                    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
                  })()}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Back to artists */}
          <div className="border-t border-secondaryInteraction pt-8 flex items-center justify-between">
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
