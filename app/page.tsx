import Image from "next/image";
import Jumbotron from "./Components/Jumbotron";
import Description from "./Components/Description";
import type { Metadata } from "next";
import { getAllArtistsWithFeaturedProjects } from "@/types/sanity/sanity-utils";
import { NewMusic } from "./Components/NewMusic";
import FeaturedArtists from "./Components/FeaturedArtists";
import { Artist } from "@/types/Artist";
import { PageWrapper } from "./Components/PageWrapper";
import Marquee from "./marquee";
import ScrollHandler from "./ScrollHandler";

export const metadata: Metadata = {
  title: "Good Natured Souls",
  description: "Good Natured Souls Records main site page",
};

export default async function Home() {
  const homePageData = await getAllArtistsWithFeaturedProjects();
  return (
    <main>
      <PageWrapper>
        <Jumbotron />
        <Marquee /> {/* Marquee appears after the Jumbotron */}
        <Description />
        <Marquee /> {/* Marquee appears between Description and NewMusic */}
        <NewMusic projects={homePageData.featuredProjects} />
        <Marquee />
        <FeaturedArtists artists={homePageData.artists} />
        <Marquee /> {/* Marquee appears at the bottom before the end */}
      </PageWrapper>
    </main>
  );
}