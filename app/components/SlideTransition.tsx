"use client";

import React from "react";
import { motion } from "framer-motion";

interface SlideTransitionProps {
  children: React.ReactNode;
  triggerKey: any;
}

export default function SlideTransition({ children, triggerKey }: SlideTransitionProps) {
  return (
    <motion.div
      key={triggerKey}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeInOut" } }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="w-full h-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}
