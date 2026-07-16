"use client";

import React from "react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-color bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Devopstrio Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-white-text">
            Devopstrio
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1 text-xs font-medium text-gray-text border border-border-color">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active Standup
          </span>
        </div>
      </div>
    </header>
  );
}
