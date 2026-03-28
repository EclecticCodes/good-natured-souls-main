"use client";

import React, { useEffect, useState } from "react";
import Polaroid from "../Components/Polaroid";
import { motion, AnimatePresence } from "framer-motion";
import ArtistCarouselMobile from "./ArtistCarouselMobile";
import { resolveUrl } from '@/lib/resolveUrl';

type Artist = {
  _id: string;
  _createdAt: string;
  name: string;
  slug: string;
  signature: string;
  profileImage: string;
  backgroundImage?: string;
  artistType: "roster" | "affiliate" | "spotlight";
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const ArtistList = () => {
  const isMediumScreen = useMediaQuery("(max-width: 768px)");
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next">("next");
  const [activeSection, setActiveSection] = useState<"roster" | "affiliate">("roster");

  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

    fetch(`${strapiUrl}/api/artists?populate=profileImage,backgroundImage&sort=orderRank:asc`)
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.data || []).map((item: any) => ({
          _id: String(item.id),
          _createdAt: item.attributes.createdAt || "",
          name: item.attributes.name,
          slug: item.attributes.slug,
          signature: item.attributes.signature || item.attributes.name,
          profileImage: item.attributes.profileImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl) : "",
          backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.backgroundImage.data.attributes.url, strapiUrl) : undefined,
          artistType: item.attributes.artistType || "roster",
        }));
        setAllArtists(mapped);
        const first = mapped.find((a: Artist) => a.artistType === "roster") || mapped[0];
        if (first) { setSelectedArtist(first); setCurrentIndex(mapped.indexOf(first)); }
      })
      .catch(() => {});
  }, []);

  const roster = allArtists.filter((a) => a.artistType === "roster");
  const affiliates = allArtists.filter((a) => a.artistType === "affiliate");
  const activeArtists = activeSection === "roster" ? roster : affiliates;

  const handleNextClick = () => {
    setDirection("next");
    const newIndex = (currentIndex + 1) % activeArtists.length;
    setCurrentIndex(newIndex);
    setSelectedArtist(activeArtists[newIndex]);
  };

  const handlePrevClick = () => {
    setDirection("prev");
    const newIndex = currentIndex === 0 ? activeArtists.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedArtist(activeArtists[newIndex]);
  };

  const handleHover = (artist: Artist, index: number) => {
    if (!isMediumScreen) { setSelectedArtist(artist); setCurrentIndex(index); }
  };

  const handleSectionSwitch = (section: "roster" | "affiliate") => {
    setActiveSection(section);
    setCurrentIndex(0);
    const sectionArtists = section === "roster" ? roster : affiliates;
    if (sectionArtists.length > 0) setSelectedArtist(sectionArtists[0]);
  };

  if (allArtists.length === 0) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-oswald text-gray-600 tracking-widest">LOADING ARTISTS...</p>
    </div>
  );

  return (
    <div className="py-8">
      {/* Section tabs — only show if affiliates exist */}
      {affiliates.length > 0 && (
        <div className="flex items-center gap-0 border-b border-secondaryInteraction mb-12 max-w-5xl mx-auto px-4">
          {[
            { key: "roster" as const, label: "Official Roster", count: roster.length },
            { key: "affiliate" as const, label: "Affiliates", count: affiliates.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleSectionSwitch(tab.key)}
              className={`font-oswald text-xs tracking-widest px-6 py-3 border-b-2 transition-all duration-200 ${
                activeSection === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              {tab.label.toUpperCase()}
              <span className="ml-2 text-xs opacity-50">({tab.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Section description */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        {activeSection === "roster" && (
          <p className="text-gray-600 text-sm font-oswald tracking-widest">GOOD NATURED SOULS VERY OWN</p>
        )}
        {activeSection === "affiliate" && (
          <p className="text-gray-600 text-sm font-oswald tracking-widest">CREATIVE COLLABORATORS</p>
        )}
      </div>

      {/* Artist display */}
      {activeArtists.length > 0 ? (
        <section className="flex md:text-left text-center items-center justify-center md:flex-row flex-col-reverse md:gap-0 gap-4 px-4">
          <section className="flex justify-center items-center w-full md:w-1/2">
            <section className="inline-flex flex-col gap-4">
              {activeArtists.map((artist, index) => (
                <motion.a
                  href={`/artists/${artist.slug}`}
                  className={`font-oswald md:text-5xl text-4xl transition-colors duration-300 font-bold ${
                    currentIndex === index ? "text-accent" : ""
                  } hover:text-accent hover:cursor-pointer hover:underline-offset-4 decoration-4 decoration-orange-400`}
                  key={artist._id}
                  onMouseOver={() => handleHover(artist, index)}
                  whileHover={{ scale: 1.05, x: 6 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {artist.name}
                </motion.a>
              ))}
            </section>
          </section>

          <div className="flex-1">
            {!isMediumScreen ? (
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={selectedArtist?._id}
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                >
                  <Polaroid
                    profileImage={selectedArtist ? selectedArtist.profileImage : activeArtists[0].profileImage}
                    signature={selectedArtist ? selectedArtist.signature || selectedArtist.name : activeArtists[0].name}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <ArtistCarouselMobile
                selectedArtist={selectedArtist || activeArtists[0]}
                currentIndex={currentIndex}
                numArtists={activeArtists.length}
                direction={direction}
                handleNextClick={handleNextClick}
                handlePrevClick={handlePrevClick}
              />
            )}
          </div>
        </section>
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="font-oswald text-gray-600 tracking-widest text-sm">COMING SOON</p>
        </div>
      )}
    </div>
  );
};

export default ArtistList;