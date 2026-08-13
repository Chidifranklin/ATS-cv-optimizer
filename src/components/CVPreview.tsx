import React, { useState } from 'react';
import {
  Download,
  Printer,
  Check,
  Palette,
  Copy,
} from 'lucide-react';
import { StructuredCV } from '../types';
import { generateDocxBlob } from '../utils/docxExport';
import { exportElementToPdf } from '../utils/pdfExport';

interface CVPreviewProps {
  cv: StructuredCV;
  editable?: boolean;
  onUpdateCV?: (updated: StructuredCV) => void;
}

export type TemplateStyle = 'modern' | 'tech' | 'classic' | 'minimal';

export const CVPreview: React.FC<CVPreviewProps> = ({ cv }) => {
  const [template, setTemplate] = useState<TemplateStyle>('modern');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);

  // Helper to format as plain text
  const formatAsPlainText = (): string => {
    let txt = `${cv.contactInfo.fullName.toUpperCase()}\n`;
    txt += `${cv.contactInfo.location} | ${cv.contactInfo.phone} | ${cv.contactInfo.email}\n`;
    if (cv.contactInfo.linkedin) txt += `LinkedIn: ${cv.contactInfo.linkedin}\n`;
    txt += `\n=========================================\nPROFESSIONAL SUMMARY\n=========================================\n`;
    txt += `${cv.professionalSummary}\n\n`;

    if (cv.workExperience?.length) {
      txt += `=========================================\nWORK EXPERIENCE\n=========================================\n`;
      cv.workExperience.forEach((exp) => {
        txt += `${exp.jobTitle.toUpperCase()} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
        exp.bullets.forEach((b) => (txt += `  • ${b}\n`));
        txt += `\n`;
      });
    }

    if (cv.skills?.length) {
      txt += `=========================================\nSKILLS\n=========================================\n`;
      cv.skills.forEach((s) => {
        txt += `${s.category}: ${s.skills.join(', ')}\n`;
      });
      txt += `\n`;
    }

    if (cv.education?.length) {
      txt += `=========================================\nEDUCATION\n=========================================\n`;
      cv.education.forEach((edu) => {
        txt += `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''} - ${edu.institution} (${edu.graduationYear})\n`;
      });
      txt += `\n`;
    }

    return txt;
  };

  // Export handlers
  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      const blob = await generateDocxBlob(cv);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.contactInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      await exportElementToPdf(
        'cv-preview-document',
        `${cv.contactInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`
      );
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyTxt = () => {
    navigator.clipboard.writeText(formatAsPlainText());
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Template Switcher & Export Buttons */}
      <div className="bg-[#FDFCFB] p-4 rounded-xs border border-[#E5E3DF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Template Options */}
        <div className="flex items-center space-x-1 bg-[#F1EFE9] p-1 rounded-xs text-[10px] font-bold uppercase tracking-wider">
          <span className="text-[#716F6C] px-2 flex items-center gap-1 font-bold">
            <Palette className="w-3.5 h-3.5 text-[#1A1A1A]" />
            Layout:
          </span>
          <button
            onClick={() => setTemplate('modern')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              template === 'modern' ? 'bg-[#1A1A1A] text-white' : 'text-[#716F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Editorial Standard
          </button>
          <button
            onClick={() => setTemplate('tech')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              template === 'tech' ? 'bg-[#1A1A1A] text-white' : 'text-[#716F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Technical Monospace
          </button>
          <button
            onClick={() => setTemplate('classic')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              template === 'classic' ? 'bg-[#1A1A1A] text-white' : 'text-[#716F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Classic Serif
          </button>
          <button
            onClick={() => setTemplate('minimal')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              template === 'minimal' ? 'bg-[#1A1A1A] text-white' : 'text-[#716F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Minimal Line
          </button>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="px-4 py-2 rounded-xs bg-[#1A1A1A] hover:bg-[#333] text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#E5E3DF]" />
            <span>Download DOCX</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-4 py-2 rounded-xs bg-white hover:bg-[#F1EFE9] text-[#1A1A1A] border border-[#DEDBD5] text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#716F6C]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleCopyTxt}
            className="px-3 py-2 rounded-xs bg-[#F1EFE9] hover:bg-[#E5E3DF] text-[#1A1A1A] text-[11px] font-bold uppercase tracking-wider transition-colors border border-[#DEDBD5] flex items-center gap-1.5"
          >
            {copiedTxt ? <Check className="w-3.5 h-3.5 text-[#1A1A1A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTxt ? 'Copied' : 'Copy TXT'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xs bg-[#F1EFE9] hover:bg-[#E5E3DF] text-[#1A1A1A] border border-[#DEDBD5] transition-colors"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rendered Resume Document Stage */}
      <div className="bg-[#F1EFE9] p-4 sm:p-8 rounded-xs overflow-x-auto border border-[#DEDBD5]">
        <div
          id="cv-preview-document"
          className={`bg-white text-[#1A1A1A] mx-auto shadow-2xl p-8 sm:p-12 transition-all max-w-[800px] min-h-[1050px] border border-[#DEDBD5] ${
            template === 'classic'
              ? 'font-serif'
              : template === 'tech'
              ? 'font-mono text-xs'
              : template === 'minimal'
              ? 'font-sans'
              : 'font-sans'
          }`}
        >
          {/* Header */}
          <div
            className={`pb-4 mb-6 border-b ${
              template === 'classic'
                ? 'border-[#1A1A1A] text-center'
                : template === 'tech'
                ? 'border-[#1A1A1A]'
                : template === 'minimal'
                ? 'border-[#E5E3DF]'
                : 'border-[#1A1A1A]'
            }`}
          >
            <h1
              className={`font-serif tracking-wide text-[#1A1A1A] font-light ${
                template === 'classic'
                  ? 'text-3xl uppercase tracking-widest'
                  : template === 'minimal'
                  ? 'text-2xl uppercase'
                  : 'text-3xl uppercase tracking-wider'
              }`}
            >
              {cv.contactInfo.fullName}
            </h1>

            <div
              className={`text-xs text-[#716F6C] mt-2 flex flex-wrap items-center gap-2 font-serif italic ${
                template === 'classic' ? 'justify-center' : 'justify-start'
              }`}
            >
              <span>{cv.contactInfo.location}</span>
              <span>•</span>
              <span>{cv.contactInfo.phone}</span>
              <span>•</span>
              <span className="font-bold not-italic font-sans text-[#1A1A1A]">{cv.contactInfo.email}</span>
              {cv.contactInfo.linkedin && (
                <>
                  <span>•</span>
                  <span>{cv.contactInfo.linkedin}</span>
                </>
              )}
              {cv.contactInfo.github && (
                <>
                  <span>•</span>
                  <span>{cv.contactInfo.github}</span>
                </>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {cv.professionalSummary && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Professional Summary
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed font-serif">
                {cv.professionalSummary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {cv.workExperience?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Work Experience
              </h2>

              <div className="space-y-4">
                {cv.workExperience.map((exp) => (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between text-xs font-bold text-[#1A1A1A]">
                      <div>
                        <span className="text-sm font-bold uppercase tracking-wider">{exp.jobTitle}</span>
                        <span className="font-normal font-serif italic text-[#716F6C] ml-1.5">— {exp.company}</span>
                        {exp.location && (
                          <span className="font-normal text-[#A19E98] text-[11px] ml-1">
                            ({exp.location})
                          </span>
                        )}
                      </div>
                      <span className="text-[#716F6C] font-serif italic text-[11px]">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>

                    <ul className="list-disc list-outside ml-4 text-xs text-[#4A4A4A] space-y-1 leading-relaxed font-serif">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cv.skills?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Technical & Core Skills
              </h2>

              <div className="space-y-1.5 text-xs">
                {cv.skills.map((skCategory, idx) => (
                  <div key={idx} className="flex flex-wrap gap-1">
                    <span className="font-bold text-[#1A1A1A] uppercase text-[10px] tracking-wider">{skCategory.category}:</span>
                    <span className="text-[#4A4A4A] font-serif">{skCategory.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Education
              </h2>

              <div className="space-y-2 text-xs">
                {cv.education.map((edu) => (
                  <div key={edu.id} className="flex flex-wrap items-baseline justify-between">
                    <div>
                      <span className="font-bold text-[#1A1A1A] uppercase tracking-wider">{edu.degree}</span>
                      {edu.fieldOfStudy && (
                        <span className="font-bold text-[#1A1A1A]"> in {edu.fieldOfStudy}</span>
                      )}
                      <span className="text-[#716F6C] font-serif italic"> — {edu.institution}</span>
                      {edu.honors && (
                        <span className="italic text-[#716F6C] ml-2">({edu.honors})</span>
                      )}
                    </div>
                    <span className="text-[#716F6C] text-[11px] font-serif italic">{edu.graduationYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Key Projects
              </h2>

              <div className="space-y-2 text-xs">
                {cv.projects.map((proj) => (
                  <div key={proj.id} className="space-y-0.5">
                    <div className="font-bold text-[#1A1A1A] flex items-center justify-between">
                      <span className="uppercase tracking-wider">{proj.title}</span>
                      {proj.technologies && (
                        <span className="text-[10px] text-[#716F6C] font-serif italic font-normal">
                          {proj.technologies.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-[#4A4A4A] leading-relaxed font-serif">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cv.certifications && cv.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A] pb-1 text-[#1A1A1A]">
                Certifications
              </h2>

              <div className="space-y-1 text-xs">
                {cv.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between text-[#1A1A1A]">
                    <div>
                      <span className="font-bold uppercase tracking-wider">{cert.name}</span>
                      <span className="text-[#716F6C] font-serif italic"> — {cert.issuer}</span>
                    </div>
                    {cert.year && <span className="text-[#716F6C] text-[11px] font-serif italic">{cert.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

