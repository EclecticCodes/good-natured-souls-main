"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

const ParallaxSection = ({ children, className = "", strength = 60 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength / 2, strength / 2]);
  return (
    <div ref={ref} className={"relative overflow-hidden " + className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
