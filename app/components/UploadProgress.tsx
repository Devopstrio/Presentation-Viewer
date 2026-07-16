"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

interface UploadProgressProps {
  progress: number;
  status: "idle" | "uploading" | "converting" | "success" | "error";
  errorMsg?: string;
}

export default function UploadProgress({ progress, status, errorMsg }: UploadProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-6">
      <div className="rounded-2xl border border-border-color bg-secondary-bg p-6">
        <AnimatePresence mode="wait">
          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white-text">Uploading standup video...</span>
                <span className="text-primary-red font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border-color">
                <motion.div
                  className="h-full bg-primary-red"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {status === "converting" && (
            <motion.div
              key="converting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-center py-2"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-red border-t-transparent" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white-text">Processing video...</p>
                  <p className="text-xs text-gray-text">Finalizing file upload to database</p>
                </div>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center space-x-4 py-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FiCheckCircle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white-text">Video Ready</p>
                <p className="text-xs text-gray-text truncate">File uploaded successfully.</p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center space-x-4 py-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-red/10 text-primary-red border border-primary-red/20">
                <span className="text-lg font-bold">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white-text">Upload Failed</p>
                <p className="text-xs text-red-400 truncate">{errorMsg || "An error occurred during upload."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
