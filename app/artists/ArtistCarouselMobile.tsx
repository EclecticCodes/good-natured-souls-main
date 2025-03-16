"use client";

import React, { useState } from "react";
import { Artist } from "@/types/Artist";
import { Variants } from "framer-motion";
import Polaroid from "../Components/Polaroid";
import Icon from "../Components/Icon";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  selectedArtist: Artist;
  handlePrevClick: () => void;
  handleNextClick: () => void;
  direction: "prev" | "next";
  currentIndex: number;
  numArtists: number;
};

const ArtistCarouselMobile = ({
  selectedArtist,
  currentIndex,
  direction,
  numArtists,
  handlePrevClick,
  handleNextClick,
}: Props) => {
  const variants: Variants = {
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
      {selectedArtist && (
        <section className="p-8 flex flex-col gap-4 justify-center items-center">
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
                  profileImage={selectedArtist.profileImage}
                  signature={selectedArtist.signature}
                />
                <h3 className="font-bold text-2xl">
                  {selectedArtist.name.toUpperCase()}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-col gap-4 md:w-1/3 w-full">
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
                <span>{numArtists}</span>
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

export default ArtistCarouselMobile;
