import { getGroupWithMembers } from "../../../sanity/strapi-utils";
import React from "react";
import { PageWrapper } from "../../Components/PageWrapper";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

const GROUP_TYPE_LABELS: Record<string, string> = {
  band: 'Band',
  collective: 'Collective',
  affiliate: 'Affiliate',
  dj_collective: 'DJ Collective',
  production_team: 'Production Team',
  live_band: 'Live Band',
};

const GroupPage = async ({ params }: Props) => {
  const { slug } = await params;
  const group = await getGroupWithMembers(slug);

  if (!group) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-oswald text-gray-500 tracking-widest">GROUP NOT FOUND</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <main className="min-h-screen bg-primary">

        {/* Hero */}
        <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end">
          {group.backgroundImage && (
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${group.backgroundImage})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
          <div className="absolute top-6 left-4 md:left-6 z-10">
            <Link href="/artists" className="flex items-center gap-2 font-oswald text-xs tracking-widest text-gray-400 hover:text-accent transition-colors">
              ← ARTISTS
            </Link>
          </div>
          <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 md:px-6 pb-8 md:pb-12 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">
            {group.profileImage && (
              <div className="w-28 h-28 md:w-56 md:h-56 flex-shrink-0 border-2 border-accent overflow-hidden">
                <img src={group.profileImage} alt={group.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-oswald text-xs tracking-[4px] md:tracking-[6px] text-accent uppercase mb-2">
                Good Natured Souls · {GROUP_TYPE_LABELS[group.groupType] || group.groupType}
              </p>
              <h1 className="font-oswald text-4xl md:text-7xl font-bold text-white leading-none mb-3 md:mb-4">{group.name}</h1>
              <div className="flex gap-3 flex-wrap text-xs font-oswald tracking-widest text-gray-500">
                {group.foundedYear && <span>Est. {group.foundedYear}</span>}
                {group.basedIn && <span>· {group.basedIn}</span>}
              </div>
              {group.socialMediaLinks && group.socialMediaLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {group.socialMediaLinks.map((link: any, i: number) => (
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

        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Members — lead section, editorial style */}
          {group.members && group.members.length > 0 && (
            <div className="mb-16 md:mb-20">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-8">Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {group.members.map((member: any, i: number) => (
                  <div key={i} className="border border-secondaryInteraction hover:border-accent transition-colors group">
                    {/* Profile image if roster artist */}
                    {member.artist?.profileImage && (
                      <div className="aspect-square overflow-hidden bg-secondaryInteraction">
                        <img
                          src={member.artist.profileImage}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    {/* No image fallback */}
                    {!member.artist?.profileImage && (
                      <div className="aspect-square bg-secondaryInteraction flex items-center justify-center">
                        <span className="font-oswald text-4xl text-gray-700">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      {member.artist?.slug ? (
                        <Link href={`/artists/${member.artist.slug}`}
                          className="font-oswald text-lg font-bold hover:text-accent transition-colors block mb-1">
                          {member.name}
                        </Link>
                      ) : (
                        <p className="font-oswald text-lg font-bold mb-1">{member.name}</p>
                      )}
                      {member.role && (
                        <p className="font-oswald text-xs tracking-widest text-accent uppercase">{member.role}</p>
                      )}
                      {member.instrument && (
                        <p className="font-oswald text-xs text-gray-500 tracking-widest mt-1">{member.instrument}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {group.about && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-4">About</p>
              <div className="max-w-2xl">
                {group.about.split("\n\n").map((para: string, i: number) => (
                  <p key={i} className="text-gray-400 text-base leading-relaxed mb-4">{para}</p>
                ))}
              </div>
              <div className="w-16 h-0.5 bg-accent mt-6" />
            </div>
          )}

          {/* Streaming */}
          {(group.spotifyEmbedUrl || group.soundcloudUrl || group.bandcampUrl || group.appleMusicUrl || group.mp3Url) && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Listen</p>
              {group.spotifyEmbedUrl ? (
                <iframe
                  src={group.spotifyEmbedUrl}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ border: 'none', borderRadius: 0, maxWidth: 700 }}
                />
              ) : group.soundcloudUrl ? (
                <iframe width="100%" height="166" allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(group.soundcloudUrl)}&color=%23F0B51E&auto_play=false&hide_related=true&show_comments=false`}
                  style={{ border: 'none', maxWidth: 700 }} />
              ) : group.bandcampUrl ? (
                <a href={group.bandcampUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-secondaryInteraction hover:border-accent px-6 py-4 transition-colors group">
                  <span className="text-2xl">🎸</span>
                  <p className="font-oswald text-sm font-bold group-hover:text-accent transition-colors">Listen on Bandcamp</p>
                  <span className="ml-auto font-oswald text-xs text-accent tracking-widest">LISTEN ↗</span>
                </a>
              ) : null}
            </div>
          )}

          {/* Music Videos */}
          {group.musicVideos && group.musicVideos.length > 0 && (
            <div className="mb-12 md:mb-16">
              <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-6">Videos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.musicVideos.map((video: any, i: number) => {
                  const videoId = video.youtubeUrl?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
                  return videoId ? (
                    <div key={i} className="aspect-video overflow-hidden bg-secondaryInteraction">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Booking CTA */}
          <div className="mb-12 md:mb-16 border border-secondaryInteraction hover:border-accent transition-colors p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="font-oswald text-xs tracking-[6px] text-accent uppercase mb-2">Book This {GROUP_TYPE_LABELS[group.groupType] || 'Group'}</p>
                <h3 className="font-oswald text-2xl md:text-3xl font-bold mb-2">{group.name}</h3>
                <p className="font-oswald text-xs text-gray-500 tracking-widest uppercase">{GROUP_TYPE_LABELS[group.groupType]}</p>
              </div>
              <a href={`/contact?subject=Booking — ${group.name}`}
                className="font-oswald text-sm tracking-widest bg-accent text-primary px-6 py-3 hover:bg-accentInteraction transition-colors font-bold">
                BOOKING INQUIRY ↗
              </a>
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

export default GroupPage;
