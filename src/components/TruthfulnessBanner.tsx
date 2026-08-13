import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const TruthfulnessBanner: React.FC = () => {
  return (
    <div className="bg-[#FDFCFB] border border-[#E5E3DF] p-4 rounded-xs text-[#1A1A1A] flex items-start gap-3.5 shadow-xs my-4">
      <div className="w-1 self-stretch bg-[#1A1A1A] shrink-0" />
      <div className="text-xs space-y-0.5">
        <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
          Truthful Experience Guarantee & ATS Integrity
        </h4>
        <p className="text-[#716F6C] leading-relaxed font-serif italic text-[13px]">
          Our AI strictly respects candidate truth. It will re-structure, format, and align your existing
          experience with target ATS job keywords, but will <strong className="text-[#1A1A1A] not-italic font-sans uppercase text-[10px] tracking-wider">never fabricate</strong> false employers, degrees, certifications, job titles, dates, or inflated metrics.
        </p>
      </div>
    </div>
  );
};

