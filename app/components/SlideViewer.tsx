"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

interface SlideViewerProps {
  fileUrl: string;
  currentPage: number;
  onTotalPagesDetected: (totalPages: number) => void;
}

export default function SlideViewer({
  fileUrl,
  currentPage,
  onTotalPagesDetected,
}: SlideViewerProps) {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // 1. Dynamically import pdfjs-dist on client side
  useEffect(() => {
    import("pdfjs-dist")
      .then((mod) => {
        // Set worker source
        mod.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`;
        setPdfjs(mod);
      })
      .catch((err) => {
        console.error("Error loading PDF.js:", err);
      });
  }, []);

  // 2. Load PDF document
  useEffect(() => {
    if (!pdfjs || !fileUrl) return;

    let active = true;
    setLoading(true);

    const loadingTask = pdfjs.getDocument({ url: fileUrl });
    loadingTask.promise
      .then((pdf: any) => {
        if (!active) return;
        setPdfDoc(pdf);
        onTotalPagesDetected(pdf.numPages);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error loading PDF document:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      loadingTask.destroy();
    };
  }, [pdfjs, fileUrl, onTotalPagesDetected]);

  // 3. Render page function
  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      setRendering(true);

      // Cancel previous render task if still active
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const unscaledViewport = page.getViewport({ scale: 1 });

      // Aspect ratio containment scaling
      const scaleX = containerWidth / unscaledViewport.width;
      const scaleY = containerHeight / unscaledViewport.height;
      const scale = Math.min(scaleX, scaleY) * 0.95; // 0.95 scale for small padding

      const viewport = page.getViewport({ scale });

      // Support high DPI devices
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendering(false);
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF page:", err);
      }
    }
  };

  // 4. Render active page and listen to resize events
  useEffect(() => {
    renderPage();

    const handleResize = () => {
      renderPage();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <Loader message="Loading presentation slides..." />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center bg-[#050505] p-4 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeInOut" } }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="relative flex items-center justify-center max-w-full max-h-full"
        >
          {rendering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-lg">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-red border-t-transparent" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl border border-border-color bg-secondary-bg"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
