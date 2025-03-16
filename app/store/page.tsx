"use client";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header"
import ComingSoon from "../Components/ComingSoonStore";

export default function ShowsPage() {
  return (
    <PageWrapper>
      <main className="min-h-screen flex flex-col justify-center items-center text-center">
        <Header>
          <h1 className="text-4xl font-bold mb-4">Shows</h1>
        </Header>
        <ComingSoon />
      </main>
    </PageWrapper>
  )}