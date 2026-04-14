"use client";

import React, { useEffect, useState } from "react";
import Polaroid from "../Components/Polaroid";
import { motion, AnimatePresence } from "framer-motion";
import ArtistCarouselMobile from "./ArtistCarouselMobile";
import { resolveUrl } from '@/lib/resolveUrl';

type Artist = {
  _id: string;
  name: string;
  slug: string;
  signature: string;
  profileImage: string;
  backgroundImage?: string;
  artistType: string;
  designation?: string[];
};

type Group = {
  _id: string;
  name: string;
  slug: string;
  signature: string;
  profileImage: string;
  backgroundImage?: string;
  groupType: string;
};

type Tab = "roster" | "affiliate" | "groups" | "producers" | "instrumentalists" | "djs";

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
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedItem, setSelectedItem] = useState<Artist | Group | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next">("next");
  const [activeTab, setActiveTab] = useState<Tab>("roster");
  const [hasMounted, setHasMounted] = useState(false);

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    // Fetch artists
    fetch(`${strapiUrl}/api/artists?populate=profileImage,backgroundImage,designation&sort=orderRank:asc`)
      .then(r => r.json())
      .then(json => {
        const mapped = (json.data || []).map((item: any) => ({
          _id: String(item.id),
          name: item.attributes.name,
          slug: item.attributes.slug,
          signature: item.attributes.signature || item.attributes.name,
          profileImage: item.attributes.profileImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl) : "",
          backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.backgroundImage.data.attributes.url, strapiUrl) : undefined,
          artistType: item.attributes.artistType || "roster",
          designation: (item.attributes.designation || []).map((d: any) => d.designation),
        }));
        setAllArtists(mapped);
        const first = mapped.find((a: Artist) => a.artistType === "roster") || mapped[0];
        if (first) { setSelectedItem(first); setCurrentIndex(0); }
      })
      .catch(() => {});

    // Fetch groups
    fetch(`${strapiUrl}/api/groups?populate=profileImage,backgroundImage&sort=orderRank:asc`)
      .then(r => r.json())
      .then(json => {
        const mapped = (json.data || []).map((item: any) => ({
          _id: String(item.id),
          name: item.attributes.name,
          slug: item.attributes.slug,
          signature: item.attributes.signature || item.attributes.name,
          profileImage: item.attributes.profileImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.profileImage.data.attributes.url, strapiUrl) : "",
          backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.backgroundImage.data.attributes.url, strapiUrl) : undefined,
          groupType: item.attributes.groupType || "band",
        }));
        setAllGroups(mapped);
      })
      .catch(() => {});
  }, []);

  const roster         = allArtists.filter(a => a.artistType === "roster" || a.artistType === "spotlight");
  const affiliates     = allArtists.filter(a => a.artistType === "affiliate");
  const producers      = allArtists.filter(a => a.designation?.some(d => ["producer","beatmaker","mixing_engineer"].includes(d)));
  const instrumentalists = allArtists.filter(a => a.designation?.some(d => d === "instrumentalist"));
  const djs            = allArtists.filter(a => a.designation?.some(d => d === "dj"));

  const getActiveItems = (): (Artist | Group)[] => {
    switch (activeTab) {
      case "roster":          return roster;
      case "affiliate":       return affiliates;
      case "groups":          return allGroups;
      case "producers":       return producers;
      case "instrumentalists": return instrumentalists;
      case "djs":             return djs;
      default:                return roster;
    }
  };

  const getItemHref = (item: Artist | Group): string => {
    if ('groupType' in item) return `/groups/${item.slug}`;
    return `/artists/${item.slug}`;
  };

  const activeItems = getActiveItems();

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "roster",          label: "Official Roster",   count: roster.length },
    { key: "affiliate",       label: "Affiliates",        count: affiliates.length },
    ...(allGroups.length > 0          ? [{ key: "groups" as Tab,          label: "Groups & Collectives", count: allGroups.length }] : []),
    ...(producers.length > 0          ? [{ key: "producers" as Tab,        label: "Producers",            count: producers.length }] : []),
    ...(instrumentalists.length > 0   ? [{ key: "instrumentalists" as Tab, label: "Instrumentalists",     count: instrumentalists.length }] : []),
    ...(djs.length > 0                ? [{ key: "djs" as Tab,              label: "DJs",                  count: djs.length }] : []),
  ];

  const TAB_DESCRIPTIONS: Record<Tab, string> = {
    roster:           "GOOD NATURED SOULS VERY OWN",
    affiliate:        "CREATIVE COLLABORATORS",
    groups:           "BANDS, COLLECTIVES & LIVE ACTS",
    producers:        "ARCHITECTS OF THE SOUND",
    instrumentalists: "THE LIVE ELEMENT",
    djs:              "SELECTORS & SONIC CURATORS",
  };

  const handleNext = () => {
    setDirection("next");
    const newIndex = (currentIndex + 1) % activeItems.length;
    setCurrentIndex(newIndex);
    setSelectedItem(activeItems[newIndex]);
  };

  const handlePrev = () => {
    setDirection("prev");
    const newIndex = currentIndex === 0 ? activeItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(activeItems[newIndex]);
  };

  const handleHover = (item: Artist | Group, index: number) => {
    if (!isMediumScreen) { setSelectedItem(item); setCurrentIndex(index); }
  };

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentIndex(0);
    const items = getActiveItems();
    if (items.length > 0) setSelectedItem(items[0]);
  };

  if (!hasMounted) return (
    <div className="py-8 max-w-5xl mx-auto px-4">
      <div className="flex md:flex-row flex-col-reverse items-center justify-center gap-8">
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {[1,2,3].map(i => (
            <div key={i} className="h-10 bg-secondaryInteraction rounded animate-pulse" style={{width: `${60 + i * 10}%`}} />
          ))}
        </div>
        <div className="w-48 h-64 bg-secondaryInteraction rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="py-8">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-secondaryInteraction mb-12 max-w-5xl mx-auto px-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabSwitch(tab.key)}
            className={`font-oswald text-xs tracking-widest px-5 py-3 border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {tab.label.toUpperCase()}
            <span className="ml-2 text-xs opacity-50">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Section description */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <p className="text-gray-600 text-sm font-oswald tracking-widest">{TAB_DESCRIPTIONS[activeTab]}</p>
      </div>

      {/* Display */}
      {activeItems.length > 0 ? (
        <section className="flex md:text-left text-center items-center justify-center md:flex-row flex-col-reverse md:gap-0 gap-4 px-4">
          <section className="flex justify-center items-center w-full md:w-1/2">
            <section className="inline-flex flex-col gap-4">
              {activeItems.map((item, index) => (
                <motion.a
                  href={getItemHref(item)}
                  className={`font-oswald md:text-5xl text-4xl transition-colors duration-300 font-bold ${
                    currentIndex === index ? "text-accent" : ""
                  } hover:text-accent hover:cursor-pointer hover:underline-offset-4 decoration-4 decoration-orange-400`}
                  key={item._id}
                  onMouseOver={() => handleHover(item, index)}
                  whileHover={{ scale: 1.05, x: 6 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </section>
          </section>

          <div className="flex-1">
            {!isMediumScreen ? (
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={selectedItem?._id}
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                >
                  <Polaroid
                    profileImage={selectedItem ? selectedItem.profileImage : activeItems[0].profileImage}
                    signature={selectedItem ? selectedItem.signature || selectedItem.name : activeItems[0].name}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <ArtistCarouselMobile
                selectedArtist={selectedItem ? { ...selectedItem, _createdAt: "", slug: (selectedItem as any).slug } as any : { ...activeItems[0], _createdAt: "", slug: (activeItems[0] as any).slug } as any}
                currentIndex={currentIndex}
                numArtists={activeItems.length}
                direction={direction}
                handleNextClick={handleNext}
                handlePrevClick={handlePrev}
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
