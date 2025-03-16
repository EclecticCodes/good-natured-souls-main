"use client";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "This page will be available soon.",
};

const ComingSoon = () => {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center text-center">
      <section>
        <h2 className="font-oswald font-bold text-3xl">Coming Soon</h2>
        <p className="text-lg mt-2">Merch is currently in the works </p>
      </section>
    </main>
  );
};

export default ComingSoon;
