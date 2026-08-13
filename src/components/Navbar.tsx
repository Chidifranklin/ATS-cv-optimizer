import React from 'react';
import {
  FileCheck2,
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets';

interface NavbarProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  hasAnalyzed: boolean;
  hasOptimized: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  setCurrentStep,
  onSelectPreset,
  onReset,
  hasAnalyzed,
  hasOptimized,
}) => {
  const steps = [
    { num: 1, label: '1. CV Upload' },
    { num: 2, label: '2. Job Requirements' },
    { num: 3, label: '3. ATS Match Analysis' },
    { num: 4, label: '4. Optimize & Export' },
  ];

  return (
    <header id="app-navbar" className="bg-white border-b border-[#E5E3DF] text-[#1A1A1A] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 min-h-[64px] gap-3">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentStep(1)}>
            <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center text-white font-bold italic font-serif text-base shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">
                  ATS CV Optimizer
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase bg-[#F1EFE9] text-[#716F6C] border border-[#DEDBD5] px-2 py-0.5 rounded-sm">
                  Editorial Edition
                </span>
              </div>
              <p className="text-[11px] text-[#716F6C] font-serif italic hidden sm:block">
                Truthful Resume & Applicant Tracking Precision
              </p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="hidden lg:flex items-center space-x-2 bg-[#F1EFE9] p-1.5 rounded border border-[#DEDBD5]">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#716F6C] font-bold px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1A1A1A]" />
              Presets:
            </span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#DEDBD5] rounded-xs transition-colors"
                title={`Load sample ${preset.title}`}
              >
                {preset.title.split('/')[0].trim()}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onReset}
              className="bg-white hover:bg-[#F1EFE9] text-[#1A1A1A] border border-[#DEDBD5] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 rounded-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#716F6C]" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="border-t border-[#E5E3DF] py-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[620px] text-[11px] font-bold uppercase tracking-wider">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.num;
              const isCompleted =
                (step.num === 1 && currentStep > 1) ||
                (step.num === 2 && currentStep > 2) ||
                (step.num === 3 && hasAnalyzed && currentStep >= 3) ||
                (step.num === 4 && hasOptimized);

              const isAccessible =
                step.num === 1 ||
                (step.num === 2 && currentStep >= 1) ||
                (step.num === 3 && hasAnalyzed) ||
                (step.num === 4 && hasOptimized);

              return (
                <React.Fragment key={step.num}>
                  <button
                    onClick={() => isAccessible && setCurrentStep(step.num)}
                    disabled={!isAccessible}
                    className={`flex items-center space-x-2 px-3 py-1.5 transition-all rounded-xs ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white font-bold'
                        : isCompleted
                        ? 'text-[#1A1A1A] hover:bg-[#F1EFE9]'
                        : 'text-[#A19E98] cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-[#1A1A1A]'
                          : isCompleted
                          ? 'bg-[#E5E3DF] text-[#1A1A1A]'
                          : 'bg-[#F1EFE9] text-[#A19E98]'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 max-w-[40px] h-[1px] bg-[#E5E3DF] mx-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

