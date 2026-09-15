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

const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// Utility: Sanitize and Validate Category
function normalizeCategory(cat) {
  if (!cat) return "Other";
  const matched = ALLOWED_CATEGORIES.find(
    (c) => c.toLowerCase() === cat.trim().toLowerCase()
  );
  return matched || "Other";
}

// Utility: Sanitize Priority
function normalizePriority(pri) {
  if (!pri) return "Medium";
  const matched = ALLOWED_PRIORITIES.find(
    (p) => p.toLowerCase() === pri.trim().toLowerCase()
  );
  return matched || "Medium";
}

// 1. Category Detection (8 Sep Task)
export async function classifyCategory(text) {
  if (!text || !text.trim()) return { category: "Other", confidence: 0.5 };
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
    Analyze the given civic complaint text and classify it into EXACTLY ONE of these categories:
    ${ALLOWED_CATEGORIES.map((c) => `- "${c}"`).join("\n")}

    Complaint Text: "${text}"

    Return ONLY a valid JSON object in this exact format:
    {
      "category": "<One of allowed categories>",
      "confidence": 0.92
    }
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().trim().replace(/```json|```/g, "");
    const data = JSON.parse(cleanJson);
    return {
      category: normalizeCategory(data.category),
      confidence: data.confidence || 0.85
    };
  } catch (err) {
    console.error("AI Classify Error:", err.message);
    return { category: "Other", confidence: 0.5 };
  }
}

// 2. Description Generator (9 Sep Task)
export async function generateDescription(text) {
  if (!text || !text.trim()) return { description: "" };
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
    Translate/rewrite the following informal civic complaint into a concise, professional English complaint description.
    Original complaint: "${text}"

    Return ONLY a valid JSON object:
    {
      "description": "<professional complaint text>"
    }
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().trim().replace(/```json|```/g, "");
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("AI Description Error:", err.message);
    return { description: text };
  }
}

// 3. Priority Detection (10 Sep Task)
export async function detectPriority(text) {
  if (!text || !text.trim()) return "Medium";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
    Analyze the urgency of this civic complaint and determine its priority.
    Complaint Text: "${text}"

    Rules:
    - Critical: life-threatening situations (exposed electric wires, major road collapsing).
    - High: major disruptions or safety hazards (potholes on main road, pipeline burst).
    - Medium: normal inconveniences (streetlights not working, garbage not collected).
    - Low: minor issues (small pothole in residential street).

    Return ONLY a valid JSON object:
    {
      "priority": "Low" | "Medium" | "High" | "Critical"
    }
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().trim().replace(/```json|```/g, "");
    const data = JSON.parse(cleanJson);
    return normalizePriority(data.priority);
  } catch (err) {
    console.error("AI Priority Error:", err.message);
    return "Medium";
  }
}

// 4. Combined Analysis Service (11-13 Sep Task)
export async function analyzeComplaint(text) {
  if (!text || !text.trim()) {
    return {
      category: "Other",
      description: "",
      priority: "Medium",
      error: "Input text is required"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
    You are an AI assistant for Civic Connect app.
    Analyze the civic complaint and perform 3 tasks:
    1. Classify into EXACTLY ONE category: ${ALLOWED_CATEGORIES.map((c) => `"${c}"`).join(", ")}.
    2. Rewrite/translate into a concise, professional English description.
    3. Determine urgency priority: "Low", "Medium", "High", or "Critical".

    Complaint Text: "${text}"

    Return ONLY a valid JSON object in this exact format:
    {
      "category": "<One of allowed categories>",
      "description": "<professional description>",
      "priority": "<Low|Medium|High|Critical>"
    }
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().trim().replace(/```json|```/g, "");
    const data = JSON.parse(cleanJson);

    return {
      category: normalizeCategory(data.category),
      description: data.description || text,
      priority: normalizePriority(data.priority)
    };
  } catch (err) {
    console.error("AI Full Analysis Error:", err.message);
    return {
      category: "Other",
      description: text,
      priority: "Medium",
      aiUnavailable: true
    };
  }
}