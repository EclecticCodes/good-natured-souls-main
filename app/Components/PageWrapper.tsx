"use client";
import React, { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

export const PageWrapper = ({ children }: Props) => {
  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ delay: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
