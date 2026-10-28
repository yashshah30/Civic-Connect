import { GoogleGenAI, Type } from "@google/genai";

const ALLOWED_CATEGORIES = ["road", "water", "sanitation", "drainage", "other"];
const ALLOWED_PRIORITIES = ["low", "medium", "high", "urgent"];

const SYSTEM_INSTRUCTION = `You are PRAGATI AI, the smart civic assistant for Civic Connect.
Your task is to convert raw notes, informal descriptions, voice transcripts, or Hindi/Hinglish text from citizens into a clear, formal civic complaint in English.

STRICT RULES:
1. Preserve the user's actual meaning and facts faithfully.
2. NEVER fabricate, assume, or invent details not present in the user input (such as exact street numbers, injuries, dates, damage amounts, or municipal departments).
3. Infer the category ONLY from: "road", "water", "sanitation", "drainage", "other".
4. Suggest the priority conservatively from: "low", "medium", "high", "urgent":
   - "urgent": Immediate severe life hazard (e.g. open electrical wire, massive collapsing road, gas leak).
   - "high": Serious hazard or disruption (e.g. deep pothole causing vehicle accidents, major water main burst, sewer overflow).
   - "medium": Standard disruption needing repair (e.g. broken street light, garbage heap, non-emergency leak).
   - "low": Minor cosmetic or low-impact issue.
5. Translate Hindi/Hinglish into clear, formal, grammatical English for title and description.
6. The title must be concise (under 80 characters).
7. The description must be clear, well-structured, and factual.
8. If information (such as exact landmark, date, or severity) is missing, do NOT invent it.
9. Return a JSON object with:
   - "title": A concise, formal summary title in English.
   - "description": A clear, detailed, factual description in English.
   - "category": One of "road", "water", "sanitation", "drainage", "other".
   - "priority": One of "low", "medium", "high", "urgent".`;

export const parseJsonResponse = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI model");
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Failed to parse AI output as JSON");
  }
};

export const validateDraftOutput = (output) => {
  if (!output || typeof output !== "object") {
    throw new Error("AI response structure is invalid");
  }

  const { title, description, category, priority } = output;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("AI response missing valid title string");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("AI response missing valid description string");
  }

  const normalizedCategory = String(category || "").toLowerCase().trim();
  if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
    throw new Error(`AI inferred an invalid category: "${category}"`);
  }

  const normalizedPriority = String(priority || "").toLowerCase().trim();
  if (!ALLOWED_PRIORITIES.includes(normalizedPriority)) {
    throw new Error(`AI suggested an invalid priority: "${priority}"`);
  }

  return {
    title: title.trim(),
    description: description.trim(),
    category: normalizedCategory,
    priority: normalizedPriority,
  };
};

export const generateDraftComplaint = async (input, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const err = new Error("GEMINI_API_KEY is not configured on the server");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelName = process.env.GEMINI_MODEL || options.model || "gemini-3.5-flash-lite";

  const timeoutMs = options.timeoutMs || 25000;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const timeoutErr = new Error("AI service request timed out");
      timeoutErr.code = "TIMEOUT";
      reject(timeoutErr);
    }, timeoutMs);
  });

  const callModel = async (model) => {
    return await ai.models.generateContent({
      model,
      contents: `Citizen Complaint Notes:\n"""\n${input.trim()}\n"""`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Concise formal civic complaint title in English under 80 characters",
            },
            description: {
              type: Type.STRING,
              description: "Detailed, objective, clear description of the issue in English without invented facts",
            },
            category: {
              type: Type.STRING,
              enum: ALLOWED_CATEGORIES,
              description: "The municipal category that best matches the issue",
            },
            priority: {
              type: Type.STRING,
              enum: ALLOWED_PRIORITIES,
              description: "Conservative severity estimation based on safety impact",
            },
          },
          required: ["title", "description", "category", "priority"],
        },
      },
    });
  };

  let response;
  try {
    response = await Promise.race([callModel(modelName), timeoutPromise]);
  } catch (err) {
    if (
      modelName === "gemini-3.5-flash-lite" &&
      (err?.message?.includes("not found") || err?.status === 404 || err?.message?.includes("unavailable") || err?.message?.includes("no longer available"))
    ) {
      console.warn("gemini-3.5-flash-lite unavailable, attempting fallback to gemini-3.5-flash");
      response = await Promise.race([callModel("gemini-3.5-flash"), timeoutPromise]);
    } else {
      throw err;
    }
  }

  const parsed = parseJsonResponse(response.text);
  return validateDraftOutput(parsed);
};

