"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiVolume2, FiVolumeX, FiPlay, FiPause } from "react-icons/fi";

interface PowerPointPlayerProps {
  videoUrl: string;
  onFinished?: () => void;
}

export default function PowerPointPlayer({ videoUrl, onFinished }: PowerPointPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Play/Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((err) => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Auto-play safety check
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay was blocked by browser. Playing muted...", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch((e) => console.error("Force play failed:", e));
        }
      });
    }
  }, [videoUrl]);

  return (
    <div
      className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative group/player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Stream Container */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-contain max-h-[85vh] cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big Center Play/Pause Indicator on Hover/Pause */}
        {(!isPlaying || showControls) && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto flex items-center justify-center h-20 w-20 rounded-full bg-secondary-bg/80 border border-border-color backdrop-blur-md text-white-text transition-all duration-300 hover:scale-110 hover:border-primary-red hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] z-10"
          >
            {isPlaying ? (
              <FiPause className="h-8 w-8 text-white-text" />
            ) : (
              <FiPlay className="h-8 w-8 text-primary-red ml-1" />
            )}
          </button>
        )}

        {/* Bottom Right Audio Toggle */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-xl border border-border-color backdrop-blur-md transition-all duration-300 shadow-lg 
            ${
              isMuted
                ? "bg-[#222]/80 text-gray-text hover:text-white-text hover:border-white-text/40"
                : "bg-primary-red/20 text-primary-red border-primary-red/40 hover:bg-primary-red hover:text-white-text hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]"
            }
          `}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <FiVolumeX className="h-5 w-5" /> : <FiVolume2 className="h-5 w-5" />}
        </button>

        {/* Loop Mode Badge (GIF behavior indicator) */}
        <div className="absolute bottom-6 left-6 z-20 bg-secondary-bg/85 border border-border-color backdrop-blur-sm px-3.5 py-1.5 rounded-lg flex items-center space-x-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-text pointer-events-none select-none">
          <div className="h-2 w-2 rounded-full bg-primary-red animate-pulse" />
          <span>Looping Video Mode</span>
        </div>
      </div>
    </div>
  );
}
