export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string; // e.g. "2021 - Present" or "Jan 2021 - Dec 2023"
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  location?: string;
  graduationYear: string;
  honors?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

export interface SkillCategory {
  category: string; // e.g., "Technical Skills", "Tools & Frameworks", "Soft Skills"
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface StructuredCV {
  contactInfo: ContactInfo;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface JobRequirementAnalysis {
  jobTitle: string;
  companyName?: string;
  roleSummary: string;
  experienceLevel: string;
  requiredHardSkills: string[];
  preferredHardSkills: string[];
  softSkills: string[];
  keyResponsibilities: string[];
  toolsAndTech: string[];
  educationRequirements: string[];
  certificationsNeeded: string[];
}

export interface ATSAnalysisResult {
  overallScore: number; // 0 - 100
  hardSkillsScore: number; // 0 - 100
  softSkillsScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  formattingScore: number; // 0 - 100

  matchingKeywords: {
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'qualification';
    foundInCV: string; // sentence or phrase where found
  }[];

  missingKeywords: {
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'qualification';
    importance: 'critical' | 'important' | 'nice_to_have';
    reason: string;
  }[];

  weakKeywords: {
    keywordInJD: string;
    keywordInCV: string;
    suggestion: string;
  }[];

  formattingIssues: {
    type: 'warning' | 'error' | 'tip';
    message: string;
    recommendation: string;
  }[];

  gapAnalysis: {
    criticalGapsSummary: string[];
    transferableSkillsFound: string[];
    truthfulOptimizationAdvice: string;
  };
}

export interface OptimizationResponse {
  optimizedCV: StructuredCV;
  matchScoreBefore: number;
  matchScoreAfter: number;
  optimizationsApplied: {
    section: string;
    changeDescription: string;
    truthPreservedNote: string;
  }[];
  userActionNeededNotes?: string[];
}

export type PresetRole = {
  id: string;
  title: string;
  category: string;
  sampleCV: string;
  sampleJD: string;
};
