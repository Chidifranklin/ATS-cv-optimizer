import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wrench,
  ListChecks,
  Building2,
  Tag,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import { JobRequirementAnalysis } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';

interface Step2JobDescriptionProps {
  jobDescription: string;
  setJobDescription: (text: string) => void;
  jdAnalysis: JobRequirementAnalysis | null;
  setJdAnalysis: (analysis: JobRequirementAnalysis | null) => void;
  onBack: () => void;
  onAnalyze: () => void;
  isAnalyzingJD: boolean;
  setIsAnalyzingJD: (loading: boolean) => void;
  onSelectPreset: (presetId: string) => void;
}

export const Step2JobDescription: React.FC<Step2JobDescriptionProps> = ({
  jobDescription,
  setJobDescription,
  jdAnalysis,
  setJdAnalysis,
  onBack,
  onAnalyze,
  isAnalyzingJD,
  setIsAnalyzingJD,
  onSelectPreset,
}) => {
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleExtractRequirements = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzingJD(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract job requirements.');
      }

      setJdAnalysis(data);
    } catch (err: any) {
      setExtractError(err.message || 'Error parsing job description.');
    } finally {
      setIsAnalyzingJD(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E3DF] pb-6 mb-6">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] mb-1">
              Step 02
            </h2>
            <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-[#1A1A1A] font-serif">
              Target Job Specification
            </h1>
            <p className="text-xs text-[#716F6C] font-serif italic mt-1">
              Paste target job posting details. AI extracts hard skills, key tools, and essential qualifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98]">
              Preset Role:
            </span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-[#F1EFE9] text-[#716F6C] hover:bg-[#1A1A1A] hover:text-white border border-[#DEDBD5] transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3 h-3 text-[#1A1A1A]" />
                {preset.title.split('/')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#1A1A1A]" />
              Job Description Text
            </label>
            <span className="text-[11px] font-serif italic text-[#716F6C]">{jobDescription.length} characters</span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setJdAnalysis(null);
            }}
            placeholder="Paste target job description... (include Responsibilities, Required Skills, Education, Tools)"
            rows={10}
            className="w-full rounded-xs border border-[#DEDBD5] p-4 text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors bg-[#FDFCFB]"
          />
        </div>

        {/* Extract Button Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#F1EFE9] p-4 rounded-xs border border-[#DEDBD5]">
          <div className="text-xs text-[#716F6C]">
            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px]">Analysis Note:</span> Extract job requirements to view keyword density benchmarks.
          </div>
          <button
            onClick={handleExtractRequirements}
            disabled={!jobDescription.trim() || isAnalyzingJD}
            className="px-4 py-2 rounded-xs text-[11px] font-bold uppercase tracking-widest bg-[#1A1A1A] hover:bg-[#333] text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzingJD ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Extracting Skills...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5E3DF]" />
                <span>Extract Key Requirements</span>
              </>
            )}
          </button>
        </div>

        {extractError && (
          <div className="mt-4 p-3 rounded-xs bg-[#F1EFE9] border border-red-300 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{extractError}</span>
          </div>
        )}

        {/* Extracted Requirements View */}
        {jdAnalysis && (
          <div className="mt-6 border border-[#DEDBD5] bg-[#F1EFE9]/50 rounded-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DEDBD5] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1A1A1A]" />
                <div>
                  <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A]">
                    {jdAnalysis.jobTitle || 'Target Role'}
                  </h3>
                  {jdAnalysis.companyName && (
                    <p className="text-xs font-bold uppercase tracking-widest text-[#716F6C]">{jdAnalysis.companyName}</p>
                  )}
                </div>
              </div>
              {jdAnalysis.experienceLevel && (
                <span className="bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xs">
                  {jdAnalysis.experienceLevel}
                </span>
              )}
            </div>

            {jdAnalysis.roleSummary && (
              <p className="text-xs text-[#716F6C] font-serif italic leading-relaxed">{jdAnalysis.roleSummary}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Hard Skills */}
              {jdAnalysis.requiredHardSkills?.length > 0 && (
                <div className="bg-white p-4 rounded-xs border border-[#DEDBD5] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Required Hard Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdAnalysis.requiredHardSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F1EFE9] text-[10px] font-bold uppercase tracking-wider text-[#716F6C] border border-[#DEDBD5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Tech */}
              {jdAnalysis.toolsAndTech?.length > 0 && (
                <div className="bg-white p-4 rounded-xs border border-[#DEDBD5] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Tools & Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdAnalysis.toolsAndTech.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F1EFE9] text-[10px] font-bold uppercase tracking-wider text-[#716F6C] border border-[#DEDBD5]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {jdAnalysis.softSkills?.length > 0 && (
                <div className="bg-white p-4 rounded-xs border border-[#DEDBD5] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Soft Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdAnalysis.softSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F1EFE9] text-[10px] font-bold uppercase tracking-wider text-[#716F6C] border border-[#DEDBD5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Responsibilities */}
              {jdAnalysis.keyResponsibilities?.length > 0 && (
                <div className="bg-white p-4 rounded-xs border border-[#DEDBD5] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Key Responsibilities
                  </span>
                  <ul className="list-disc list-inside text-[#716F6C] space-y-1 text-[11px] font-serif">
                    {jdAnalysis.keyResponsibilities.slice(0, 4).map((resp, idx) => (
                      <li key={idx} className="line-clamp-2">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#E5E3DF]">
          <button
            onClick={onBack}
            className="bg-white hover:bg-[#F1EFE9] text-[#1A1A1A] border border-[#DEDBD5] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 rounded-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#716F6C]" />
            <span>Back to Source CV</span>
          </button>

          <button
            onClick={onAnalyze}
            disabled={!jobDescription.trim()}
            className={`px-6 py-3 rounded-xs font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 ${
              jobDescription.trim()
                ? 'bg-[#1A1A1A] hover:bg-[#333] text-white cursor-pointer'
                : 'bg-[#E5E3DF] text-[#A19E98] cursor-not-allowed'
            }`}
          >
            <span>Analyze ATS Match Index</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

