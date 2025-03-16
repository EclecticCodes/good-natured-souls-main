"use client";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";
import ComingSoon from "../Components/ComingSoonShows"; // Import ComingSoon component

export default function ShowsPage() {
  return (
    <PageWrapper>
      {/* Header Section */}
      <section className="text-center my-8">
        <Header>
          <h1 className="text-4xl font-bold">Shows</h1>
        </Header>
      </section>

        <ComingSoon />

    </PageWrapper>
  );
}
