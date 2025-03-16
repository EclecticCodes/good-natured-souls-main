"use client";

import React, { useEffect, useState } from "react";
import jumbotronOne from "../../public/images/jumbotronFour.jpg";
import jumbotronTwo from "../../public/images/jumbotronTwo.jpg";
import jumbotronThree from "../../public/images/jumbotronThree.jpg";

type Props = {};

const images = [jumbotronOne.src, jumbotronTwo.src, jumbotronThree.src];

const Jumbotron = (props: Props) => {
  console.log("Jumbotron rerendered");

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fading out
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true); // Fade in the new image
      }, 1000); // Duration of the fade out effect
    }, 7000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [index]);

  return (
    <div
      className={`min-h-screen bg-no-repeat bg-fixed bg-cover bg-center flex items-center transition-opacity duration-1000 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `url(${images[index]})`,
      }}
    >
      <div className="w-full h-screen bg-black/15 flex flex-col justify-center items-center">
        <h1 className="text-accent text-center md:text-7xl text-6xl p-2 font-cormorant font-bold">
          Good Natured Souls
        </h1>
      </div>
    </div>
  );
};

export default Jumbotron;
