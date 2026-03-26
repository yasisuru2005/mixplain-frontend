// app/types.ts

export interface SpectrumData {
    low: number;
    mid_low: number;
    mid_high: number;
    high: number;
  }
  
  export interface Issue {
    [x: string]: string;
    issue: string;
    fix: string;
    reason: string;
  }
  
  export interface AnalysisResult {
    meta: {
      genre: string;
      confidence: number;
      filename: string;
      advice_summary: string;
    };
    metrics: {
      lufs: number;
      stereo_width: number;
      dynamic_range: number;
      mud_ratio: number;
    };
    visualization: {
      user_spectrum: SpectrumData;
      ideal_spectrum: SpectrumData;
      confidence_curve: number[];
    };
    issues: {
      mix_balance: Issue[];
      dynamics: Issue[];
      stereo: Issue[];
      loudness: Issue[];
    };
  }