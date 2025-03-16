"use client";

import { motion } from "framer-motion";

const Marquee = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-gray-800 text-yellow-300 py-2 w-full">
      <motion.div
        className="flex text-lg font-bold"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        <span className="mx-10">
          🚀 Welcome to Good Natured Souls — Elevating Music & Culture
        </span>
        <span className="mx-10">
          🎶 Discover New Artists | 🌍 Support Independent Music
        </span>
        <span className="mx-10">
          ✨ Join Our Movement | 💡 Innovating the Music Industry
        </span>

        {/* Duplicate the text for a seamless loop */}
        <span className="mx-10">
          🚀 Welcome to Good Natured Souls — Elevating Music & Culture
        </span>
        <span className="mx-10">
          🎶 Discover New Artists | 🌍 Support Independent Music
        </span>
        <span className="mx-10">
          ✨ Join Our Movement | 💡 Innovating the Music Industry
        </span>
      </motion.div>
    </div>
  
  );
};

{/* use this code  to create a live feed marque 
  
  "use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Marquee = () => {
  const [news, setNews] = useState<string[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/marquee");
        const data = await res.json();
        setNews(data.map((item: { title: string }) => item.title));
      } catch (error) {
        console.error("Failed to fetch news", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap bg-gray-800 text-yellow-300 py-2 w-full">
      <motion.div
        className="flex text-lg font-bold"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        {news.length > 0 ? (
          news.map((item, index) => (
            <span key={index} className="mx-10">
              {item}
            </span>
          ))
        ) : (
          <span className="mx-10">📰 Loading news...</span>
        )}

        
        {news.map((item, index) => (
          <span key={`duplicate-${index}`} className="mx-10">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;


  
  */}

export default Marquee;
