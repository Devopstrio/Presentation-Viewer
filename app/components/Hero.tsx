"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative overflow-hidden py-12 md:py-16 text-center">
      {/* Background radial accent glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-red/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-4"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-red/10 px-3 py-1 text-xs font-semibold text-primary-red border border-primary-red/20 mb-6 uppercase tracking-wider">
          STANDUP UTILITY
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white-text sm:text-5xl md:text-6xl lg:text-7xl">
          Presentation <span className="text-primary-red text-glow">Viewer</span>
        </h1>
        <p className="mt-6 text-lg text-gray-text max-w-xl mx-auto sm:text-xl font-light leading-relaxed">
          Upload your presentation and play it in fullscreen mode with smooth transitions and automated timing.
        </p>
      </motion.div>
    </div>
  );
}
