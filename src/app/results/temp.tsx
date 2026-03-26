// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ChevronLeft } from 'lucide-react';
// import type { AnalysisResult } from '../types';

// import MetricsRack from '../components/MetricRack';
// import Visualizer from '../components/Visualizer';
// import Diagnostics from '../components/Diagnostics';

// export default function ResultsPage() {
//   const router = useRouter();
//   const [result, setResult] = useState<AnalysisResult | null>(null);

//   useEffect(() => {
//     const storedData = sessionStorage.getItem('analysisResult');
//     if (storedData) {
//       setResult(JSON.parse(storedData));
//     } else {
//       router.push('/');
//     }
//   }, [router]);

//   const handleReset = () => {
//     sessionStorage.removeItem('analysisResult');
//     router.push('/');
//   };

//   if (!result) return null; 

//   return (
//     <div className="relative min-h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans p-6 md:p-12">
//       {/* Background glow for continuity */}
//       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

//       <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in duration-700">
        
//         {/* TOP NAVIGATION HUD */}
//         <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
//             <div className="flex items-center gap-6">
//                 <button 
//                   onClick={handleReset}
//                   className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition backdrop-blur-md"
//                 >
//                   <ChevronLeft size={18} />
//                 </button>
//                 <div>
//                   <h1 className="text-lg font-medium tracking-wide text-white">Analysis Report</h1>
//                   <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest mt-1">ID: {result.meta.filename.toUpperCase()}</p>
//                 </div>
//             </div>

//             <button 
//               onClick={handleReset}
//               className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 border border-white/10 rounded-full hover:bg-white/5 hover:border-white/30 transition backdrop-blur-md"
//             >
//               Analyze New Track
//             </button>
//         </div>

//         {/* DASHBOARD GRID */}
//         <div className="grid grid-cols-12 gap-8">
          
//           {/* LEFT COLUMN */}
//           <div className="col-span-12 lg:col-span-3 space-y-8">
//             <MetricsRack result={result} />
            
//             {/* AI Summary Card (Glassmorphic) */}
//             <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden">
//                 <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
//                 <h4 className="text-cyan-500 text-[10px] font-mono tracking-widest uppercase mb-3">AI Tutor Summary</h4>
//                 <p className="text-slate-300 text-sm font-light leading-relaxed">
//                     "{result.meta.advice_summary}"
//                 </p>
//             </div>
//           </div>

//           {/* RIGHT COLUMN */}
//           <div className="col-span-12 lg:col-span-9 space-y-8">
//             <Visualizer result={result} />
//             <Diagnostics result={result} />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }