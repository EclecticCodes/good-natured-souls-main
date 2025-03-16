"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Variants } from "framer-motion";
import Icon from "@/app/Components/Icon";

type Project = {
  _id: string;
  _createdAt: string;
  name: string;
  type: string;
  url: string;
  releaseYear: number;
  coverImageUrl: string;
  artist: string;
  featuredArtists?: string[];
};

type Props = {
  projects: Project[];
};

export const NewMusic = ({ projects }: Props) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      position: "absolute",
    }),
  };

  const handleNextClick = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const handlePrevClick = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      {projects.length > 0 && (
        <section className="relative w-full h-full flex justify-center items-center bg-cover bg-center overflow-hidden">
          {/* Arrows */}
          {projects.length > 1 && (
            <button
              onClick={handlePrevClick}
              className="absolute top-1/2 left-0 ml-3 z-10 md:hidden p-2 rounded-sm text-primary bg-text bg-opacity-75"
            >
              <Icon name="arrowLeft" color="black" />
            </button>
          )}

          <motion.section
            className="relative w-full h-full flex justify-center items-center bg-cover bg-center py-8"
            style={{
              backgroundImage: `url(${projects[currentIndex].coverImageUrl})`,
            }}
            key={projects[currentIndex]._id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary bg-opacity-50"></div>

            <section
              className={`relative z-10 flex flex-col min-h-[75vh] justify-between space-y-8 w-2/3 px-4 bg-transparent`}
            >
              <h1 className="text-5xl md:text-left font-bold text-center">
                FEATURED RELEASES
              </h1>
              <div className="overflow-hidden w-full flex justify-center items-center">
                <div className="flex w-full">
                  <div className="flex flex-col justify-around w-full">
                    <div className="flex flex-col space-y-3">
                      <h2 className="text-4xl font-bold">
                        {projects[currentIndex].name.toUpperCase()}
                      </h2>
                      <h3 className="text-3xl w-full md:w-1/2">
                        <span className="text-accent">Album • </span>
                        {projects[currentIndex].artist}
                        {projects[currentIndex].featuredArtists &&
                          projects[currentIndex].featuredArtists.length > 0 && (
                            <span>
                              ,{" "}
                              {projects[currentIndex].featuredArtists.join(
                                ", "
                              )}
                            </span>
                          )}
                      </h3>
                    </div>
                    <div className="flex justify-between mt-8">
                      <a
                        className="bg-accent hover:font-bold text-primary text-lg py-2 px-4 rounded-md"
                        target="_blank"
                        href={projects[currentIndex].url}
                      >
                        LISTEN
                      </a>
                      {projects.length > 1 && (
                        <div className="text-xl hidden md:flex gap-4 items-center">
                          <button
                            onClick={handlePrevClick}
                            className="focus:outline-none"
                          >
                            <Icon name="arrowLeft" />
                          </button>
                          {currentIndex + 1} / {projects.length}
                          <button
                            onClick={handleNextClick}
                            className="focus:outline-none"
                          >
                            <Icon name="arrowRight" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.section>

          {projects.length > 1 && (
            <button
              onClick={handleNextClick}
              className="absolute top-1/2 right-0 mr-3 z-10 md:hidden p-2 rounded-sm text-primary bg-text bg-opacity-75"
            >
              <Icon name="arrowRight" color="black" />
            </button>
          )}
        </section>
      )}
    </>
  );
};
