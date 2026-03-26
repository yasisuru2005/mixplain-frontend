"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AnalysisResult, Issue } from "../types";

const SEVERITY_COLORS: Record<string, string> = {
  severe: "border-l-2 border-red-500/50 bg-red-500/[0.02]",
  moderate: "border-l-2 border-yellow-500/50 bg-yellow-500/[0.02]",
  mild: "border-l-2 border-cyan-500/50 bg-cyan-500/[0.02]",
};

function DiagnosticCard({ issue, severity, startDelay }: { issue: Issue; severity: string; startDelay: number; }) {
  const [displayedText, setDisplayedText] = useState("");
  const [status, setStatus] = useState<"waiting" | "typing" | "done">("waiting");

  const fullText = issue.reason.replace("Just a heads up:", "").replace("Attention needed:", "").trim();
  const typingSpeed = 20;

  useEffect(() => {
    let typeInterval: NodeJS.Timeout;
    let startTimeout: NodeJS.Timeout;

    startTimeout = setTimeout(() => {
      setStatus("typing");
      let charIndex = 0;

      typeInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setStatus("done");
        }
      }, typingSpeed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(typeInterval);
    };
  }, [startDelay, fullText]);

  if (status === "waiting") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden flex flex-col md:flex-row rounded-xl border border-white/5 bg-[#030712]/40 backdrop-blur-md transition hover:bg-white/[0.04] group min-h-[140px] ${SEVERITY_COLORS[severity]}`}
    >
      <div className="p-6 md:w-3/5 border-b md:border-b-0 md:border-r border-white/5 relative">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold px-2 py-1 bg-white/5 border border-white/10 rounded text-cyan-400 font-mono tracking-widest">
            [{issue.cat || "MIX"}]
          </span>
        </div>

        <h4 className="text-slate-200 font-medium text-lg mb-3 tracking-wide">
          {issue.issue}
        </h4>

        <p className="text-slate-400 text-sm leading-relaxed font-mono min-h-[40px]">
          {displayedText}
          {status === "typing" && (
            <span className="inline-block w-2 h-4 bg-cyan-500 ml-1 animate-pulse align-middle"></span>
          )}
        </p>
      </div>

      <div className="p-6 md:w-2/5 bg-[#030712]/50 flex flex-col justify-center relative">
        {status === "done" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest mb-3 font-mono flex items-center gap-2">
              <Zap size={10} /> Recommended Action
            </p>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 group-hover:border-cyan-500/30 transition-colors">
              <p className="text-slate-300 text-sm font-light flex items-start gap-3">
                <ArrowRight size={16} className="mt-0.5 shrink-0 text-cyan-500/50" />
                {issue.fix}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-30 gap-2">
            <Loader2 size={24} className="text-cyan-500 animate-spin" />
            <p className="text-[10px] font-mono tracking-widest text-cyan-500">
              {status === "typing" ? "ANALYZING..." : "WAITING..."}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Diagnostics({ result }: { result: AnalysisResult }) {
  const getAllIssues = () => {
    const all = [
      ...result.issues.mix_balance.map((i) => ({ ...i, cat: "EQ" })),
      ...result.issues.dynamics.map((i) => ({ ...i, cat: "DYN" })),
      ...result.issues.loudness.map((i) => ({ ...i, cat: "LVL" })),
      ...result.issues.stereo.map((i) => ({ ...i, cat: "WID" })),
    ];
    return all.sort((a, b) => {
      const score = (s: string) => s.includes("Severe") ? 3 : s.includes("Moderate") ? 2 : 1;
      return score(b.issue) - score(a.issue);
    });
  };

  const issues = getAllIssues();
  let accumulatedDelay = 0;

  const timeline = issues.map((issue) => {
    const start = accumulatedDelay;
    const textLength = issue.reason.length;
    const duration = textLength * 20 + 800;
    accumulatedDelay += duration;
    return { data: issue, delay: start };
  });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
        <h3 className="text-cyan-500 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
          <Zap size={12} /> Mix Diagnostics & Fixes
        </h3>
      </div>

      {issues.length === 0 ? (
        <div className="p-8 border border-green-500/20 bg-green-500/5 rounded-2xl flex flex-col items-center text-center backdrop-blur-md">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
          <h4 className="text-green-400 font-medium tracking-wide text-lg">All Systems Go</h4>
          <p className="text-slate-400 font-light mt-2">
            Your mix matches the target profile perfectly. Ready for mastering!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((item, idx) => {
            const issue = item.data;
            let severity = "mild";
            if (issue.issue.includes("Severe") || issue.issue.includes("Critical")) severity = "severe";
            else if (issue.issue.includes("Moderate") || issue.issue.includes("Attention")) severity = "moderate";

            return (
              <DiagnosticCard
                key={idx}
                issue={issue}
                severity={severity}
                startDelay={item.delay}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}