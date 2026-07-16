"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FiUploadCloud, FiFileText, FiTrash2, FiPlay } from "react-icons/fi";

interface UploadCardProps {
  presenterName: string;
  setPresenterName: (name: string) => void;
  presentationDate: string;
  setPresentationDate: (date: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  onUpload: () => void;
  isUploading: boolean;
}

export default function UploadCard({
  presenterName,
  setPresenterName,
  presentationDate,
  setPresentationDate,
  selectedFile,
  setSelectedFile,
  onUpload,
  isUploading,
}: UploadCardProps) {
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isUploading) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    [setSelectedFile, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    multiple: false,
    disabled: isUploading || !!selectedFile,
  });

  const isFormValid = presenterName.trim() !== "" && presentationDate !== "" && selectedFile !== null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-left">
          <label className="block text-xs font-bold text-gray-text uppercase tracking-wider mb-2">
            Presentation Name
          </label>
          <input
            type="text"
            value={presenterName}
            onChange={(e) => setPresenterName(e.target.value)}
            placeholder="e.g. Daily Standup"
            className="w-full rounded-xl border border-border-color bg-secondary-bg px-4 py-3 text-sm text-white-text placeholder-gray-text outline-none transition-all duration-300 focus:border-primary-red focus:shadow-[0_0_12px_rgba(225,29,72,0.2)]"
            disabled={isUploading}
          />
        </div>

        <div className="text-left">
          <label className="block text-xs font-bold text-gray-text uppercase tracking-wider mb-2">
            Standup Date
          </label>
          <input
            type="date"
            value={presentationDate}
            onChange={(e) => setPresentationDate(e.target.value)}
            className="w-full rounded-xl border border-border-color bg-secondary-bg px-4 py-3 text-sm text-white-text outline-none transition-all duration-300 focus:border-primary-red focus:shadow-[0_0_12px_rgba(225,29,72,0.2)] [color-scheme:dark]"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Upload Zone */}
      {!selectedFile ? (
        <div {...getRootProps()} className="outline-none">
          <motion.div
            whileHover={!isUploading ? { scale: 1.01 } : {}}
            transition={{ duration: 0.2 }}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 bg-secondary-bg 
              ${
                isDragActive
                  ? "border-primary-red bg-primary-red/5 shadow-[0_0_20px_rgba(225,29,72,0.15)]"
                  : "border-border-color hover:border-primary-red/40"
              }
              ${isDragReject ? "border-red-500 bg-red-500/5" : ""}
              ${isUploading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={
                  isDragActive
                    ? { y: [-5, 5, -5], scale: 1.1 }
                    : { y: 0, scale: 1 }
                }
                transition={
                  isDragActive
                    ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    : {}
                }
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-background border border-border-color text-gray-text
                  ${isDragActive ? "border-primary-red/50 text-primary-red" : ""}
                `}
              >
                <FiUploadCloud className={`h-8 w-8 ${isDragActive ? "text-primary-red" : "text-gray-text"}`} />
              </motion.div>

              <div className="space-y-1.5">
                <p className="text-base font-semibold text-white-text">
                  {isDragActive ? "Drop video here" : "Drag & drop standup video"}
                </p>
                <p className="text-sm text-gray-text">
                  or click to browse (.MP4)
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2 text-xs text-gray-text">
                <span className="rounded bg-background px-2.5 py-1 border border-border-color">
                  .MP4
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Selected File Card */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border-color bg-secondary-bg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-red/10 border border-primary-red/20 text-primary-red">
              <FiFileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white-text max-w-xs truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-text">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedFile(null)}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#222] border border-border-color text-gray-text hover:text-red-500 hover:border-red-500/30 transition-all"
              disabled={isUploading}
              title="Remove file"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>

            <button
              onClick={onUpload}
              disabled={!isFormValid || isUploading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  isFormValid && !isUploading
                    ? "bg-primary-red text-white-text hover:bg-hover-red shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer"
                    : "bg-[#222] text-gray-text border border-border-color cursor-not-allowed"
                }
              `}
            >
              <FiUploadCloud className="h-4 w-4" />
              <span>{isUploading ? "Uploading..." : "Upload"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
