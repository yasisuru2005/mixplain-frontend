'use client';

import React, { ChangeEvent } from 'react';
import { Disc, Zap, UploadCloud } from 'lucide-react';

interface HeaderProps {
  file: File | null;
  loading: boolean;
  hasResult: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReset: () => void;
}

export default function Header({ file, loading, hasResult, onFileChange, onUpload, onReset }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-cyan-500/10 rounded-lg">
          <Disc className={`w-8 h-8 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MIXPLAIN <span className="text-cyan-400">PRO</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono">AI ASSISTED MIXING CONSOLE</p>
        </div>
      </div>

      {!hasResult && !loading && (
        <div className="flex gap-4">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={onFileChange} 
            accept="audio/*" 
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer px-4 py-2 bg-[#22262f] hover:bg-[#2a2f3a] text-gray-300 rounded border border-gray-700 flex items-center gap-2 transition text-sm font-mono"
          >
            <UploadCloud size={16} />
            {file ? file.name : "Select Audio File"}
          </label>
          <button 
            onClick={onUpload} 
            disabled={!file}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Zap size={18} /> ANALYZE
          </button>
        </div>
      )}

      {hasResult && (
        <button 
            onClick={onReset}
            className="px-4 py-2 rounded border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition text-xs font-bold uppercase tracking-widest"
        >
            Eject Track
        </button>
      )}
    </header>
  );
}