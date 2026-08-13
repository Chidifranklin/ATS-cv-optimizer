import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Edit3,
  Trash2,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets';

interface Step1CVUploadProps {
  cvText: string;
  setCvText: (text: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onNext: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const Step1CVUpload: React.FC<Step1CVUploadProps> = ({
  cvText,
  setCvText,
  fileName,
  setFileName,
  onNext,
  onSelectPreset,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        const res = await fetch('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to extract text from file.');
        }

        setCvText(data.text);
        setIsUploading(false);
      };

      reader.onerror = () => {
        setUploadError('Failed to read file contents.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing file upload.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FDFCFB] rounded-xs border border-[#E5E3DF] p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E3DF] pb-6 mb-6">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] mb-1">
              Step 01
            </h2>
            <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-[#1A1A1A] font-serif">
              Upload CV & Resume Content
            </h1>
            <p className="text-xs text-[#716F6C] font-serif italic mt-1">
              Upload PDF, Word document (.docx), text file, or paste raw content directly.
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98]">
              Sample Presets:
            </span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-[#F1EFE9] text-[#716F6C] hover:bg-[#1A1A1A] hover:text-white border border-[#DEDBD5] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#1A1A1A]" />
                {preset.title.split('/')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xs p-8 sm:p-12 text-center cursor-pointer transition-colors ${
            isUploading
              ? 'border-[#1A1A1A] bg-[#F1EFE9]'
              : cvText
              ? 'border-[#1A1A1A] bg-[#FDFCFB]'
              : 'border-[#DEDBD5] bg-[#F1EFE9]/40 hover:bg-[#F1EFE9] hover:border-[#1A1A1A]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xs bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            {isUploading ? (
              <div className="space-y-1">
                <p className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">
                  Extracting Content...
                </p>
                <p className="text-[11px] text-[#716F6C] font-serif italic">
                  Parsing contact details, work history, and skills hierarchy
                </p>
              </div>
            ) : fileName ? (
              <div className="space-y-1">
                <p className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1A1A1A]" />
                  Document Loaded: {fileName}
                </p>
                <p className="text-[11px] text-[#716F6C] font-serif italic">
                  {cvText.length} characters extracted. Click or drag to replace.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-[#1A1A1A] text-xs sm:text-sm">
                  Drag and drop your resume file here, or{' '}
                  <span className="font-bold uppercase tracking-wider underline">browse local files</span>
                </p>
                <p className="text-[11px] text-[#A19E98] mt-1 font-serif italic">
                  Supports PDF, DOCX, DOC, or TXT up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 rounded-xs bg-[#F1EFE9] border border-red-300 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Text Area Input or Edit */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A19E98] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1A1A1A]" />
              CV Plain Text Source
            </label>
            {cvText && (
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsEditingText(!isEditingText)}
                  className="text-[#716F6C] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingText ? 'Done Editing' : 'Edit Text'}
                </button>
                <span className="text-[#DEDBD5]">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setCvText('');
                    setFileName('');
                  }}
                  className="text-red-700 hover:text-red-900 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>

          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Or paste your plain text resume here... (Contact Info, Work History, Core Competencies, Education)"
            rows={10}
            className="w-full rounded-xs border border-[#DEDBD5] p-4 text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors bg-[#FDFCFB]"
          />
        </div>

        {/* Navigation Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            disabled={!cvText.trim()}
            className={`px-6 py-3 rounded-xs font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 ${
              cvText.trim()
                ? 'bg-[#1A1A1A] hover:bg-[#333] text-white cursor-pointer'
                : 'bg-[#E5E3DF] text-[#A19E98] cursor-not-allowed'
            }`}
          >
            <span>Proceed to Job Requirements</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

