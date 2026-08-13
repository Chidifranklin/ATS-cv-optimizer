import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfParseModule from "pdf-parse";
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON payload limit to handle base64 uploaded files
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Extract Text from Uploaded File (PDF, DOCX, TXT)
app.post("/api/extract-text", async (req, res) => {
  try {
    const { fileBase64, fileName, fileType } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Missing file base64 data" });
    }

    const fileBuffer = Buffer.from(fileBase64.replace(/^data:.*?;base64,/, ""), "base64");
    let extractedText = "";

    const ext = fileName ? path.extname(fileName).toLowerCase() : "";

    if (ext === ".pdf" || fileType === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || "";
    } else if (
      ext === ".docx" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxResult.value || "";
    } else {
      // Fallback plain text / UTF-8
      extractedText = fileBuffer.toString("utf-8");
    }

    // Clean up excessive empty whitespace
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!extractedText) {
      return res.status(422).json({ error: "Could not extract legible text from file." });
    }

    return res.json({ text: extractedText, charCount: extractedText.length });
  } catch (error: any) {
    console.error("Error extracting file text:", error);
    return res.status(500).json({ error: error.message || "Failed to extract text from file" });
  }
});

// 2. Extract Job Requirements from Job Description
app.post("/api/analyze-jd", async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: "Job description text is too short or missing." });
    }

    const ai = getAiClient();

    const prompt = `Analyze the following job description and extract structured requirements into JSON.
Job Description:
"""
${jobDescription}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert HR Talent Acquisition Specialist and ATS Analyst. Extract exact required skills, tools, duties, and qualifications from job descriptions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING },
            companyName: { type: Type.STRING },
            roleSummary: { type: Type.STRING },
            experienceLevel: { type: Type.STRING },
            requiredHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            preferredHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyResponsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            toolsAndTech: { type: Type.ARRAY, items: { type: Type.STRING } },
            educationRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            certificationsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "jobTitle",
            "roleSummary",
            "requiredHardSkills",
            "softSkills",
            "keyResponsibilities",
            "toolsAndTech",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing JD:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze Job Description" });
  }
});

// 3. ATS Analysis & Gap Analysis
app.post("/api/analyze-ats", async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;

    if (!cvText || !jobDescription) {
      return res.status(400).json({ error: "Both CV text and Job Description are required." });
    }

    const ai = getAiClient();

    const prompt = `Evaluate this Candidate CV against the target Job Description using modern Enterprise Applicant Tracking System (ATS) scoring criteria.

Candidate CV Text:
"""
${cvText}
"""

Target Job Description:
"""
${jobDescription}
"""

Perform a detailed match calculation:
1. Overall ATS match score (0 to 100).
2. Sub-scores for Hard Skills, Soft Skills, Experience/Seniority fit, and Formatting/Structure.
3. Matching Keywords: exact or strong semantic matches found in the CV.
4. Missing Keywords: critical skills or tools mentioned in the JD but missing from CV.
5. Weak / Partial Matches: skills present in CV that could be emphasized or rephrased better for ATS indexers.
6. Formatting Issues: ATS red flags (missing summary, lack of bullet points, non-quantified achievements, contact info issues).
7. Honest Gap Analysis: identify critical missing items vs transferable experience. Emphasize preserved candidate truth.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an ATS Parser and Recruitment Intelligence AI. Assess candidates objectively, strictly identifying matching keywords, missing requirements, and structural flaws. Do not lie or inflate capabilities.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            hardSkillsScore: { type: Type.INTEGER },
            softSkillsScore: { type: Type.INTEGER },
            experienceScore: { type: Type.INTEGER },
            formattingScore: { type: Type.INTEGER },

            matchingKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  category: { type: Type.STRING },
                  foundInCV: { type: Type.STRING },
                },
                required: ["keyword", "category", "foundInCV"],
              },
            },

            missingKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  category: { type: Type.STRING },
                  importance: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["keyword", "category", "importance", "reason"],
              },
            },

            weakKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keywordInJD: { type: Type.STRING },
                  keywordInCV: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["keywordInJD", "keywordInCV", "suggestion"],
              },
            },

            formattingIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  message: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ["type", "message", "recommendation"],
              },
            },

            gapAnalysis: {
              type: Type.OBJECT,
              properties: {
                criticalGapsSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
                transferableSkillsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                truthfulOptimizationAdvice: { type: Type.STRING },
              },
              required: [
                "criticalGapsSummary",
                "transferableSkillsFound",
                "truthfulOptimizationAdvice",
              ],
            },
          },
          required: [
            "overallScore",
            "hardSkillsScore",
            "softSkillsScore",
            "experienceScore",
            "formattingScore",
            "matchingKeywords",
            "missingKeywords",
            "weakKeywords",
            "formattingIssues",
            "gapAnalysis",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in ATS analysis:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze ATS compatibility" });
  }
});

// 4. AI CV Optimization Endpoint
app.post("/api/optimize-cv", async (req, res) => {
  try {
    const { cvText, jobDescription, userAddedNotes } = req.body;

    if (!cvText || !jobDescription) {
      return res.status(400).json({ error: "Both CV text and Job Description are required." });
    }

    const ai = getAiClient();

    const prompt = `You are a world-class Executive Resume Writer and ATS Optimization Specialist.
Your job is to parse the original CV and re-structure & rewrite it specifically to maximize ATS matching for the target Job Description.

CRITICAL MANDATE - TRUTHFULNESS & HONESTY GUARDRAIL:
1. You MUST NEVER fabricate employment history, company names, job titles, education, degrees, dates, certifications, tools, or metrics that the user does not possess.
2. Preserve all real past employers, roles, dates, and core responsibilities from the user's CV.
3. Highlight existing transferable experience and re-word bullet points using action verbs and relevant terminology from the Job Description where truthfully applicable.
4. If the Job Description requires a tool/skill that is absent from the original CV and user notes, DO NOT invent experience for it. Instead, focus on highlighting existing skills, or place missing skills under a clear section or user notes.
${userAddedNotes ? `\nUser's Additional Truthful Experience Notes:\n"""\n${userAddedNotes}\n"""\n` : ""}

Original Candidate CV Text:
"""
${cvText}
"""

Target Job Description:
"""
${jobDescription}
"""

Output a complete, beautifully structured ATS-friendly CV JSON. Include contact info, tailored summary, bulleted work experience, organized skill categories, education, projects, and certifications.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You rewrite resumes for maximum ATS relevance while strictly preserving candidate truth. Output valid structured JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedCV: {
              type: Type.OBJECT,
              properties: {
                contactInfo: {
                  type: Type.OBJECT,
                  properties: {
                    fullName: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    location: { type: Type.STRING },
                    linkedin: { type: Type.STRING },
                    github: { type: Type.STRING },
                    website: { type: Type.STRING },
                  },
                  required: ["fullName", "email", "phone", "location"],
                },
                professionalSummary: { type: Type.STRING },
                workExperience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      jobTitle: { type: Type.STRING },
                      company: { type: Type.STRING },
                      location: { type: Type.STRING },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING },
                      bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["id", "jobTitle", "company", "startDate", "endDate", "bullets"],
                  },
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      fieldOfStudy: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      location: { type: Type.STRING },
                      graduationYear: { type: Type.STRING },
                      honors: { type: Type.STRING },
                    },
                    required: ["id", "degree", "institution", "graduationYear"],
                  },
                },
                skills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["category", "skills"],
                  },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                      link: { type: Type.STRING },
                    },
                    required: ["id", "title", "description"],
                  },
                },
                certifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      issuer: { type: Type.STRING },
                      year: { type: Type.STRING },
                    },
                    required: ["id", "name", "issuer"],
                  },
                },
              },
              required: [
                "contactInfo",
                "professionalSummary",
                "workExperience",
                "education",
                "skills",
              ],
            },
            matchScoreBefore: { type: Type.INTEGER },
            matchScoreAfter: { type: Type.INTEGER },
            optimizationsApplied: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  changeDescription: { type: Type.STRING },
                  truthPreservedNote: { type: Type.STRING },
                },
                required: ["section", "changeDescription", "truthPreservedNote"],
              },
            },
            userActionNeededNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "optimizedCV",
            "matchScoreBefore",
            "matchScoreAfter",
            "optimizationsApplied",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error optimizing CV:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize CV" });
  }
});

// 5. Rewrite specific bullet point or section
app.post("/api/rewrite-bullet", async (req, res) => {
  try {
    const { originalText, instruction, jobContext } = req.body;

    if (!originalText || !instruction) {
      return res.status(400).json({ error: "Missing text or instruction" });
    }

    const ai = getAiClient();

    const prompt = `Rewrite and enhance this resume text based on the instruction while strictly keeping facts truthful.
Original Text: "${originalText}"
Instruction: "${instruction}"
${jobContext ? `Target Job Context: "${jobContext}"` : ""}

Provide 3 variations of the rewritten bullet point or section.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            explanation: { type: Type.STRING },
          },
          required: ["variations"],
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error rewriting bullet:", error);
    return res.status(500).json({ error: error.message || "Failed to rewrite bullet point" });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ATS CV Optimizer Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
