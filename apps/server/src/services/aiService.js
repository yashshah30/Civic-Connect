import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ALLOWED_CATEGORIES = [
  "Road Damage",
  "Water Leakage",
  "Sanitation",
  "Waterlogging",
  "Streetlight",
  "Other"
];

// 1. AI Category Detection
export async function classifyCategory(text) {
  try {
    // Model updated to gemini-3.6-flash
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
    You are an AI assistant for a civic complaint management app.
    Analyze the given civic complaint text and classify it into EXACTLY ONE of these categories:
    ${ALLOWED_CATEGORIES.map((c) => `- "${c}"`).join("\n")}

    Complaint Text: "${text}"

    Return ONLY a valid JSON object in this exact format without any markdown code blocks:
    {
      "category": "<One of the allowed categories>",
      "confidence": 0.92
    }
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    if (!ALLOWED_CATEGORIES.includes(data.category)) {
      return { category: "Other", confidence: 0.80 };
    }
    return data;
  } catch (err) {
    console.error("AI Classify Error:", err.message);
    return { category: "Other", confidence: 0.50 };
  }
}

// 2. AI Description Generator
export async function generateDescription(text) {
  try {
    // Model updated to gemini-3.6-flash
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
    Translate/rewrite the following informal civic complaint into a concise, professional English complaint description.
    
    Original complaint: "${text}"
    
    Return ONLY a valid JSON object in this exact format without any markdown code blocks:
    {
      "description": "<professional complaint text>"
    }
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("AI Description Error:", err.message);
    return { description: text };
  }
}