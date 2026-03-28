"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const LOCAL_VIDEOS = [
  "https://res.cloudinary.com/good-natured-souls-gns/video/upload/q_auto:best,w_1920,vc_auto/v1774240995/videoplayback_1_h8hbxf.mp4",
  "https://res.cloudinary.com/good-natured-souls-gns/video/upload/q_auto:best,w_1920,vc_auto/v1774240921/videoplayback_2_sgickn.mp4",
  "https://res.cloudinary.com/good-natured-souls-gns/video/upload/q_auto:best,w_1920,vc_auto/v1774241162/videoplayback_dxyagt.mp4",
];

const LOCAL_IMAGES = [
  "/images/jumbotronFour.jpg",
  "/images/jumbotronTwo.jpg",
  "/images/jumbotronThree.jpg",
  "/images/jumbotronFive.jpg",
];

const FAST_CONNECTION_TYPES = ["4g"];
const CYCLE_DURATION = 15000;
const IMAGE_CYCLE_DURATION = 8000;

type Props = {
  images?: string[];
  headline?: string | null;
  tagline?: string | null;
  youtubeVideoIds?: string[];
};

function pickRandom<T>(arr: T[], exclude?: T): T {
  const pool = exclude ? arr.filter((v) => v !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)] ?? arr[0];
}

async function isConnectionFast(): Promise<boolean> {
  const nav = navigator as any;
  if (nav.connection) {
    const conn = nav.connection;
    if (conn.effectiveType && !FAST_CONNECTION_TYPES.includes(conn.effectiveType)) return false;
    if (conn.saveData) return false;
    if (conn.downlink !== undefined && conn.downlink < 2) return false;
  }
  try {
    const start = Date.now();
    await fetch("/images/jumbotronFour.jpg", { cache: "no-store" });
    return Date.now() - start < 800;
  } catch {
    return false;
  }
}

const Jumbotron = ({ images, headline, tagline }: Props) => {
  const allImages = images && images.length > 0 ? images : LOCAL_IMAGES;
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [videoReady, setVideoReady] = useState(false);
  const [useVideo, setUseVideo] = useState(true); // Start with video
  const [videoChecked, setVideoChecked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 180]);
  const textY = useTransform(scrollY, [0, 600], [0, -60]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    // Pick a random image placeholder and random video immediately
    setPlaceholderIndex(Math.floor(Math.random() * allImages.length));
    setVideoSrc(pickRandom(LOCAL_VIDEOS));

    // After 4 seconds check connection — if slow, fall back to images
    const timer = setTimeout(() => {
      isConnectionFast().then((fast) => {
        setVideoChecked(true);
        if (!fast) {
          // Connection too slow — switch to image slideshow
          setUseVideo(false);
          setVideoReady(false);
        }
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Image slideshow — only when not using video
  useEffect(() => {
    if (useVideo) return;
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setImageVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % allImages.length);
        setImageVisible(true);
      }, 1200);
    }, IMAGE_CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [useVideo, allImages.length]);

  // Video cycle — switch after 15s
  useEffect(() => {
    if (!useVideo || !videoReady) return;
    const timer = setTimeout(() => {
      setVideoReady(false);
      const next = pickRandom(LOCAL_VIDEOS, videoSrc);
      setVideoSrc(next);
    }, CYCLE_DURATION);
    return () => clearTimeout(timer);
  }, [useVideo, videoReady, videoSrc]);

  const handleVideoCanPlay = () => setVideoReady(true);
  const handleVideoError = () => {
    setUseVideo(false);
    setVideoReady(false);
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] as any },
    }),
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">

      {/* Parallax background */}
      <motion.div
        style={{ y: bgY, top: "-10%", bottom: "-10%", left: 0, right: 0 }}
        className="absolute will-change-transform"
      >
        {/* Blurred image placeholder — shows while video loads or in image mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={placeholderIndex}
            initial={{ opacity: 0 }}
            animate={{
              opacity: (!useVideo || !videoReady) ? (imageVisible ? 1 : 0) : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${allImages[placeholderIndex]})`,
              filter: useVideo && !videoReady ? "blur(12px)" : "none",
              transform: useVideo && !videoReady ? "scale(1.08)" : "scale(1)",
              transition: "filter 0.8s ease, transform 0.8s ease",
            }}
          />
        </AnimatePresence>

        {/* Video — fades in when ready */}
        {useVideo && videoSrc && (
          <motion.video
            ref={videoRef}
            key={videoSrc}
            autoPlay
            muted
            playsInline
            onCanPlayThrough={handleVideoCanPlay}
            onError={handleVideoError}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </motion.video>
        )}
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 z-10" />
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Parallax text */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 text-center will-change-transform"
      >
        <motion.h1
          custom={0.3}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="font-cormorant font-bold text-white text-4xl md:text-6xl lg:text-7xl tracking-widest mb-4 leading-tight drop-shadow-lg"
        >
          {headline || "Good Natured Souls"}
        </motion.h1>

        <motion.div
          custom={0.55}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="w-16 h-0.5 bg-accent mb-6"
        />

        <motion.p
          custom={0.75}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="font-oswald text-white/70 text-sm md:text-base tracking-widest uppercase mb-10 max-w-lg"
        >
          {tagline || "New York City · Independent Music · Hip Hop & R&B"}
        </motion.p>

        <motion.div
          custom={0.95}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href="/artists" className="font-oswald font-bold text-sm tracking-widest px-8 py-4 bg-accent text-primary hover:bg-accentInteraction transition-colors duration-300 text-center">
            OUR ARTISTS
          </a>
          {/* Shows and Store hidden while in development */}
          <a href="/shows" className="font-oswald font-bold text-sm tracking-widest px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary transition-colors duration-300 text-center">
            UPCOMING SHOWS
          </a>
          <a href="/store" className="font-oswald font-bold text-sm tracking-widest px-8 py-4 border-2 border-accent text-accent hover:bg-accent hover:text-primary transition-colors duration-300 text-center">
            SHOP
          </a>
        </motion.div>

        {/* HD indicator */}
        {videoChecked && useVideo && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 0.2 : 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-8 font-oswald text-xs text-white/20 tracking-widest"
          >
            HD
          </motion.p>
        )}
      </motion.div>

      {/* Image dots — only in image fallback mode */}
      {!useVideo && allImages.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPlaceholderIndex(i); setImageVisible(true); }}
              className={`h-1.5 rounded-full transition-all duration-700 ${i === placeholderIndex ? "bg-accent w-8" : "bg-white/40 w-3"}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        style={{ opacity: textOpacity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1 h-2 bg-white/50 rounded-full"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Jumbotron;