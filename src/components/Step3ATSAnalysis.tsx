import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ATSAnalysisResult } from '../types';
import { TruthfulnessBanner } from './TruthfulnessBanner';

interface Step3ATSAnalysisProps {
  atsResult: ATSAnalysisResult | null;
  onBack: () => void;
  onProceedToOptimize: () => void;
}

export const Step3ATSAnalysis: React.FC<Step3ATSAnalysisProps> = ({
  atsResult,
  onBack,
  onProceedToOptimize,
}) => {
  const [activeKeywordTab, setActiveKeywordTab] = useState<'matching' | 'missing' | 'weak'>(
    'missing'
  );
  const [showTruthDetails, setShowTruthDetails] = useState(false);

  if (!atsResult) {
    return (
      <div className="bg-[#FDFCFB] rounded-xs p-12 text-center border border-[#E5E3DF]">
        <FileSearch className="w-12 h-12 text-[#A19E98] mx-auto mb-3" />
        <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A]">
          No Analysis Generated Yet
        </h3>
        <p className="text-[#716F6C] text-xs mt-1 font-serif italic">
          Please return to Step 2 and run the ATS Match analysis.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-5 py-2.5 rounded-xs bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-widest"
        >
          Back to Step 2
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-[#E5E3DF] pb-8">
          {/* Main Score Display in Editorial Style */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="flex items-end gap-1 font-serif">
              <span className="text-7xl font-light leading-none italic text-[#1A1A1A]">
                {atsResult.overallScore}
              </span>
              <span className="text-2xl font-light mb-1 text-[#716F6C]">%</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#F1EFE9] text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] border border-[#DEDBD5]">
                  {atsResult.overallScore >= 80
                    ? 'Optimal Compatibility'
                    : atsResult.overallScore >= 60
                    ? 'Moderate Match — Optimization Advised'
                    : 'Low Index — High Parsing Risk'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-light uppercase tracking-[0.15em] text-[#1A1A1A] font-serif">
                ATS Compatibility Index
              </h2>
              <p className="text-[#716F6C] text-xs font-serif italic max-w-lg leading-relaxed">
                Evaluated against exact keyword density, hard skill taxonomy, role context, and ATS scanner structural parsing standards.
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="shrink-0">
            <button
              onClick={onProceedToOptimize}
              className="px-6 py-3.5 rounded-xs bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#E5E3DF]" />
              <span>Optimize Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#F1EFE9]/40 p-4 rounded-xs border border-[#DEDBD5]">
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] mb-1">
              Hard Skills Match
            </div>
            <div className="text-2xl font-serif font-light text-[#1A1A1A]">{atsResult.hardSkillsScore}%</div>
            <div className="w-full bg-[#E5E3DF] h-1 rounded-xs mt-2 overflow-hidden">
              <div
                className="bg-[#1A1A1A] h-full"
                style={{ width: `${atsResult.hardSkillsScore}%` }}
              />
            </div>
          </div>

          <div className="bg-[#F1EFE9]/40 p-4 rounded-xs border border-[#DEDBD5]">
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] mb-1">
              Soft Skills Context
            </div>
            <div className="text-2xl font-serif font-light text-[#1A1A1A]">{atsResult.softSkillsScore}%</div>
            <div className="w-full bg-[#E5E3DF] h-1 rounded-xs mt-2 overflow-hidden">
              <div
                className="bg-[#1A1A1A] h-full"
                style={{ width: `${atsResult.softSkillsScore}%` }}
              />
            </div>
          </div>

          <div className="bg-[#F1EFE9]/40 p-4 rounded-xs border border-[#DEDBD5]">
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] mb-1">
              Experience Alignment
            </div>
            <div className="text-2xl font-serif font-light text-[#1A1A1A]">{atsResult.experienceScore}%</div>
            <div className="w-full bg-[#E5E3DF] h-1 rounded-xs mt-2 overflow-hidden">
              <div
                className="bg-[#1A1A1A] h-full"
                style={{ width: `${atsResult.experienceScore}%` }}
              />
            </div>
          </div>

          <div className="bg-[#F1EFE9]/40 p-4 rounded-xs border border-[#DEDBD5]">
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] mb-1">
              ATS Format Score
            </div>
            <div className="text-2xl font-serif font-light text-[#1A1A1A]">{atsResult.formattingScore}%</div>
            <div className="w-full bg-[#E5E3DF] h-1 rounded-xs mt-2 overflow-hidden">
              <div
                className="bg-[#1A1A1A] h-full"
                style={{ width: `${atsResult.formattingScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Truthfulness Banner */}
      <TruthfulnessBanner />

      {/* Keyword Gap Breakdown Card */}
      <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E3DF] pb-4">
          <div>
            <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A]">
              Keyword & Skill Gap Analysis
            </h3>
            <p className="text-xs text-[#716F6C] font-serif italic">
              Detailed terminology alignment compared against job posting requirements.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F1EFE9] p-1 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveKeywordTab('missing')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                activeKeywordTab === 'missing'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              Missing ({atsResult.missingKeywords.length})
            </button>
            <button
              onClick={() => setActiveKeywordTab('matching')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                activeKeywordTab === 'matching'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              Matching ({atsResult.matchingKeywords.length})
            </button>
            <button
              onClick={() => setActiveKeywordTab('weak')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                activeKeywordTab === 'weak'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              Weak/Partial ({atsResult.weakKeywords.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Missing Keywords */}
        {activeKeywordTab === 'missing' && (
          <div className="space-y-3">
            {atsResult.missingKeywords.length === 0 ? (
              <p className="text-xs text-[#1A1A1A] bg-[#F1EFE9] p-4 rounded-xs border border-[#DEDBD5] font-serif italic">
                No critical missing keywords detected in current document.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {atsResult.missingKeywords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9]/30 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-700" />
                        {item.keyword}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs border ${
                          item.importance === 'critical'
                            ? 'bg-red-100 text-red-900 border-red-200'
                            : 'bg-[#F1EFE9] text-[#716F6C] border-[#DEDBD5]'
                        }`}
                      >
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-[#716F6C] text-[11px] font-serif italic leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Matching Keywords */}
        {activeKeywordTab === 'matching' && (
          <div className="space-y-3">
            {atsResult.matchingKeywords.length === 0 ? (
              <p className="text-xs text-[#716F6C] italic font-serif p-4 bg-[#F1EFE9] rounded-xs">
                No matching keywords identified.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {atsResult.matchingKeywords.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9] text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span className="font-bold text-[#1A1A1A]">{item.keyword}</span>
                    <span className="text-[10px] text-[#716F6C] uppercase font-bold tracking-wider ml-1">
                      ({item.category})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Weak Keywords */}
        {activeKeywordTab === 'weak' && (
          <div className="space-y-3">
            {atsResult.weakKeywords.length === 0 ? (
              <p className="text-xs text-[#716F6C] italic font-serif p-4 bg-[#F1EFE9] rounded-xs">
                No weak keyword matches found.
              </p>
            ) : (
              <div className="space-y-2">
                {atsResult.weakKeywords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9]/40 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                      <span className="font-bold text-[#1A1A1A]">
                        Job Term: &quot;{item.keywordInJD}&quot;
                      </span>
                      <span className="text-[#A19E98]">vs</span>
                      <span className="font-serif italic text-[#716F6C]">
                        CV Term: &quot;{item.keywordInCV}&quot;
                      </span>
                    </div>
                    <p className="text-[#716F6C] text-[11px] font-serif italic pl-5">
                      <strong className="not-italic uppercase tracking-wider text-[9px] text-[#1A1A1A]">
                        Recommendation:
                      </strong>{' '}
                      {item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formatting Red Flags & Structure Analysis */}
      {atsResult.formattingIssues?.length > 0 && (
        <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#1A1A1A]" />
            ATS Structural & Formatting Warnings
          </h3>
          <div className="space-y-2.5">
            {atsResult.formattingIssues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9]/30 flex items-start gap-3 text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1A1A1A]">{issue.message}</p>
                  <p className="text-[#716F6C] text-[11px] font-serif italic">
                    <strong className="not-italic uppercase tracking-wider text-[9px] text-[#1A1A1A]">
                      Action Step:
                    </strong>{' '}
                    {issue.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Card */}
      <div className="bg-[#1A1A1A] text-white rounded-xs p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-light uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E5E3DF]" />
            Truthful AI Optimization Strategy
          </h3>
          <button
            onClick={() => setShowTruthDetails(!showTruthDetails)}
            className="text-[10px] font-bold uppercase tracking-widest text-[#E5E3DF] hover:text-white flex items-center gap-1"
          >
            {showTruthDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showTruthDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        <p className="text-xs text-[#E5E3DF] font-serif italic leading-relaxed">
          {atsResult.gapAnalysis?.truthfulOptimizationAdvice}
        </p>

        {showTruthDetails && atsResult.gapAnalysis?.transferableSkillsFound?.length > 0 && (
          <div className="bg-[#333] p-4 rounded-xs border border-[#444] space-y-2 text-xs">
            <span className="font-bold text-white text-[10px] uppercase tracking-widest block">
              Transferable Competencies Extracted:
            </span>
            <ul className="list-disc list-inside text-[#E5E3DF] space-y-1 font-serif">
              {atsResult.gapAnalysis.transferableSkillsFound.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E3DF]">
        <button
          onClick={onBack}
          className="bg-white hover:bg-[#F1EFE9] text-[#1A1A1A] border border-[#DEDBD5] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 rounded-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#716F6C]" />
          <span>Back to Specification</span>
        </button>

        <button
          onClick={onProceedToOptimize}
          className="bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-3 rounded-xs font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <span>Generate Optimized CV</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

