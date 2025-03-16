import Header from "@/app/Components/Header";
import { getArtistWithProjects } from "@/sanity/sanity-utils";
import React from "react";
import Polaroid from "../../Components/Polaroid";
import { TopTracks } from "@/app/artists/[slug]/TopTracks";
import { NewMusic } from "@/app/Components/NewMusic";
import { PortableText } from "@portabletext/react";
import Icon, { IconName } from "@/app/Components/Icon";
import { PageWrapper } from "@/app/Components/PageWrapper";

type Props = {
  params: { slug: string };
};

const ArtistPage = async ({ params: { slug } }: Props) => {
  const { artist, projects } = await getArtistWithProjects(slug);
  console.log(artist);

  return (
    <main className="min-h-screen">
      <PageWrapper>
        <Header>
          <div className="max-w-screen-xl flex flex-wrap items-center mx-auto md:px-2">
            <a
              className="font-oswald font-bold text-2xl hover:underline inline-flex flex-row items-center gap-4"
              href="/artists"
            >
              <Icon name="chevronLeft" />
              Back to Artists
            </a>
          </div>
        </Header>

        <div
          className={`w-full py-10 bg-cover bg-center bg-opacity-20 ${
            artist?.backgroundImage ? "" : "bg-none"
          }`}
          style={{
            backgroundImage: artist?.backgroundImage
              ? `url(${artist.backgroundImage})`
              : "none",
          }}
        >
          <section className="w-full h-full flex justify-center items-center">
            <section className="md:w-2/3 w-3/4 md:p-4 p-1">
              <section className="flex md:flex-row md:space-y-0 flex-col space-y-4 justify-between mb-8 items-center">
                <h1 className="text-5xl font-oswald font-bold">
                  {artist?.name}
                </h1>
                <div className="flex flex-row gap-3">
                  {artist?.socialMediaLinks &&
                    artist.socialMediaLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className="hover:underline p-2 bg-secondaryInteraction hover:bg-secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon name={link.name as IconName} />
                      </a>
                    ))}
                </div>
              </section>
              <div className="flex md:flex-row flex-col justify-center md:space-x-4 space-y-4 items-center m-auto">
                <div className="flex flex-1">
                  <Polaroid
                    profileImage={artist?.profileImage as string}
                    signature={artist?.signature as string}
                  />
                </div>
                <div className="max-h-96 overflow-y-auto flex-1 text-2xl custom-scrollbar md:p-4 p-2">
                  {artist?.about ? (
                    <PortableText value={artist?.about} />
                  ) : (
                    <p className="text-center">No information available</p>
                  )}
                </div>
              </div>
            </section>
          </section>
        </div>
        <Header>
          <h2 className="text-4xl text-center font-inter font-bold">
            New Music
          </h2>
        </Header>
        <NewMusic projects={projects} />
        <TopTracks spotifyEmbedUrl={artist?.spotifyEmbedUrl} />
      </PageWrapper>
    </main>
  );
};

export default ArtistPage;
