"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiFile, FiUser, FiCalendar } from "react-icons/fi";

interface PresentationInfoProps {
  presentation: {
    id: string;
    title: string;
    presenterName: string;
    presentationDate: string | Date;
    fileName: string;
    fileUrl: string;
    uploadedAt: string | Date;
  };
}

export default function PresentationInfo({ presentation }: PresentationInfoProps) {
  const formattedUploadDate = new Date(presentation.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedScheduledDate = new Date(presentation.presentationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto px-4 mt-6"
    >
      <div className="rounded-2xl border border-border-color bg-secondary-bg p-6 space-y-5 shadow-lg">
        <div className="border-b border-border-color pb-4">
          <span className="text-xs text-primary-red font-semibold uppercase tracking-wider">
            Video Ready
          </span>
          <h3 className="text-xl font-bold text-white-text mt-1 truncate">
            {presentation.title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border-color text-gray-text">
              <FiUser className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-text">Presentation Name</p>
              <p className="font-semibold text-white-text truncate max-w-[150px]">
                {presentation.presenterName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border-color text-gray-text">
              <FiCalendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-text">Scheduled For</p>
              <p className="font-semibold text-white-text">{formattedScheduledDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm pt-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border-color text-gray-text">
            <FiFile className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-gray-text">Video File</p>
            <p className="font-medium text-white-text truncate max-w-[280px] sm:max-w-md">
              {presentation.fileName}
            </p>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-text pt-2 border-t border-border-color/50">
          Uploaded on {formattedUploadDate}
        </div>
      </div>
    </motion.div>
  );
}
