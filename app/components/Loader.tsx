"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
}

export default function Loader({ message }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing element */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute h-16 w-16 rounded-full bg-primary-red/10 border border-primary-red/20"
        />
        {/* Spinning element */}
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-red border-t-transparent" />
      </div>
      {message && (
        <p className="text-sm font-medium text-gray-text animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
