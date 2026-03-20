import Image from "next/image";
import Jumbotron from "./Components/Jumbotron";
import Description from "./Components/Description";
import type { Metadata } from "next";
import { getAllArtistsWithFeaturedProjects } from "../sanity/strapi-utils";
import { NewMusic } from "./Components/NewMusic";
import FeaturedArtists from "./Components/FeaturedArtists";
import FeaturedShows from "./Components/FeaturedShows";
import FeaturedProducts from "./Components/FeaturedProducts";
import { PageWrapper } from "./Components/PageWrapper";
import Marquee from "./marquee";

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
        <Marquee />
        <Description />
        <Marquee />
        <NewMusic projects={homePageData.featuredProjects} />
        <Marquee />
        <FeaturedArtists artists={homePageData.artists} />
        <Marquee />
        <FeaturedShows />
        <Marquee />
        <FeaturedProducts />
        <Marquee />
      </PageWrapper>
    </main>
  );
}
