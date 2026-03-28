import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";
import ComingSoonShows from "../Components/ComingSoonShows";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shows — Good Natured Souls",
  description: "Upcoming shows and live events from Good Natured Souls artists.",
};

export default function ShowsPage() {
  return (
    <PageWrapper>
      <Header>
        <h1 className="font-oswald text-4xl md:text-5xl font-bold">Shows</h1>
      </Header>
      <ComingSoonShows />
    </PageWrapper>
  );
}
