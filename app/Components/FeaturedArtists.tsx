"use client";
import React, { useState } from "react";
import Polaroid from "./Polaroid";
import Icon from "./Icon";
import { motion, AnimatePresence } from "framer-motion";

type Artist = {
  _id: string;
  name: string;
  slug: string;
  signature: string;
  profileImage: string;
  backgroundImage?: string;
};

type Props = {
  artists: Artist[];
};

const FeaturedArtists = ({ artists }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next">("next");
  const [transitioning, setTransitioning] = useState(false);

  if (!artists || artists.length === 0) return null;

  const goTo = (newIndex: number, dir: "prev" | "next") => {
    if (transitioning) return;
    setTransitioning(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTransitioning(false);
    }, 400);
  };

  const handleNext = () =>
    goTo((currentIndex + 1) % artists.length, "next");

  const handlePrev = () =>
    goTo(currentIndex === 0 ? artists.length - 1 : currentIndex - 1, "prev");

  const current = artists[currentIndex];

  return (
    <section className="py-16 px-4 flex flex-col gap-6 justify-center items-center">
      <div className="flex items-center justify-between w-full max-w-5xl mb-4">
        <h2 className="font-oswald text-2xl md:text-4xl font-bold">FEATURED ARTISTS</h2>
        <motion.a
          href="/artists"
          className="font-oswald text-xs tracking-widest text-accent hover:underline shrink-0 ml-4"
          whileHover={{ scale: 1.05 }}
        >
          VIEW ALL ARTISTS
        </motion.a>
      </div>

      <div className="flex flex-col gap-4 justify-center items-center relative">
        {/* Blur/black overlay during transition */}
        <AnimatePresence>
          {transitioning && (
            <motion.div
              key="transition-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 backdrop-blur-md bg-black/60 rounded-sm"
            />
          )}
        </AnimatePresence>

        {/* Artist card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col gap-4 justify-center items-center"
          >
            <a href={`/artists/${current.slug}`}>
              <Polaroid
                profileImage={current.profileImage}
                signature={current.signature}
              />
            </a>
            <a href={`/artists/${current.slug}`}>
              <h3 className="font-oswald font-bold text-xl md:text-2xl tracking-widest hover:text-accent transition-colors">
                {current.name.toUpperCase()}
              </h3>
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-around items-center gap-8 mt-2">
        <motion.button
          onClick={handlePrev}
          className="p-2 bg-text rounded-sm disabled:opacity-30"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          disabled={transitioning}
        >
          <Icon name="arrowLeft" color="black" />
        </motion.button>
        <span className="font-oswald text-xl">
          {currentIndex + 1} / {artists.length}
        </span>
        <motion.button
          onClick={handleNext}
          className="p-2 bg-text rounded-sm disabled:opacity-30"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          disabled={transitioning}
        >
          <Icon name="arrowRight" color="black" />
        </motion.button>
      </div>

      {/* Dot indicators */}
      {artists.length > 1 && (
        <div className="flex gap-2 mt-2">
          {artists.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > currentIndex ? "next" : "prev")}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex ? "bg-accent w-6" : "bg-white/30 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedArtists;