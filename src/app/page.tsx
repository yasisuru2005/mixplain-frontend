"use client";

import React, { useState, ChangeEvent, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, Music2 } from "lucide-react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./components/Background3D"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- SCROLL ANIMATION HOOKS ---
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const opacity1 = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -40]);

  const opacity2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [40, 0, 0, -40]);

  const opacity3 = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
  const y3 = useTransform(scrollYProgress, [0.75, 0.9], [40, 0]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
    
      const isValidAudio = selectedFile.type.startsWith("audio/") || selectedFile.name.match(/\.(wav|mp3|m4a|flac)$/i);
      
      if (!isValidAudio) {
        
        setError("Invalid file format. Please upload a valid audio file (WAV, MP3, M4A, FLAC).");
        setFile(null);
        return;
      }

      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    sessionStorage.removeItem("analysisResult");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://mixplain-backend.onrender.com/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        setError(response.data.error);
        setLoading(false);
      } else {
        sessionStorage.setItem("analysisResult", JSON.stringify(response.data));
        router.push("/results");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Connection Error. Check Backend.");
      setLoading(false);
    }
  };

  return (
    // 1. The outer container is now 300vh tall to allow scrolling
    <div ref={containerRef} className="relative bg-[#030712] text-slate-200 font-sans selection:bg-cyan-500/30 h-[300vh]">
      
      {/* 2. The Sticky Container locks everything to the screen while scrolling */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        
        <Scene3D isLoading={loading} />

        {/* Top Nav (Remains fixed) */}
        <nav className="absolute top-0 left-0 w-full flex justify-between items-center p-8 z-50 pointer-events-none">
          <div className="text-sm font-mono tracking-[0.2em] text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            MIXPLAIN AI
          </div>
          <div className="text-xs font-mono tracking-widest text-slate-500">
            NEURO-SYMBOLIC ENGINE
          </div>
        </nav>

        {/* The Main UI Chrome */}
        <AnimatePresence>
          {!loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 1, ease: "easeInOut" } }}
              className="relative z-10 w-full"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-8 md:px-12">
                
                {/* --- LEFT: SCROLLING TYPOGRAPHY --- */}
                {/* Fixed height container so absolute children don't collapse */}
                <div className="relative w-full md:w-1/3 z-20 mb-12 md:mb-0 h-[250px]">
                  
                  {/* Phase 1 Text */}
                  <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute inset-0 pointer-events-none">
                    <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight text-white">
                      Sound Without <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Boundaries
                      </span>
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg font-light max-w-sm">
                      Upload your track. Get a detailed spectral analysis and actionable fix suggestions in seconds.
                    </p>
                  </motion.div>

                  {/* Phase 2 Text */}
                  <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute inset-0 pointer-events-none">
                    <h1 className="text-5xl md:text-6xl font-medium tracking-tight leading-tight text-white">
                      Neuro-Symbolic <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500">
                        Diagnostics
                      </span>
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg font-light max-w-sm">
                      Our AI maps your audio against elite genre targets to detect frequency masking, muddiness, and dynamic imbalances.
                    </p>
                  </motion.div>

                  {/* Phase 3 Text */}
                  <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute inset-0 pointer-events-none">
                    <h1 className="text-5xl md:text-6xl font-medium tracking-tight leading-tight text-white">
                      Precision <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                        Engineering
                      </span>
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg font-light max-w-sm">
                      Stop guessing. Get exact Hz frequencies and dB reduction targets to instantly clean up your mix before mastering.
                    </p>
                  </motion.div>
                </div>

                {/* --- CENTER: THE ORB & UPLOAD CONTROLS --- */}
                <div className="relative w-full md:w-1/3 flex flex-col justify-center items-center translate-y-20">
                  <motion.div
                    animate={{ scale: loading ? [0.95, 1.1, 0.95] : [0.98, 1.02, 0.98] }}
                    transition={{ repeat: Infinity, duration: loading ? 1.5 : 4, ease: "easeInOut" }}
                    className="relative w-64 h-64 flex items-center justify-center z-20 pointer-events-none"
                  >
                    <div className="absolute -top-10 -right-16 flex items-center gap-2">
                      <div className="w-12 h-px bg-cyan-500/50" />
                      <span className="text-[10px] font-mono tracking-widest text-cyan-400">[ AWAITING AUDIO ]</span>
                    </div>
                    <div className="absolute -bottom-10 -left-16 flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-slate-500">[ EXPERT MODULE ]</span>
                      <div className="w-12 h-px bg-slate-700" />
                    </div>
                  </motion.div>

                  {/* Upload Controls */}
                  <div className="mt-12 w-full max-w-xs space-y-4 relative z-20">
                    <input type="file" id="hero-upload" className="hidden" onChange={handleFileChange} accept="audio/*" disabled={loading} />
                    <label htmlFor="hero-upload" className="flex items-center justify-center w-full px-6 py-3 rounded-full font-mono text-xs tracking-widest cursor-pointer transition-all duration-300 border border-white/10 backdrop-blur-md bg-white/[0.02] text-slate-400 hover:bg-white/10 hover:text-white">
                      <Music2 className="mr-3 h-4 w-4" />
                      {file ? file.name : "SELECT AUDIO FILE"}
                    </label>

                    <button
                      onClick={handleUpload}
                      disabled={!file || loading}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] transition-all duration-300 backdrop-blur-lg border ${!file ? "opacity-30 cursor-not-allowed border-white/5 text-slate-500 bg-transparent" : "bg-cyan-500/10 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"}`}
                    >
                      {loading ? "ANALYZING SPECTRUM..." : "RUN AI ANALYSIS"}
                    </button>
                  </div>
                </div>

                {/* --- RIGHT: SCROLLING SECONDARY INFO --- */}
                <div className="w-full md:w-1/3 justify-end z-20 hidden md:flex h-[100px] relative">
                  
                  {/* Phase 1 Right Text */}
                  <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute right-0 max-w-xs text-right pointer-events-none">
                    <div className="flex justify-end gap-1 mb-4 opacity-50">
                      <div className="w-1 h-4 bg-cyan-500 animate-pulse" />
                      <div className="w-1 h-6 bg-cyan-500 animate-pulse delay-75" />
                      <div className="w-1 h-3 bg-cyan-500 animate-pulse delay-150" />
                    </div>
                    <p className="text-sm font-light text-slate-400 leading-relaxed">
                      Objective acoustic measurement driven by strict DSP mathematics and industry standards.
                    </p>
                  </motion.div>

                  {/* Phase 2 Right Text */}
                  <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute right-0 max-w-xs text-right pointer-events-none">
                    <div className="flex justify-end gap-1 mb-4 opacity-50">
                      <div className="w-1 h-3 bg-purple-500 animate-pulse" />
                      <div className="w-1 h-5 bg-purple-500 animate-pulse delay-75" />
                      <div className="w-1 h-5 bg-purple-500 animate-pulse delay-150" />
                    </div>
                    <p className="text-sm font-light text-slate-400 leading-relaxed">
                      Real-time audio DSP evaluation meets the inferential reasoning of an Expert System.
                    </p>
                  </motion.div>

                  {/* Phase 3 Right Text */}
                  <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute right-0 max-w-xs text-right pointer-events-none">
                    <div className="flex justify-end gap-1 mb-4 opacity-50">
                      <div className="w-1 h-6 bg-emerald-500 animate-pulse" />
                      <div className="w-1 h-6 bg-emerald-500 animate-pulse delay-75" />
                      <div className="w-1 h-6 bg-emerald-500 animate-pulse delay-150" />
                    </div>
                    <p className="text-sm font-light text-slate-400 leading-relaxed">
                      Elevate your track to commercial loudness and stereo-width specifications.
                    </p>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-center backdrop-blur-xl z-50 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-400 text-xs font-mono tracking-wider">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}