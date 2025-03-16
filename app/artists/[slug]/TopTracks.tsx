"use client";
import React from "react";
import Header from "../../Components/Header";

type Props = {
  spotifyEmbedUrl: string | undefined;
};

export const TopTracks = ({ spotifyEmbedUrl }: Props) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const convertToEmbedUrl = (url: string) => {
    // Regular expressions to match album and artist IDs in the URL
    const albumRegex = /https:\/\/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/;
    const artistRegex = /https:\/\/open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/;

    // Check if the URL matches the album regex
    let match = url.match(albumRegex);
    if (match && match[1]) {
      // Construct the embedded URL for the album
      return `https://open.spotify.com/embed/album/${match[1]}?utm_source=generator&theme=0`;
    }

    // Check if the URL matches the artist regex
    match = url.match(artistRegex);
    if (match && match[1]) {
      // Construct the embedded URL for the artist
      return `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator&theme=0`;
    }

    // Return an error message or handle the case where the URL is invalid
    throw new Error("Invalid Spotify URL");
  };

  console.log(`TopTracks rendered:${spotifyEmbedUrl}`);
  return (
    <>
      {spotifyEmbedUrl && (
        <>
          <Header>
            <h1 className="text-5xl font-bold font-oswald text-center">
              Top Tracks
            </h1>
          </Header>
          <div className="flex justify-center my-8">
            <iframe
              src={convertToEmbedUrl(spotifyEmbedUrl)}
              width="66%"
              height="480"
              allow="encrypted-media"
              className="rounded-lg"
            ></iframe>
          </div>
        </>
      )}

      <div className="flex justify-center py-8">
        <button
          className="font-inter text-xl border-1 border-primary bg-accent px-4 py-2 rounded-lg text-black hover:font-bold focus:shadow-md"
          onClick={scrollToTop}
        >
          Back to Top
        </button>
      </div>
    </>
  );
};
