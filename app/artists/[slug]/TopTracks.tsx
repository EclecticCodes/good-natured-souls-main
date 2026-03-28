"use client";
import React from "react";

type Props = {
  spotifyEmbedUrl: string | undefined;
};

export const TopTracks = ({ spotifyEmbedUrl }: Props) => {
  if (!spotifyEmbedUrl) return null;

  const convertToEmbedUrl = (url: string) => {
    const albumRegex = /https:\/\/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/;
    const artistRegex = /https:\/\/open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/;
    let match = url.match(albumRegex);
    if (match?.[1]) return `https://open.spotify.com/embed/album/${match[1]}?utm_source=generator&theme=0`;
    match = url.match(artistRegex);
    if (match?.[1]) return `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator&theme=0`;
    return null;
  };

  const embedUrl = convertToEmbedUrl(spotifyEmbedUrl);
  if (!embedUrl) return null;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="380"
      allow="encrypted-media"
      style={{ border: 'none', maxWidth: 700 }}
    />
  );
};
