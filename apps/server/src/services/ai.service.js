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



export const ALLOWED_INTENTS = [
  "TRACK_COMPLAINT",
  "LIST_COMPLAINTS",
  "VIEW_COMPLAINT",
  "START_COMPLAINT",
  "EXPLAIN_STATUS",
  "EXPLAIN_PRIORITY",
  "CHECK_NOTIFICATIONS",
  "OPEN_PAGE",
  "GENERAL_CIVIC_GUIDANCE",
];

export const classifyIntentFast = (text, context = {}) => {
  const q = String(text || "").trim().toLowerCase();

  // 1. Specific complaint ID search (e.g. "CC-1234", "CC-2026-8941", or full UUID)
  const idMatch = text.match(/\b(CC-[0-9A-Za-z-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i);
  if (idMatch) {
    return {
      intent: "VIEW_COMPLAINT",
      targetComplaintId: idMatch[1],
      confidence: 0.98,
    };
  }

  // 2. Pronoun / context follow-up ("uska status", "uski details", "details dikhao", "woh complaint", "status batao")
  if (
    context.lastComplaintId &&
    (q.includes("uska") ||
      q.includes("uski") ||
      q.includes("woh") ||
      q.includes("details") ||
      q.includes("detail") ||
      q === "status" ||
      q === "status?" ||
      q.includes("uska status") ||
      q.includes("uski details") ||
      q.includes("aur batao"))
  ) {
    return {
      intent: "VIEW_COMPLAINT",
      targetComplaintId: context.lastComplaintId,
      confidence: 0.95,
    };
  }

  // 3. Category-specific tracking (e.g. "meri drainage wali complaint", "road wali complaint")
  const categoryKeywords = {
    road: ["road", "sadak", "pothole", "gaddha"],
    water: ["water", "paani", "pipeline", "nal"],
    sanitation: ["sanitation", "kachra", "garbage", "safai"],
    drainage: ["drainage", "naala", "sewer", "gutter", "waterlogging"],
  };

  for (const [cat, kws] of Object.entries(categoryKeywords)) {
    if (
      kws.some((k) => q.includes(k)) &&
      (q.includes("wali") ||
        q.includes("complaint") ||
        q.includes("dikhao") ||
        q.includes("status"))
    ) {
      if (
        !q.includes("report") &&
        !q.includes("karni hai") &&
        !q.includes("karna hai") &&
        !q.includes("overflow ho raha") &&
        !q.includes("kharab hai")
      ) {
        return {
          intent: "TRACK_COMPLAINT",
          targetCategory: cat,
          confidence: 0.9,
        };
      }
    }
  }

  // 4. Notifications
  if (
    q.includes("notification") ||
    q.includes("notifications") ||
    q.includes("koi update") ||
    q.includes("update aaya") ||
    q.includes("updates") ||
    q.includes("messages")
  ) {
    return {
      intent: "CHECK_NOTIFICATIONS",
      confidence: 0.95,
    };
  }

  // 5. Page Navigation ("kholo", "open karo", "navigate to")
  if (q.includes("kholo") || q.includes("open") || q.includes("dikhao")) {
    if (q.includes("profile")) {
      return {
        intent: "OPEN_PAGE",
        targetPage: "/citizen/profile",
        confidence: 0.95,
      };
    }
    if (q.includes("dashboard")) {
      return {
        intent: "OPEN_PAGE",
        targetPage: "/citizen/dashboard",
        confidence: 0.95,
      };
    }
    if (q.includes("report") || q.includes("raise")) {
      return {
        intent: "OPEN_PAGE",
        targetPage: "/citizen/report",
        confidence: 0.95,
      };
    }
    if (q.includes("track")) {
      return {
        intent: "OPEN_PAGE",
        targetPage: "/citizen/track",
        confidence: 0.95,
      };
    }
    if (
      q.includes("complaints") ||
      q.includes("my complaints") ||
      q.includes("meri complaints")
    ) {
      return { intent: "LIST_COMPLAINTS", confidence: 0.95 };
    }
  }

  // 6. Status Explanation ("In Progress matlab", "pending ka kya meaning hai")
  if (
    q.includes("matlab") ||
    q.includes("meaning") ||
    q.includes("means") ||
    q.includes("kya hota hai") ||
    q.includes("kya hoti hai")
  ) {
    if (q.includes("in progress") || q.includes("progress")) {
      return {
        intent: "EXPLAIN_STATUS",
        targetStatus: "in_progress",
        confidence: 0.95,
      };
    }
    if (q.includes("pending") || q.includes("under review")) {
      return {
        intent: "EXPLAIN_STATUS",
        targetStatus: "under_review",
        confidence: 0.95,
      };
    }
    if (q.includes("assigned")) {
      return {
        intent: "EXPLAIN_STATUS",
        targetStatus: "assigned",
        confidence: 0.95,
      };
    }
    if (q.includes("resolved")) {
      return {
        intent: "EXPLAIN_STATUS",
        targetStatus: "resolved",
        confidence: 0.95,
      };
    }
    if (q.includes("rejected")) {
      return {
        intent: "EXPLAIN_STATUS",
        targetStatus: "rejected",
        confidence: 0.95,
      };
    }
    if (q.includes("urgent")) {
      return {
        intent: "EXPLAIN_PRIORITY",
        targetPriority: "urgent",
        confidence: 0.95,
      };
    }
    if (q.includes("high priority") || q.includes("high")) {
      return {
        intent: "EXPLAIN_PRIORITY",
        targetPriority: "high",
        confidence: 0.95,
      };
    }
    if (q.includes("priority")) {
      return { intent: "EXPLAIN_PRIORITY", confidence: 0.9 };
    }
    if (q.includes("status")) {
      return { intent: "EXPLAIN_STATUS", confidence: 0.9 };
    }
  }

  // 7. List Complaints ("meri complaints dikhao", "meri recent complaints", "mere kitne complaints hain")
  if (
    (q.includes("meri") ||
      q.includes("my") ||
      q.includes("mere") ||
      q.includes("all") ||
      q.includes("saari") ||
      q.includes("recent")) &&
    (q.includes("complaints") ||
      q.includes("complaint list") ||
      q.includes("shikayat")) &&
    (q.includes("dikhao") ||
      q.includes("list") ||
      q.includes("show") ||
      q.includes("kitne") ||
      q.includes("batao"))
  ) {
    return {
      intent: "LIST_COMPLAINTS",
      confidence: 0.95,
    };
  }

  // 8. Track Single / Latest Complaint ("meri complaint ka kya hua", "kya hua meri complaint ka", "track my complaint")
  if (
    q.includes("kya hua") ||
    q.includes("kahan tak") ||
    q.includes("track") ||
    (q.includes("status") &&
      (q.includes("meri") || q.includes("my") || q.includes("complaint")))
  ) {
    return {
      intent: "TRACK_COMPLAINT",
      confidence: 0.92,
    };
  }

  // 9. Start / Report a Complaint ("complaint karni hai", "road ka issue report karna hai")
  if (
    q.includes("complaint karni") ||
    q.includes("complaint karna") ||
    q.includes("report karna") ||
    q.includes("report karni") ||
    q.includes("file complaint") ||
    q.includes("raise complaint") ||
    q.includes("new complaint") ||
    q.includes("shikayat darj")
  ) {
    return {
      intent: "START_COMPLAINT",
      issueDescription: text,
      confidence: 0.95,
    };
  }

  // 10. Natural Language issue description without explicit command
  // e.g. "mere ghar ke paas drainage overflow ho raha hai aur road pe paani bhar gaya hai"
  const problemIndicators = [
    "overflow",
    "paani bhar",
    "leakage",
    "gaddha",
    "toot gaya",
    "band hai",
    "nahi aa raha",
    "kachra",
    "badbu",
    "dark",
    "khamba",
    "light band",
    "broken",
  ];
  if (
    problemIndicators.some((w) => q.includes(w)) &&
    text.trim().length >= 15
  ) {
    return {
      intent: "START_COMPLAINT",
      issueDescription: text,
      confidence: 0.9,
    };
  }

  // 11. Greetings & Guidance
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "namaste" ||
    q.startsWith("hi ") ||
    q.startsWith("hello ") ||
    q.includes("who are you") ||
    q.includes("help") ||
    q.includes("madad") ||
    q.includes("kya kar sakte")
  ) {
    return {
      intent: "GENERAL_CIVIC_GUIDANCE",
      confidence: 0.9,
    };
  }

  return null;
};

export const detectCivicIntent = async (userInput, context = {}) => {
  // 1. Try fast classifier first
  const fast = classifyIntentFast(userInput, context);
  if (fast && fast.confidence >= 0.85) {
    return fast;
  }

  // 2. If Gemini API key is available, use constrained model intent detection
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return fast || { intent: "GENERAL_CIVIC_GUIDANCE", confidence: 0.5 };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    const prompt = `You are the intent classifier for PRAGATI AI in Civic Connect.
Analyze the user message (which may be in English, Hindi, or Hinglish) and map it strictly into one of the allowed civic intents:
- TRACK_COMPLAINT: user wants to track their active/latest complaint status.
- LIST_COMPLAINTS: user asks to see/list their multiple or recent complaints.
- VIEW_COMPLAINT: user asks about a specific complaint by ID or previous conversation context.
- START_COMPLAINT: user wants to report or describes a municipal issue (drainage, roads, garbage, water, streetlights).
- EXPLAIN_STATUS: user asks about the meaning of a status (In Progress, Pending, Under Review, Resolved, Rejected).
- EXPLAIN_PRIORITY: user asks about priority meaning (Urgent, High, Medium, Low).
- CHECK_NOTIFICATIONS: user asks about notifications or updates.
- OPEN_PAGE: user wants to navigate to a page (profile, dashboard, report, complaints).
- GENERAL_CIVIC_GUIDANCE: greetings, general civic questions, or unclear requests.

Context: ${JSON.stringify(context)}
User Message: "${userInput}"`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              enum: ALLOWED_INTENTS,
            },
            targetComplaintId: {
              type: Type.STRING,
              nullable: true,
            },
            targetCategory: {
              type: Type.STRING,
              nullable: true,
            },
            targetStatus: {
              type: Type.STRING,
              nullable: true,
            },
            targetPage: {
              type: Type.STRING,
              nullable: true,
            },
            issueDescription: {
              type: Type.STRING,
              nullable: true,
            },
            confidence: {
              type: Type.NUMBER,
            },
          },
          required: ["intent", "confidence"],
        },
      },
    });

    const parsed = parseJsonResponse(result.text);
    if (parsed && ALLOWED_INTENTS.includes(parsed.intent)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Gemini intent classifier fallback:", err?.message || err);
  }

  // Fallback to fast classifier or default guidance
  return fast || { intent: "GENERAL_CIVIC_GUIDANCE", confidence: 0.5 };
};
