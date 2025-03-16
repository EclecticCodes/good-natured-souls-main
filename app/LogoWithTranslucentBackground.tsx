"use client"; // Mark as client-side component

import React, { useState, useEffect } from "react";

const LogoWithTranslucentBackground = () => {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50); // Set the threshold for the scroll position
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`absolute top-0 left-0 p-4 transition-opacity duration-300 ${
        scrolling ? "bg-opacity-50" : "bg-opacity-100"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <img src="/path/to/your/logo.png" alt="Logo" className="w-auto h-16" />
    </div>
  );
};

export default LogoWithTranslucentBackground;
