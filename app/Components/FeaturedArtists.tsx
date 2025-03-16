"use client";

import React, { useState } from "react";
import { Artist } from "@/types/Artist";
import Polaroid from "./Polaroid";
import Icon from "./Icon";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  artists: Artist[];
};

const FeaturedArtists = ({ artists }: Props) => {
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

  const variants = {
    enter: (direction: "prev" | "next") => ({
      x: direction === "next" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "prev" | "next") => ({
      x: direction === "next" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <>
      {artists && artists.length > 0 && (
        <section className="p-8 flex flex-col gap-4 justify-center items-center">
          <h2 className="font-bold text-4xl pb-12">FEATURED ARTISTS</h2>
          <div className="flex flex-col gap-4 justify-center items-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4 justify-center items-center"
              >
                <Polaroid
                  profileImage={artists[currentIndex].profileImage}
                  signature={artists[currentIndex].signature}
                />
                <h3 className="font-bold text-2xl">
                  {artists[currentIndex].name.toUpperCase()}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-col gap-4 md:w-1/3 w-full">
            <div className="text-center">
              <motion.a
                className="inline-block underline font-thin hover:text-accent"
                href="/artists"
                whileHover={{ scale: 1.05 }}
              >
                VIEW ALL ARTISTS
              </motion.a>
            </div>
            <div className="flex justify-around items-center">
              <motion.button
                onClick={handlePrevClick}
                className="p-2 bg-text rounded-sm"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <Icon name="arrowLeft" color="black" />
              </motion.button>
              <span className="text-xl gap-8">
                <span>{currentIndex + 1}</span> <span>/</span>{" "}
                <span>{artists.length}</span>
              </span>
              <motion.button
                onClick={handleNextClick}
                className="p-2 bg-text rounded-sm "
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <Icon name="arrowRight" color="black" />
              </motion.button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default FeaturedArtists;
