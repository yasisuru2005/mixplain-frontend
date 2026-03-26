"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Zap,
  Activity,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Maximize,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import dynamic from "next/dynamic";
import type { AnalysisResult } from "../types";

const MasterBackground = dynamic(() => import("../components/Background3D"), {
  ssr: false,
});

const AnimatedNumber = ({
  value,
  suffix = "",
  decimals = 1,
}: {
  value: string | number;
  suffix?: string;
  decimals?: number;
}) => {
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;
  const count = useMotionValue(0);
  const display = useTransform(
    count,
    (latest) => latest.toFixed(decimals) + suffix,
  );

  useEffect(() => {
    const controls = animate(count, numValue, {
      duration: 1.5,
      ease: "easeOut",
      delay: 1.0,
    });
    return controls.stop;
  }, [numValue, count]);

  return <motion.span>{display}</motion.span>;
};

// HELPER: Centralized config so both the Node and the Modal can use the exact same styles/icons
const getTypeConfig = (type: string) => {
  switch (type) {
    case "loudness":
      return {
        icon: AlertTriangle, title: "Loudness Penalty",
        styles: { text: "text-amber-500/80", textHover: "group-hover:text-amber-400", line: "bg-amber-900/50", lineHover: "group-hover:bg-amber-500/70", borderHover: "group-hover:border-amber-500/50", cardIcon: "bg-amber-500/10 text-amber-400", cardText: "text-amber-400", cardFix: "bg-amber-500/5 border-amber-500/20 text-amber-400" },
      };
    case "dynamics":
      return {
        icon: Activity, title: "Dynamics Anomaly",
        styles: { text: "text-purple-500/80", textHover: "group-hover:text-purple-400", line: "bg-purple-900/50", lineHover: "group-hover:bg-purple-500/70", borderHover: "group-hover:border-purple-500/50", cardIcon: "bg-purple-500/10 text-purple-400", cardText: "text-purple-400", cardFix: "bg-purple-500/5 border-purple-500/20 text-purple-400" },
      };
    case "stereo":
      return {
        icon: Maximize, title: "Stereo Field",
        styles: { text: "text-emerald-500/80", textHover: "group-hover:text-emerald-400", line: "bg-emerald-900/50", lineHover: "group-hover:bg-emerald-500/70", borderHover: "group-hover:border-emerald-500/50", cardIcon: "bg-emerald-500/10 text-emerald-400", cardText: "text-emerald-400", cardFix: "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" },
      };
    case "mix_balance":
    default:
      return {
        icon: Volume2, title: "Spectral Balance",
        styles: { text: "text-cyan-500/80", textHover: "group-hover:text-cyan-400", line: "bg-cyan-900/50", lineHover: "group-hover:bg-cyan-500/70", borderHover: "group-hover:border-cyan-500/50", cardIcon: "bg-cyan-500/10 text-cyan-400", cardText: "text-cyan-400", cardFix: "bg-cyan-500/5 border-cyan-500/20 text-cyan-400" },
      };
  }
};

// 1. UPDATED NODE: Now acts purely as a clickable trigger
const DiagnosticNode = ({ issue, side, delay, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const { icon: Icon, styles } = getTypeConfig(issue.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      // FIX: Added onClick and cursor-pointer
      onClick={onClick}
      className={`relative flex items-center gap-3 ${side === "left" ? "justify-end" : "justify-start"} w-full group z-30 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {side === "left" && (
        <>
          <span className={`whitespace-nowrap text-xs font-mono tracking-widest ${styles.text} ${styles.textHover} transition-colors text-right drop-shadow-[0_0_8px_rgba(0,0,0,0)]`}>
            [ {issue.issue.toUpperCase()} ]
          </span>
          <div className={`shrink-0 p-2 bg-[#030712]/50 border border-white/5 rounded-full ${styles.text} ${styles.textHover} ${styles.borderHover} transition-all backdrop-blur-md shadow-lg`}>
            <Icon size={14} />
          </div>
          <div className={`shrink-0 w-12 h-px ${styles.line} ${styles.lineHover} transition-colors`} />
        </>
      )}

      {side === "right" && (
        <>
          <div className={`shrink-0 w-12 h-px ${styles.line} ${styles.lineHover} transition-colors`} />
          <div className={`shrink-0 p-2 bg-[#030712]/50 border border-white/5 rounded-full ${styles.text} ${styles.textHover} ${styles.borderHover} transition-all backdrop-blur-md shadow-lg`}>
            <Icon size={14} />
          </div>
          <span className={`whitespace-nowrap text-xs font-mono tracking-widest ${styles.text} ${styles.textHover} transition-colors text-left drop-shadow-[0_0_8px_rgba(0,0,0,0)]`}>
            [ {issue.issue.toUpperCase()} ]
          </span>
        </>
      )}
    </motion.div>
  );
};

// 2. NEW MODAL COMPONENT: Handles the background blur and drop-in animation
const IssueModal = ({ issue, onClose }: { issue: any, onClose: () => void }) => {
  const [displayedFix, setDisplayedFix] = useState("");
  const { icon: Icon, title, styles } = getTypeConfig(issue.type);

  // Typewriter effect runs when modal mounts
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedFix(issue.fix.slice(0, i + 1));
      i++;
      if (i >= issue.fix.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [issue.fix]);

  return (
    // FIX: Full screen backdrop that captures clicks to close
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020611]/[0.05] backdrop-blur-sm p-4"
    >
      {/* FIX: The Card itself. Stops propagation so clicking inside doesn't close it */}
      <motion.div
        // Animates from y: -300 (top center/red circle) down to y: 0 (center screen/red box)
        initial={{ opacity: 0, scale: 0.5, y: -300, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.5, y: -300, filter: "blur(10px)" }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-[420px] max-w-full bg-[#030712]/95 border border-white/10 backdrop-blur-3xl rounded-2xl p-6 shadow-[0_40px_100px_rgba(0,0,0,0.9)] text-left`}
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className={`p-2 rounded-lg ${styles.cardIcon}`}>
            <Icon size={14} />
          </div>
          <h3 className="text-xs font-mono tracking-widest text-slate-300 uppercase">
            {title}
          </h3>
        </div>

        <p className={`${styles.cardText} font-medium mb-3 text-lg leading-snug`}>
          {issue.issue}
        </p>

        <p className="text-slate-300 text-sm font-light mb-5 leading-relaxed">
          {issue.reason}
        </p>
        
        <div className={`border rounded-xl p-4 ${styles.cardFix}`}>
          <p className={`text-[10px] font-mono uppercase tracking-widest flex items-start gap-2 ${styles.cardText}`}>
            <Zap size={14} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              FIX: {displayedFix}
              <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5 align-middle" />
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GenreDecoder = ({ genre }: { genre: string }) => {
  const [text, setText] = useState("SCANNING...");
  const [phase, setPhase] = useState<"identifying" | "decoding" | "done">("identifying");

  useEffect(() => {
    const decodeTimeout = setTimeout(() => {
      setPhase("decoding");
      let iterations = 0;
      const targetText = genre.toUpperCase();
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      const maxIterations = 30;

      const interval = setInterval(() => {
        setText(targetText.split("").map((char, index) => {
            if (char === " ") return " ";
            if (index < Math.floor(iterations / (maxIterations / targetText.length))) return targetText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join(""));
        iterations++;
        if (iterations > maxIterations) {
          clearInterval(interval);
          setText(targetText);
          setPhase("done");
        }
      }, 50);
    }, 1800);
    return () => clearTimeout(decodeTimeout);
  }, [genre]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.50, ease: "easeOut" }}
      className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
    >
      <span className="block text-[10px] text-white/70 font-mono tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
        GENRE
      </span>
      <span
        className={`block text-2xl font-bold tracking-tight transition-all duration-300 ${
          phase === "identifying" ? "text-white/50 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            : phase === "decoding" ? "text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            : "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
        }`}
      >
        {text}
      </span>
    </motion.div>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisResult");
    if (storedData) setResult(JSON.parse(storedData));
    else router.push("/");
  }, [router]);

  if (!result) return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4">
        <Activity className="text-cyan-500 animate-pulse w-8 h-8" />
      </div>
  );

  if (!result.issues || !result.metrics) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-6 z-50 relative">
        <AlertTriangle className="text-red-500 w-12 h-12 animate-pulse" />
        <div className="text-center">
          <h2 className="text-xl font-mono text-red-400 tracking-widest mb-2">DATA CORRUPTION DETECTED</h2>
          <p className="text-slate-400 text-sm font-light max-w-md">The AI engine returned a malformed spectral analysis. The file may be empty, corrupted, or unsupported.</p>
        </div>
        <button 
          onClick={() => { sessionStorage.removeItem("analysisResult"); router.push("/"); }}
          className="px-6 py-2 border border-red-500/30 text-red-400 rounded-full font-mono text-xs tracking-widest hover:bg-red-500/10 transition-colors"
        >
          EJECT & RETURN
        </button>
      </div>
    );
  }

  // const allIssues = [
  //   ...(result.issues.loudness || []).map((i: any) => ({ ...i, type: "loudness" })),
  //   ...(result.issues.dynamics || []).map((i: any) => ({ ...i, type: "dynamics" })),
  //   ...(result.issues.stereo || []).map((i: any) => ({ ...i, type: "stereo" })),
  //   ...(result.issues.mix_balance || []).map((i: any) => ({ ...i, type: "mix_balance" })),
  // ];

  const allIssues = [
    ...(result.issues?.loudness || []).map((i: any) => ({ ...i, type: "loudness" })),
    ...(result.issues?.dynamics || []).map((i: any) => ({ ...i, type: "dynamics" })),
    ...(result.issues?.stereo || []).map((i: any) => ({ ...i, type: "stereo" })),
    ...(result.issues?.mix_balance || []).map((i: any) => ({ ...i, type: "mix_balance" })),
  ];

  const midPoint = Math.ceil(allIssues.length / 2);
  const leftSideIssues = allIssues.slice(0, midPoint);
  const rightSideIssues = allIssues.slice(midPoint);

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* FIX: Render the Issue Modal overlay if an issue is selected */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
        )}
      </AnimatePresence>

      <MasterBackground mode="results" result={result} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center pointer-events-none"
      >
        <button
          onClick={() => { sessionStorage.removeItem("analysisResult"); router.push("/"); }}
          className="pointer-events-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 hover:text-cyan-400 transition-colors bg-[#030712]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
        >
          <ChevronLeft size={14} /> EJECT TRACK
        </button>
        <div className="text-[10px] font-mono tracking-[0.2em] text-cyan-500/50 bg-[#030712]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          HASH: {result.meta.filename.toUpperCase()}
        </div>
      </motion.div>

      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center px-8">
        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-4 items-center h-full pb-20">
          
          <div className="flex flex-col justify-center gap-10 pointer-events-auto h-[500px]">
            {leftSideIssues.map((issue, i) => (
              <DiagnosticNode
                key={`left-${i}`}
                side="left"
                issue={issue}
                delay={2.0 + i * 0.1}
                onClick={() => setSelectedIssue(issue)} // Trigger Modal
              />
            ))}
          </div>

          <div className="h-[700px] pointer-events-none flex flex-col items-center justify-start pt-20">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 1 }}>
              <GenreDecoder genre={result.meta.genre} />
            </motion.div>
          </div>

          <div className="flex flex-col justify-center gap-10 pointer-events-auto h-[500px]">
            {rightSideIssues.map((issue, i) => (
              <DiagnosticNode
                key={`right-${i}`}
                side="right"
                issue={issue}
                delay={2.2 + i * 0.1}
                onClick={() => setSelectedIssue(issue)} // Trigger Modal
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40 pointer-events-none flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-5 w-full pointer-events-auto"
        >
          <div className="flex items-center justify-center gap-4 w-auto">
            <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[150px]">
              <span className="block text-[10px] text-cyan-400 font-mono tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">LUFS</span>
              <span className="text-2xl font-bold text-white tracking-tight"><AnimatedNumber value={result.metrics.lufs} decimals={1} /></span>
            </div>
            <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[150px]">
              <span className="block text-[10px] text-amber-400 font-mono tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">DYNAMICS</span>
              <span className="text-2xl font-bold text-white tracking-tight"><AnimatedNumber value={result.metrics.dynamic_range} suffix=" dB" decimals={1} /></span>
            </div>
            <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[150px]">
              <span className="block text-[10px] text-purple-400 font-mono tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">STEREO</span>
              <span className="text-2xl font-bold text-white tracking-tight"><AnimatedNumber value={result.metrics.stereo_width} decimals={2} /></span>
            </div>
          </div>

          <div className="w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl px-8 py-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <p className="text-sm font-light text-slate-200 italic tracking-wide leading-relaxed">"{result.meta.advice_summary}"</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}