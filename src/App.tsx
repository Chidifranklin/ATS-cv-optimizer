import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Step1CVUpload } from './components/Step1CVUpload';
import { Step2JobDescription } from './components/Step2JobDescription';
import { Step3ATSAnalysis } from './components/Step3ATSAnalysis';
import { Step4Optimizer } from './components/Step4Optimizer';
import { SAMPLE_PRESETS } from './data/samplePresets';
import { JobRequirementAnalysis, ATSAnalysisResult, OptimizationResponse } from './types';
import { Loader2, Sparkles, AlertCircle, FileCheck2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data States
  const [cvText, setCvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  const [jdAnalysis, setJdAnalysis] = useState<JobRequirementAnalysis | null>(null);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationResponse | null>(null);

  // Loading & Error States
  const [isAnalyzingJD, setIsAnalyzingJD] = useState<boolean>(false);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load default preset on initial boot so user sees a working experience immediately
  useEffect(() => {
    const defaultPreset = SAMPLE_PRESETS[0];
    setCvText(defaultPreset.sampleCV);
    setFileName(`${defaultPreset.title.replace(/\s+/g, '_')}_Resume.txt`);
    setJobDescription(defaultPreset.sampleJD);
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setCvText(preset.sampleCV);
    setFileName(`${preset.title.replace(/\s+/g, '_')}_Resume.txt`);
    setJobDescription(preset.sampleJD);

    setJdAnalysis(null);
    setAtsResult(null);
    setOptimizationData(null);
    setGlobalError(null);
    setCurrentStep(1);
  };

  // Reset Handler
  const handleReset = () => {
    setCvText('');
    setFileName('');
    setJobDescription('');
    setJdAnalysis(null);
    setAtsResult(null);
    setOptimizationData(null);
    setGlobalError(null);
    setCurrentStep(1);
  };

  // Run ATS Match Analysis
  const handleRunATSAnalysis = async () => {
    if (!cvText.trim() || !jobDescription.trim()) return;

    setIsAnalyzingATS(true);
    setGlobalError(null);

    try {
      const res = await fetch('/api/analyze-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete ATS analysis.');
      }

      setAtsResult(data);
      setCurrentStep(3);
    } catch (err: any) {
      setGlobalError(err.message || 'Error running ATS calculation.');
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  // Run CV Optimization
  const handleRunOptimization = async (userNotes?: string) => {
    if (!cvText.trim() || !jobDescription.trim()) return;

    setIsOptimizing(true);
    setGlobalError(null);

    try {
      const res = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobDescription,
          userAddedNotes: userNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate optimized CV.');
      }

      setOptimizationData(data);
      setCurrentStep(4);
    } catch (err: any) {
      setGlobalError(err.message || 'Error generating optimized resume.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex flex-col antialiased">
      {/* Navigation Header */}
      <Navbar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        hasAnalyzed={!!atsResult}
        hasOptimized={!!optimizationData}
      />

      {/* Global Error Alert */}
      {globalError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-xs bg-[#FDFCFB] border border-red-900/30 text-red-950 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-800 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-[10px] font-bold uppercase tracking-wider text-red-900 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: CV Upload */}
        {currentStep === 1 && (
          <Step1CVUpload
            cvText={cvText}
            setCvText={setCvText}
            fileName={fileName}
            setFileName={setFileName}
            onNext={() => setCurrentStep(2)}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Step 2: Job Description Input */}
        {currentStep === 2 && (
          <>
            {isAnalyzingATS ? (
              <div className="bg-[#FDFCFB] rounded-xs p-16 text-center border border-[#E5E3DF] shadow-xs space-y-4">
                <Loader2 className="w-10 h-10 text-[#1A1A1A] animate-spin mx-auto" />
                <h3 className="text-xl font-serif font-light uppercase tracking-wider text-[#1A1A1A]">
                  Calculating ATS Match Index...
                </h3>
                <p className="text-xs text-[#716F6C] font-serif italic max-w-md mx-auto">
                  Cross-indexing CV keywords, hard skill density, action verbs, qualifications, and ATS formatting standards against target job posting.
                </p>
              </div>
            ) : (
              <Step2JobDescription
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                jdAnalysis={jdAnalysis}
                setJdAnalysis={setJdAnalysis}
                onBack={() => setCurrentStep(1)}
                onAnalyze={handleRunATSAnalysis}
                isAnalyzingJD={isAnalyzingJD}
                setIsAnalyzingJD={setIsAnalyzingJD}
                onSelectPreset={handleSelectPreset}
              />
            )}
          </>
        )}

        {/* Step 3: ATS Match Analysis */}
        {currentStep === 3 && (
          <>
            {isOptimizing ? (
              <div className="bg-[#FDFCFB] rounded-xs p-16 text-center border border-[#E5E3DF] shadow-xs space-y-4">
                <Sparkles className="w-10 h-10 text-[#1A1A1A] animate-bounce mx-auto" />
                <h3 className="text-xl font-serif font-light uppercase tracking-wider text-[#1A1A1A]">
                  AI Crafting Truthful ATS-Friendly Resume...
                </h3>
                <p className="text-xs text-[#716F6C] font-serif italic max-w-md mx-auto">
                  Re-structuring experience into PAR/STAR bullet points, aligning keyword density, and organizing skill categories while strictly preserving your real history.
                </p>
              </div>
            ) : (
              <Step3ATSAnalysis
                atsResult={atsResult}
                onBack={() => setCurrentStep(2)}
                onProceedToOptimize={() => handleRunOptimization()}
              />
            )}
          </>
        )}

        {/* Step 4: Optimize & Export */}
        {currentStep === 4 && optimizationData && (
          <Step4Optimizer
            optimizationData={optimizationData}
            originalCvText={cvText}
            onBack={() => setCurrentStep(3)}
            onRegenerate={(notes) => handleRunOptimization(notes)}
            isRegenerating={isOptimizing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E3DF] bg-[#FDFCFB] py-6 text-center text-xs text-[#716F6C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#1A1A1A] font-serif text-sm">
            <FileCheck2 className="w-4 h-4 text-[#1A1A1A]" />
            <span className="font-light uppercase tracking-wider">ATS CV Optimizer</span>
            <span className="text-[#A19E98] text-xs font-sans">• Truthful Editorial Resume Architecture</span>
          </div>
          <p className="text-[#A19E98] font-serif italic text-xs">
            Designed for software engineers, data analysts, product leads, and professional job seekers.
          </p>
        </div>
      </footer>
    </div>
  );
}

