/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiTrash2,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiPlay,
  FiDownload,
  FiX,
  FiChevronRight,
  FiVideo,
  FiEdit2,
  FiCheck
} from "react-icons/fi";

import dynamic from "next/dynamic";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadCard from "./components/UploadCard";
import UploadProgress from "./components/UploadProgress";
import PresentationInfo from "./components/PresentationInfo";
import FullscreenButton from "./components/FullscreenButton";
import Footer from "./components/Footer";

const PowerPointPlayer = dynamic(() => import("./components/PowerPointPlayer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#050505] space-y-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-red border-t-transparent" />
      <p className="text-sm text-gray-text font-bold uppercase tracking-widest animate-pulse">
        Opening Presentation...
      </p>
    </div>
  ),
});


interface PresentationData {
  id: string;
  title: string;
  presenterName: string;
  presentationDate: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  createdAt: string;
}

export default function Home() {
  // Upload Card states
  const [presenterName, setPresenterName] = useState("");
  const [presentationDate, setPresentationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // API upload / processing states
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Presentation list / viewer states
  const [presentationsList, setPresentationsList] = useState<PresentationData[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [activePresentation, setActivePresentation] = useState<PresentationData | null>(null);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(true);

  const presentationContainerRef = useRef<HTMLDivElement | null>(null);

  // Edit Mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch all presentations from DB
  const fetchPresentations = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/presentation");
      const data = await res.json();
      if (data.success) {
        setPresentationsList(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch presentations:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  // Check if browser supports Fullscreen API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
      setFullscreenSupported(supported);
    }
  }, []);

  // Sync fullscreen change event (e.g. if user exits with ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenMode(false);
        setActivePresentation(null);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Request fullscreen when isFullscreenMode goes true
  useEffect(() => {
    if (isFullscreenMode && presentationContainerRef.current) {
      const container = presentationContainerRef.current;
      const requestFs =
        container.requestFullscreen ||
        (container as any).webkitRequestFullscreen ||
        (container as any).msRequestFullscreen;

      if (requestFs) {
        requestFs.call(container).catch((err: any) => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      }
    }
  }, [isFullscreenMode]);

  // Lock scroll when in fullscreen presentation mode
  useEffect(() => {
    if (isFullscreenMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreenMode]);

  // Handle uploading and parsing files
  const handleUpload = async () => {
    if (!selectedFile || !presenterName || !presentationDate) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setErrorMsg("");
    setPresentationData(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("presenterName", presenterName);
    formData.append("presentationDate", presentationDate);

    try {
      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
        }
      });

      const response = await new Promise<any>((resolve, reject) => {
        xhr.open("POST", "/api/upload");

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response content"));
            }
          } else {
            try {
              const errJson = JSON.parse(xhr.responseText);
              reject(new Error(errJson.error || "Upload failed"));
            } catch {
              reject(new Error(`Server returned code ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error."));
        xhr.send(formData);
      });

      if (response.success) {
        setUploadStatus("success");
        setPresentationData(response.data);
        // Clear upload states
        setPresenterName("");
        setSelectedFile(null);
        // Refresh presentations list
        fetchPresentations();
      } else {
        throw new Error(response.error || "Processing failed");
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  const handlePresent = (presentation: PresentationData) => {
    if (!fullscreenSupported) {
      alert("Fullscreen is not supported on this browser.");
      return;
    }

    setActivePresentation(presentation);
    setIsFullscreenMode(true);
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this presentation?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/presentation/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh list
        fetchPresentations();
        if (presentationData?.id === id) {
          setPresentationData(null);
          setUploadStatus("idle");
        }
      } else {
        alert("Failed to delete presentation");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    }
  };

  const handleEdit = (item: PresentationData) => {
    setEditingId(item.id);
    setEditName(item.presenterName);
    const d = new Date(item.presentationDate);
    const dateStr = d.toISOString().split("T")[0];
    setEditDate(dateStr);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editDate) {
      alert("Presentation Name and Standup Date cannot be empty.");
      return;
    }
    
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/presentation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presenterName: editName,
          presentationDate: editDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPresentationsList((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  presenterName: data.data.presenterName,
                  presentationDate: data.data.presentationDate,
                }
              : p
          )
        );
        setEditingId(null);
      } else {
        alert(data.error || "Failed to update presentation.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while updating.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error("Exit fullscreen error:", err));
    }
    setIsFullscreenMode(false);
    setActivePresentation(null);
  };

  // Group presentations by UTC scheduled date label
  const getGroupedPresentations = () => {
    const groups: { [key: string]: PresentationData[] } = {};
    
    // Sort presentations chronologically by presentationDate descending
    const sorted = [...presentationsList].sort((a, b) => {
      return new Date(b.presentationDate).getTime() - new Date(a.presentationDate).getTime();
    });

    sorted.forEach((p) => {
      const dateLabel = new Date(p.presentationDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(p);
    });

    return groups;
  };

  const groupedPresentations = getGroupedPresentations();

  return (
    <>
      {/* LANDING PAGE / UPLOAD MODE */}
      {!isFullscreenMode && (
        <div className="flex flex-col flex-1 min-h-screen">
          <Navbar />

          <main className="flex-1 pb-24 flex flex-col justify-start items-center">
            <Hero />

            {!fullscreenSupported && (
              <div className="w-full max-w-xl mx-auto px-4 mb-6">
                <div className="flex items-center space-x-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                  <FiAlertCircle className="h-5 w-5 shrink-0" />
                  <span>Fullscreen is not supported on this browser.</span>
                </div>
              </div>
            )}

            {/* Step 1: Form Inputs & Upload Zone */}
            {uploadStatus !== "success" && (
              <UploadCard
                presenterName={presenterName}
                setPresenterName={setPresenterName}
                presentationDate={presentationDate}
                setPresentationDate={setPresentationDate}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onUpload={handleUpload}
                isUploading={uploadStatus === "uploading"}
              />
            )}

            {/* Step 2: Upload progress */}
            <UploadProgress
              progress={uploadProgress}
              status={uploadStatus}
              errorMsg={errorMsg}
            />

            {/* Step 3: Success Metadata */}
            {uploadStatus === "success" && presentationData && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <PresentationInfo presentation={presentationData} />

                <FullscreenButton onClick={() => handlePresent(presentationData)} />

                {/* Reset button to upload another */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setPresentationData(null);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs text-gray-text hover:text-white-text transition-colors font-semibold border border-border-color bg-[#111] px-4 py-2 rounded-xl cursor-pointer"
                  >
                    <span>Upload New Standup</span>
                    <FiChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Standup Archive List (Day by Day) */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-20 space-y-8">
              <div className="border-b border-border-color pb-4 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white-text flex items-center justify-center md:justify-start gap-2">
                    <FiCalendar className="text-primary-red h-6 w-6" /> Standup Calendar
                  </h2>
                  <p className="text-sm text-gray-text mt-1 font-medium">
                    Grouped by scheduled date. Click Present to play the standup video.
                  </p>
                </div>
              </div>

              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-red border-t-transparent" />
                  <p className="text-sm text-gray-text font-medium">Fetching standup videos...</p>
                </div>
              ) : Object.keys(groupedPresentations).length === 0 ? (
                <div className="text-center py-12 border border-border-color border-dashed rounded-2xl bg-secondary-bg/30">
                  <p className="text-gray-text text-sm font-medium">No presentations uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedPresentations).map(([dateLabel, items]) => (
                    <div key={dateLabel} className="space-y-3 text-left">
                      <h3 className="text-xs font-bold text-primary-red uppercase tracking-wider pl-3 border-l-2 border-primary-red">
                        {dateLabel}
                      </h3>
                      <div className="grid gap-3">
                        {items.map((item) => (
                          <motion.div
                            key={item.id}
                            whileHover={editingId !== item.id ? { scale: 1.005 } : {}}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border-color bg-secondary-bg hover:border-primary-red/30 transition-all duration-300 gap-4"
                          >
                            {editingId === item.id ? (
                              <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full rounded-xl border border-border-color bg-background px-4 py-2.5 text-sm text-white-text placeholder-gray-text outline-none focus:border-primary-red transition-all"
                                    placeholder="Presentation Name"
                                    disabled={isSavingEdit}
                                  />
                                  <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full rounded-xl border border-border-color bg-background px-4 py-2.5 text-sm text-white-text outline-none focus:border-primary-red transition-all [color-scheme:dark]"
                                    disabled={isSavingEdit}
                                  />
                                </div>
                                <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    disabled={isSavingEdit}
                                    className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-50"
                                  >
                                    <FiCheck className="h-4 w-4" />
                                    <span>{isSavingEdit ? "Saving..." : "Save"}</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    disabled={isSavingEdit}
                                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#222] border border-border-color text-gray-text hover:text-white transition-all disabled:opacity-50"
                                    title="Cancel"
                                  >
                                    <FiX className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start sm:items-center space-x-4">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background border border-border-color text-primary-red shadow-sm">
                                    <FiVideo className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2.5">
                                      <h4 className="font-bold text-white-text text-sm">
                                        {item.presenterName}
                                      </h4>
                                      <span className="text-[10px] text-gray-text bg-background border border-border-color px-2.5 py-0.5 rounded-full font-medium">
                                        {new Date(item.uploadedAt).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-text truncate max-w-xs md:max-w-md mt-1 font-medium">
                                      {item.fileName}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 shrink-0">
                                  <button
                                    onClick={() => handlePresent(item)}
                                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary-red/10 border border-primary-red/20 text-xs font-bold text-primary-red hover:bg-primary-red hover:text-white-text transition-all duration-200 cursor-pointer"
                                  >
                                    <FiPlay className="h-3.5 w-3.5" />
                                    <span>Present</span>
                                  </button>

                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#222] border border-border-color text-gray-text hover:text-white transition-all"
                                    title="Edit Standup"
                                  >
                                    <FiEdit2 className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDownload(item.fileUrl, item.fileName)}
                                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#222] border border-border-color text-gray-text hover:text-white transition-all"
                                    title="Download Video file"
                                  >
                                    <FiDownload className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#222] border border-border-color text-gray-text hover:text-red-500 hover:border-red-500/20 transition-all"
                                    title="Delete Standup"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <Footer />
        </div>
      )}

      {/* FULLSCREEN PRESENTATION VIEWER */}
      <div
        ref={presentationContainerRef}
        className={`bg-black w-full h-full flex flex-col items-center justify-center relative ${
          isFullscreenMode ? "fixed inset-0 z-50 block" : "hidden"
        }`}
      >
        {isFullscreenMode && activePresentation && (
          <>
            {/* Top Control Bar */}
            <div className="absolute top-4 left-4 z-50 bg-secondary-bg/90 backdrop-blur-md border border-border-color/60 px-4 py-2.5 rounded-xl flex items-center space-x-3 text-xs pointer-events-auto">
              <span className="font-extrabold text-white-text">{activePresentation.presenterName}</span>
              <span className="h-3 w-px bg-border-color" />
              <span className="text-gray-text font-bold uppercase tracking-wider">
                {new Date(activePresentation.presentationDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>

            {/* Exit control button */}
            <button
              onClick={exitFullscreen}
              className="absolute top-4 right-4 z-50 bg-primary-red/15 border border-primary-red/35 text-primary-red hover:bg-primary-red hover:text-white-text transition-all px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold pointer-events-auto shadow-[0_0_12px_rgba(225,29,72,0.15)]"
            >
              <FiX className="h-4 w-4" />
              <span>Exit Presenter</span>
            </button>

            {/* Video Player container */}
            <div className="w-full h-full pt-16 flex items-center justify-center">
              <PowerPointPlayer
                videoUrl={activePresentation.fileUrl}
                onFinished={exitFullscreen}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
