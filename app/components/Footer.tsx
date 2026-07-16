"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-color bg-background py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-text">
          &copy; {new Date().getFullYear()} Devopstrio. All rights reserved.
        </p>
        <p className="text-xs text-gray-text flex items-center gap-1">
          Built for premium standup presentations with
          <span className="text-primary-red">&hearts;</span>
        </p>
      </div>
    </footer>
  );
}
