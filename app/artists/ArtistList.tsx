"use client";

import React, { useEffect, useState } from "react";
import { getArtists } from "@/types/sanity/sanity-utils";
import Polaroid from "../Components/Polaroid";
import { Artist } from "@/types/Artist";
import { motion, AnimatePresence } from "framer-motion";
import ArtistCarouselMobile from "./ArtistCarouselMobile";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const ArtistList = () => {
  console.log("ArtistList rendered");
  const isMediumScreen = useMediaQuery("(max-width: 768px)");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<"prev" | "next">("next");

  const handleNextClick = () => {
    setDirection("next");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artists.length);
  };

  const handlePrevClick = () => {
    setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? artists.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    getArtists().then((data) => {
      setArtists(data);
      if (data.length > 0) {
        setSelectedArtist(data[0]);
        setCurrentIndex(0); // Set the initial artist to the first one
      }
    });
  }, []);

  useEffect(() => {
    if (artists.length > 0) {
      setSelectedArtist(artists[currentIndex]);
    }
  }, [currentIndex, artists]);

  const handleMouseHover = (artist: Artist, index: number) => {
    if (!isMediumScreen) {
      setSelectedArtist(artist);
      setCurrentIndex(index);
    }
  };

  return (
    <section className="flex md:text-left text-center items-center justify-center md:flex-row flex-col-reverse my-8 md:gap-0 gap-4">
      <section className="flex justify-center items-center w-1/2">
        {artists.length > 0 && (
          <section className="inline-flex flex-col gap-4">
            {artists.map((artist, index) => (
              <motion.a
                href={`/artists/${artist.slug}`}
                className={`font-oswald md:text-5xl text-4xl transition-colors duration-300 font-bold ${
                  currentIndex === index ? "text-accent" : ""
                } hover:text-accent hover:cursor-pointer hover:underline-offset-4 decoration-4 decoration-orange-400`}
                key={artist._id}
                onMouseOver={handleMouseHover.bind(null, artist, index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {artist.name}
              </motion.a>
            ))}
          </section>
        )}
      </section>
      <div className="flex-1">
        {artists.length > 0 &&
          (!isMediumScreen ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedArtist?._id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.3 }}
              >
                <Polaroid
                  profileImage={
                    selectedArtist
                      ? selectedArtist.profileImage
                      : artists[0].profileImage
                  }
                  signature={
                    selectedArtist
                      ? selectedArtist.signature || selectedArtist.name
                      : artists[0].signature || artists[0].name
                  }
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <ArtistCarouselMobile
              selectedArtist={selectedArtist || artists[0]}
              currentIndex={currentIndex}
              numArtists={artists.length}
              direction={direction}
              handleNextClick={handleNextClick}
              handlePrevClick={handlePrevClick}
            />
          ))}
      </div>
    </section>
  );
};

export default ArtistList;
