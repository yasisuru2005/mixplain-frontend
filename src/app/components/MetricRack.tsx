// 'use client';

// import React from 'react';
// import { Activity, Volume2 } from 'lucide-react';
// import type { AnalysisResult } from '../types';

// export default function MetricsRack({ result }: { result: AnalysisResult }) {
//   return (
//     <div className="space-y-4">
//       {/* Genre Badge */}
//       <div className="plugin-panel p-5 text-center relative overflow-hidden group">
//         <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
//         <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Detected Genre</p>
//         <h2 className="text-3xl font-black text-white tracking-tighter neon-text">
//           {result.meta.genre}
//         </h2>
//         <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-cyan-400 font-mono">
//           <Activity size={12} /> {result.meta.confidence}% MATCH
//         </div>
//       </div>

//       {/* Metrics Rack */}
//       <div className="plugin-panel p-5 space-y-6">
//         <div className="flex justify-between items-end border-b border-gray-800 pb-2">
//           <h3 className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2">
//             <Volume2 size={14} /> Global Meters
//           </h3>
//         </div>

//         {/* LUFS METER */}
//         <div>
//            <div className="flex justify-between text-xs mb-1">
//              <span className="text-gray-500">Loudness (LUFS)</span>
//              <span className="text-cyan-400 font-mono">{result.metrics.lufs}</span>
//            </div>
//            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
//              <div 
//                className={`h-full ${result.metrics.lufs > -8 ? 'bg-red-500' : 'bg-green-500'}`} 
//                style={{ width: `${Math.min(100, (result.metrics.lufs + 30) * 2.5)}%` }}
//              ></div>
//            </div>
//         </div>

//         {/* DYNAMICS METER */}
//         <div>
//            <div className="flex justify-between text-xs mb-1">
//              <span className="text-gray-500">Punch / Dynamics</span>
//              <span className="text-cyan-400 font-mono">{result.metrics.dynamic_range} dB</span>
//            </div>
//            <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
//               <div className="absolute left-[30%] right-[30%] h-full bg-white/5"></div>
//               <div 
//                 className="h-full bg-yellow-400" 
//                 style={{ width: `${Math.min(100, result.metrics.dynamic_range * 8)}%` }}
//               ></div>
//            </div>
//         </div>

//         {/* WIDTH METER */}
//         <div>
//            <div className="flex justify-between text-xs mb-1">
//              <span className="text-gray-500">Stereo Width</span>
//              <span className="text-cyan-400 font-mono">{result.metrics.stereo_width}</span>
//            </div>
//            <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex justify-center">
//              <div 
//                className="h-full bg-purple-500" 
//                style={{ width: `${Math.min(100, result.metrics.stereo_width * 100)}%` }}
//              ></div>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React from 'react';
import { Activity, Volume2 } from 'lucide-react';
import type { AnalysisResult } from '../types';

export default function MetricsRack({ result }: { result: AnalysisResult }) {
  return (
    <div className="flex flex-col h-full">
      {/* Genre Badge (Top Section) */}
      <div className="p-6 text-center relative overflow-hidden group border-b border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Detected Genre</p>
        <h2 className="text-3xl font-medium text-white tracking-tight mb-3">
          {result.meta.genre}
        </h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] text-cyan-400 font-mono tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Activity size={12} /> {result.meta.confidence}% MATCH
        </div>
      </div>

      {/* Metrics Rack (Bottom Section) */}
      <div className="p-6 space-y-8 flex-1">
        <div className="flex justify-between items-end border-b border-white/5 pb-3">
          <h3 className="text-cyan-500 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
            <Volume2 size={12} /> Global Meters
          </h3>
        </div>

        {/* LUFS METER */}
        <div>
           <div className="flex justify-between text-[10px] font-mono tracking-wider mb-2">
             <span className="text-slate-400">LOUDNESS (LUFS)</span>
             <span className="text-cyan-400">{result.metrics.lufs}</span>
           </div>
           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div 
               className={`h-full shadow-[0_0_10px_currentColor] ${result.metrics.lufs > -8 ? 'bg-red-500 text-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-cyan-500'}`} 
               style={{ width: `${Math.min(100, (result.metrics.lufs + 30) * 2.5)}%` }}
             ></div>
           </div>
        </div>

        {/* DYNAMICS METER */}
        <div>
           <div className="flex justify-between text-[10px] font-mono tracking-wider mb-2">
             <span className="text-slate-400">DYNAMICS (PUNCH)</span>
             <span className="text-cyan-400">{result.metrics.dynamic_range} dB</span>
           </div>
           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute left-[30%] right-[30%] h-full bg-white/10"></div>
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                style={{ width: `${Math.min(100, result.metrics.dynamic_range * 8)}%` }}
              ></div>
           </div>
        </div>

        {/* WIDTH METER */}
        <div>
           <div className="flex justify-between text-[10px] font-mono tracking-wider mb-2">
             <span className="text-slate-400">STEREO WIDTH</span>
             <span className="text-cyan-400">{result.metrics.stereo_width}</span>
           </div>
           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex justify-center">
             <div 
               className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
               style={{ width: `${Math.min(100, result.metrics.stereo_width * 100)}%` }}
             ></div>
           </div>
        </div>
      </div>
    </div>
  );
}