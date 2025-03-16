// components/ScrollHandler.tsx
import { useState, useEffect } from "react";

const ScrollHandler = () => {
  const [scrolling, setScrolling] = useState(false);

  // Function to check scroll position and set transparency
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setScrolling(true); // Show translucent background when scrolled
    } else {
      setScrolling(false); // Keep solid background at the top
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { scrolling }; // Return the scroll state
};

export default ScrollHandler;
