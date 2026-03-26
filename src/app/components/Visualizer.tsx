'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import type { AnalysisResult } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BAND_LABELS = ["Sub (20-60)", "Bass (60-250)", "Low Mid (250-500)", "Mid (500-2k)", "High Mid (2k-4k)", "Presence (4k-6k)", "Treble (6k+)"];

export default function Visualizer({ result }: { result: AnalysisResult }) {
  
  const getSpectrumData = (): ChartData<'bar'> | null => {
    const { user_spectrum, ideal_spectrum } = result.visualization;
    
    const mapTo7Bands = (data: any) => [
      data.low,                 
      data.low * 0.8 + data.mid_low * 0.2, 
      data.mid_low,             
      data.mid_low * 0.5 + data.mid_high * 0.5, 
      data.mid_high,            
      data.high * 0.7 + data.mid_high * 0.3, 
      data.high                 
    ];

    return {
      labels: BAND_LABELS,
      datasets: [
        {
          label: 'Your Mix',
          data: mapTo7Bands(user_spectrum),
          backgroundColor: '#22d3ee', // Cyan-400
          hoverBackgroundColor: '#67e8f9',
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          borderRadius: 4,
          order: 1
        },
        {
          label: 'Genre Target',
          data: mapTo7Bands(ideal_spectrum),
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassy white
          hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
          barPercentage: 0.8,
          categoryPercentage: 0.8,
          borderRadius: 4,
          order: 2
        },
      ],
    };
  };

  const data = getSpectrumData();

  return (
    <div className="flex flex-col h-[320px] w-full">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
        <h3 className="text-cyan-500 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
          <BarChart3 size={12} /> 
          Spectral Balance
        </h3>
        <div className="flex gap-4 text-[10px] font-mono tracking-widest">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 bg-white/20 rounded-sm"></span> TARGET
          </span>
          <span className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 bg-cyan-400 rounded-sm shadow-[0_0_5px_#22d3ee]"></span> YOUR MIX
          </span>
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
         {data && (
            <Bar 
              data={data} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { 
                    display: true, 
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } }
                  }
                }
              }}
            />
         )}
      </div>
    </div>
  );
}