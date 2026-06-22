import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "No text provided to generate assets." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          target_academic_level: { 
            type: Type.STRING,
            description: "Determined level based on document complexity (e.g., Elementary, High School, University)"
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique card identifier" },
                front: { type: Type.STRING, description: "The concept or question to display on the front face of the card" },
                back: { type: Type.STRING, description: "The concise answer, formula, or definition revealed on rotation" }
              },
              required: ["id", "front", "back"]
            }
          },
          quiz_questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options"
                },
                correct_answer: { type: Type.STRING, description: "Must exactly match one of the items in the options array" },
                socratic_hint: { type: Type.STRING, description: "A micro-intervention hint that guides a struggling student without giving away the answer" },
                explanation: { type: Type.STRING, description: "Detailed breakdown of why the answer is correct and why common distractors fail" }
              },
              required: ["id", "question", "options", "correct_answer", "socratic_hint", "explanation"]
            }
          }
        },
        required: ["target_academic_level", "flashcards", "quiz_questions"]
      };

      const systemInstruction = `You are the core pedagogical intelligence engine for QuizFlip AI, an automated assessment platform for students aged 5 to 22. Your task is to ingest unstructured text (question banks, study guides, or lecture notes) and completely transform them into structured, high-yield learning assets: targeted practice quizzes and dynamic, two-sided flashcards.

Operational Parameters:
1. Long-Context Extraction: Ingest the entire provided document. Ensure zero loss of contextual coherence. Extract core concepts, foundational facts, and complex analytical multi-step problems.
2. Pedagogical Adaptation (Age 5-22 Spectrum):
   - For foundational topics (K-12 appropriate): Use illustrative, encouraging, and clear language.
   - For advanced academic topics (University appropriate): Maintain rigorous, technical, and precise terminology.
3. Distractor Design: For quiz questions, craft highly plausible, adversarial distractors based on common student misconceptions. Avoid lazy, obviously incorrect options.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: text,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2,
        }
      });

      const responseText = response.text;
      
      if (!responseText) {
          throw new Error("No response generated");
      }

      const generatedData = JSON.parse(responseText);
      
      res.json({ success: true, data: generatedData });
    } catch (error: any) {
      console.error("API /api/generate Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate learning assets" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
