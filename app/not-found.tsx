import React from "react";
import { Metadata } from "next";
type Props = {};

export const metadata: Metadata = {
  title: "Page not found",
  description: "Could not find page",
};

const NotFound = (props: Props) => {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center">
      <section>
        <h1 className="font-oswald font-bold text-5xl text-center">404</h1>
        <h2 className="font-oswald font-bold text-3xl text-center">
          Page not found
        </h2>
      </section>
    </main>
  );
};

export default NotFound;
