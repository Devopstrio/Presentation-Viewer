"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";

interface FullscreenButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function FullscreenButton({ onClick, disabled }: FullscreenButtonProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-6 text-center">
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.05, boxShadow: "0 0 25px rgba(225, 29, 72, 0.6)" } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={onClick}
        className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors duration-300 flex items-center justify-center space-x-2 text-white-text red-glow-shadow
          ${
            disabled
              ? "bg-primary-red/50 cursor-not-allowed opacity-50"
              : "bg-primary-red hover:bg-hover-red cursor-pointer"
          }
        `}
      >
        <FiPlay className="h-4 w-4 fill-white" />
        <span>Start Presentation</span>
      </motion.button>
    </div>
  );
}
