import Jumbotron from "./Components/Jumbotron";
import Description from "./Components/Description";
import type { Metadata } from "next";
import { getHomePageData } from "../sanity/strapi-utils";
import { NewMusic } from "./Components/NewMusic";
import FeaturedArtists from "./Components/FeaturedArtists";
import FeaturedShows from "./Components/FeaturedShows";
import FeaturedProducts from "./Components/FeaturedProducts";
import ArtistSpotlight from "./Components/ArtistSpotlight";
import ParallaxSection from "./Components/ParallaxSection";
import { PageWrapper } from "./Components/PageWrapper";
import Marquee from "./marquee";
import React from "react";

export const metadata: Metadata = {
  title: "Good Natured Souls",
  description: "Good Natured Souls Records main site page",
};

export default async function Home() {
  const {
    artists,
    featuredProjects,
    jumbotronImages,
    youtubeVideoIds,
    bio,
    heroHeadline,
    heroTagline,
  } = await getHomePageData();

  const hasArtists = artists && artists.length > 0;
  const hasProjects = featuredProjects && featuredProjects.length > 0;

  const sections: {
    key: string;
    section: string;
    showMarqueeAfter: boolean;
    content: React.ReactNode;
  }[] = [
    {
      key: "jumbotron",
      section: "jumbotron",
      showMarqueeAfter: true,
      content: (
        <Jumbotron
          images={jumbotronImages}
          headline={heroHeadline}
          tagline={heroTagline}
          youtubeVideoIds={youtubeVideoIds}
        />
      ),
    },
    {
      key: "description",
      section: "description",
      showMarqueeAfter: true,
      content: (
        <ParallaxSection strength={40}>
          <Description bio={bio} />
        </ParallaxSection>
      ),
    },
    ...(hasProjects ? [{
      key: "newmusic",
      section: "newmusic",
      showMarqueeAfter: true,
      content: (
        <ParallaxSection strength={30}>
          <NewMusic projects={featuredProjects} />
        </ParallaxSection>
      ),
    }] : []),
    ...(hasArtists ? [{
      key: "artists",
      section: "artists",
      showMarqueeAfter: true,
      content: (
        <ParallaxSection strength={30}>
          <FeaturedArtists artists={artists} />
        </ParallaxSection>
      ),
    }] : []),
    {
      key: "spotlight",
      section: "artists",
      showMarqueeAfter: true,
      content: <ArtistSpotlight />,
    },
    {
      key: "shows",
      section: "shows",
      showMarqueeAfter: false,
      content: (
        <ParallaxSection strength={25}>
          <FeaturedShows />
        </ParallaxSection>
      ),
    },
    ...(hasProjects ? [{
      key: "products",
      section: "products",
      showMarqueeAfter: false,
      content: (
        <ParallaxSection strength={25}>
          <FeaturedProducts projects={featuredProjects} />
        </ParallaxSection>
      ),
    }] : []),
  ];

  return (
    <main>
      <PageWrapper>
        {sections.map((section, i) => (
          <div key={section.key}>
            {section.content}
            {section.showMarqueeAfter && (
              <Marquee section={sections[i + 1]?.section as any ?? section.section} />
            )}
          </div>
        ))}
      </PageWrapper>
    </main>
  );
}
