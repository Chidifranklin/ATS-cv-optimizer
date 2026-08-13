import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Columns,
  Eye,
  Sliders,
  ShieldCheck,
  Wand2,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { StructuredCV, OptimizationResponse } from '../types';
import { CVPreview } from './CVPreview';
import { TruthfulnessBanner } from './TruthfulnessBanner';

interface Step4OptimizerProps {
  optimizationData: OptimizationResponse;
  originalCvText: string;
  onBack: () => void;
  onRegenerate: (notes?: string) => void;
  isRegenerating: boolean;
}

export const Step4Optimizer: React.FC<Step4OptimizerProps> = ({
  optimizationData,
  originalCvText,
  onBack,
  onRegenerate,
  isRegenerating,
}) => {
  const [cv, setCv] = useState<StructuredCV>(optimizationData.optimizedCV);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'comparison'>('preview');
  const [userNotes, setUserNotes] = useState('');

  // AI Bullet Rewriter Modal State
  const [bulletRewriteModal, setBulletRewriteModal] = useState<{
    isOpen: boolean;
    expId: string;
    bulletIndex: number;
    text: string;
  }>({
    isOpen: false,
    expId: '',
    bulletIndex: -1,
    text: '',
  });

  const [rewritePrompt, setRewritePrompt] = useState('Add quantified metrics and stronger action verbs');
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);
  const [bulletVariations, setBulletVariations] = useState<string[]>([]);

  // Update Contact Info
  const handleContactChange = (field: string, value: string) => {
    setCv({
      ...cv,
      contactInfo: { ...cv.contactInfo, [field]: value },
    });
  };

  // Update Work Experience Bullet
  const handleBulletChange = (expId: string, index: number, value: string) => {
    const updatedExp = cv.workExperience.map((exp) => {
      if (exp.id === expId) {
        const bullets = [...exp.bullets];
        bullets[index] = value;
        return { ...exp, bullets };
      }
      return exp;
    });
    setCv({ ...cv, workExperience: updatedExp });
  };

  // Add Bullet Point
  const handleAddBullet = (expId: string) => {
    const updatedExp = cv.workExperience.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, bullets: [...exp.bullets, 'New achievement or key duty...'] };
      }
      return exp;
    });
    setCv({ ...cv, workExperience: updatedExp });
  };

  // Remove Bullet Point
  const handleRemoveBullet = (expId: string, index: number) => {
    const updatedExp = cv.workExperience.map((exp) => {
      if (exp.id === expId) {
        const bullets = exp.bullets.filter((_, i) => i !== index);
        return { ...exp, bullets };
      }
      return exp;
    });
    setCv({ ...cv, workExperience: updatedExp });
  };

  // AI Single Bullet Rewrite Handler
  const handleOpenRewriteModal = (expId: string, index: number, text: string) => {
    setBulletRewriteModal({ isOpen: true, expId, bulletIndex: index, text });
    setBulletVariations([]);
  };

  const handleExecuteRewrite = async () => {
    if (!bulletRewriteModal.text) return;
    setIsRewritingBullet(true);

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: bulletRewriteModal.text,
          instruction: rewritePrompt,
        }),
      });

      const data = await res.json();
      if (data.variations) {
        setBulletVariations(data.variations);
      }
    } catch (err) {
      console.error('Error rewriting bullet:', err);
    } finally {
      setIsRewritingBullet(false);
    }
  };

  const applyVariation = (newBullet: string) => {
    handleBulletChange(bulletRewriteModal.expId, bulletRewriteModal.bulletIndex, newBullet);
    setBulletRewriteModal({ isOpen: false, expId: '', bulletIndex: -1, text: '' });
  };

  return (
    <div className="space-y-6">
      {/* Optimization Score Bar */}
      <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#E5E3DF] pb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#F1EFE9] border border-[#DEDBD5] p-3 rounded-xs font-serif">
              <span className="text-2xl font-light text-[#A19E98] line-through italic">
                {optimizationData.matchScoreBefore}%
              </span>
              <span className="text-3xl font-light text-[#1A1A1A] italic">
                {optimizationData.matchScoreAfter}%
              </span>
              <span className="text-[10px] font-bold text-[#1A1A1A] bg-white border border-[#DEDBD5] px-2.5 py-1 uppercase tracking-widest font-sans">
                +
                {Math.max(
                  0,
                  optimizationData.matchScoreAfter - optimizationData.matchScoreBefore
                )}
                % ATS Boost
              </span>
            </div>

            <div>
              <h2 className="text-xl font-serif font-light uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
                Optimized Editorial Resume Ready
              </h2>
              <p className="text-xs text-[#716F6C] font-serif italic">
                Restructured using high-impact PAR bullet points and exact JD keyword alignment while preserving truthful history.
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-[#F1EFE9] p-1 rounded-xs text-[10px] font-bold uppercase tracking-widest">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview & Export</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Inline Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#716F6C] hover:text-[#1A1A1A]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>

        {/* Optimizations Applied Log */}
        {optimizationData.optimizationsApplied?.length > 0 && (
          <div className="mt-4 pt-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] block mb-2">
              Key Optimizations Applied:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {optimizationData.optimizationsApplied.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xs bg-[#F1EFE9]/50 border border-[#DEDBD5] text-xs space-y-0.5"
                >
                  <span className="font-bold text-[#1A1A1A] text-[10px] uppercase tracking-wider block">
                    {opt.section}
                  </span>
                  <p className="text-[#716F6C] text-[11px] font-serif italic">{opt.changeDescription}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TruthfulnessBanner />

      {/* TAB 1: Live CV Preview */}
      {activeTab === 'preview' && <CVPreview cv={cv} />}

      {/* TAB 2: Interactive Editor */}
      {activeTab === 'editor' && (
        <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 sm:p-8 space-y-8 shadow-xs">
          <div className="border-b border-[#E5E3DF] pb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1A1A1A]" />
              Interactive Resume Editor
            </h3>
            <span className="text-[11px] text-[#716F6C] font-serif italic">
              Edits automatically sync with Preview & Export
            </span>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98]">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[#716F6C] font-bold text-[10px] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={cv.contactInfo.fullName}
                  onChange={(e) => handleContactChange('fullName', e.target.value)}
                  className="w-full p-2.5 rounded-xs border border-[#DEDBD5] font-semibold text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-[#716F6C] font-bold text-[10px] uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={cv.contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-xs border border-[#DEDBD5] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-[#716F6C] font-bold text-[10px] uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={cv.contactInfo.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded-xs border border-[#DEDBD5] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-[#716F6C] font-bold text-[10px] uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={cv.contactInfo.location}
                  onChange={(e) => handleContactChange('location', e.target.value)}
                  className="w-full p-2.5 rounded-xs border border-[#DEDBD5] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-[#716F6C] font-bold text-[10px] uppercase tracking-wider mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={cv.contactInfo.linkedin || ''}
                  onChange={(e) => handleContactChange('linkedin', e.target.value)}
                  className="w-full p-2.5 rounded-xs border border-[#DEDBD5] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98]">
              Professional Summary
            </h4>
            <textarea
              value={cv.professionalSummary}
              onChange={(e) => setCv({ ...cv, professionalSummary: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xs border border-[#DEDBD5] text-xs font-serif italic text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Work Experience */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98]">
              Work Experience
            </h4>
            {cv.workExperience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9]/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">
                  <span>
                    {exp.jobTitle} — {exp.company}
                  </span>
                  <span className="text-[11px] text-[#716F6C] font-serif italic font-normal">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>

                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <textarea
                        value={bullet}
                        onChange={(e) => handleBulletChange(exp.id, bIdx, e.target.value)}
                        rows={2}
                        className="flex-1 p-2.5 rounded-xs border border-[#DEDBD5] text-xs font-serif text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenRewriteModal(exp.id, bIdx, bullet)}
                        className="px-3 py-2 rounded-xs bg-[#1A1A1A] hover:bg-[#333] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                        title="Rewrite bullet point with AI"
                      >
                        <Wand2 className="w-3 h-3 text-[#E5E3DF]" />
                        <span className="hidden sm:inline">AI Polish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(exp.id, bIdx)}
                        className="p-2 text-[#716F6C] hover:text-red-700 rounded-xs shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddBullet(exp.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate with Notes Box */}
          <div className="bg-[#1A1A1A] text-white p-6 rounded-xs space-y-3">
            <h4 className="font-serif text-base font-light uppercase tracking-wider text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#E5E3DF]" />
              Add Missing Truthful Details & Re-optimize
            </h4>
            <p className="text-xs text-[#E5E3DF] font-serif italic">
              Want to include additional actual experience or specific projects you forgot earlier? Type them below and re-run AI optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g., 'I also used GraphQL at Apex Systems and led 3 sprint retrospectives'"
                className="flex-1 p-2.5 rounded-xs bg-[#333] border border-[#444] text-xs text-white placeholder-[#A19E98] focus:outline-none focus:border-white"
              />
              <button
                onClick={() => onRegenerate(userNotes)}
                disabled={isRegenerating}
                className="px-5 py-2.5 rounded-xs bg-white text-[#1A1A1A] hover:bg-[#F1EFE9] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 transition-colors"
              >
                {isRegenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
                )}
                <span>Re-Optimize</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Side by Side Comparison */}
      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FDFCFB] p-6 rounded-xs border border-[#E5E3DF] space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A19E98]" />
              Original CV Source
            </h3>
            <pre className="p-4 bg-[#F1EFE9]/40 rounded-xs text-xs font-mono text-[#1A1A1A] whitespace-pre-wrap max-h-[700px] overflow-y-auto border border-[#DEDBD5]">
              {originalCvText}
            </pre>
          </div>

          <div className="bg-[#FDFCFB] p-6 rounded-xs border border-[#E5E3DF] space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
              Optimized Editorial Resume
            </h3>
            <div className="scale-90 origin-top transform">
              <CVPreview cv={cv} />
            </div>
          </div>
        </div>
      )}

      {/* AI Bullet Rewrite Drawer Modal */}
      {bulletRewriteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCFB] rounded-xs max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E5E3DF]">
            <div className="flex items-center justify-between border-b border-[#E5E3DF] pb-3">
              <h3 className="font-serif text-lg font-light uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#1A1A1A]" />
                AI Bullet Enhancer
              </h3>
              <button
                onClick={() => setBulletRewriteModal({ isOpen: false, expId: '', bulletIndex: -1, text: '' })}
                className="text-[#716F6C] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] block">
                Original Statement:
              </label>
              <p className="p-3 bg-[#F1EFE9] rounded-xs border border-[#DEDBD5] text-[#1A1A1A] font-serif italic">
                &quot;{bulletRewriteModal.text}&quot;
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] block">
                Optimization Directive:
              </label>
              <input
                type="text"
                value={rewritePrompt}
                onChange={(e) => setRewritePrompt(e.target.value)}
                className="w-full p-2.5 rounded-xs border border-[#DEDBD5] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <button
              onClick={handleExecuteRewrite}
              disabled={isRewritingBullet}
              className="w-full py-2.5 rounded-xs bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isRewritingBullet ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#E5E3DF]" />
              )}
              <span>Generate Enhancements</span>
            </button>

            {/* Variations Output */}
            {bulletVariations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E5E3DF] text-xs">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A19E98] block">
                  Select Revision:
                </span>
                {bulletVariations.map((v, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyVariation(v)}
                    className="p-3 rounded-xs border border-[#DEDBD5] bg-[#F1EFE9]/60 hover:bg-[#1A1A1A] hover:text-white cursor-pointer text-[#1A1A1A] transition-colors flex items-start gap-2 group font-serif italic"
                  >
                    <Check className="w-4 h-4 text-[#1A1A1A] group-hover:text-white mt-0.5 shrink-0" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E3DF]">
        <button
          onClick={onBack}
          className="bg-white hover:bg-[#F1EFE9] text-[#1A1A1A] border border-[#DEDBD5] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 rounded-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#716F6C]" />
          <span>Back to Match Analysis</span>
        </button>
      </div>
    </div>
  );
};

