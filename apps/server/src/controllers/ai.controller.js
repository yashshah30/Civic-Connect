import { generateDraftComplaint } from "../services/ai.service.js";

export const draftComplaint = async (req, res) => {
  try {
    const { input } = req.body || {};

    if (input === undefined || input === null) {
      return res.status(400).json({
        success: false,
        message: "Input is required",
      });
    }

    if (typeof input !== "string") {
      return res.status(400).json({
        success: false,
        message: "Input must be a text string",
      });
    }

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return res.status(400).json({
        success: false,
        message: "Input cannot be empty",
      });
    }

    if (trimmedInput.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Input is too short. Please provide at least 5 characters describing the issue.",
      });
    }

    if (trimmedInput.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Input exceeds maximum allowed length of 2000 characters",
      });
    }

    const draft = await generateDraftComplaint(trimmedInput);

    return res.json({
      success: true,
      message: "Complaint draft generated successfully",
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      draft,
    });
  } catch (error) {
    console.error("AI draft complaint error:", error?.message || error);

    if (error.code === "MISSING_API_KEY") {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Gemini API key is not configured on the server.",
      });
    }

    if (error.code === "TIMEOUT") {
      return res.status(504).json({
        success: false,
        message: "AI service request timed out. Please try again.",
      });
    }

    const errorMessage = String(error?.message || "");
    const status = error?.status || error?.statusCode;

    if (
      status === 429 ||
      errorMessage.includes("quota") ||
      errorMessage.includes("RESOURCE_EXHAUSTED")
    ) {
      return res.status(429).json({
        success: false,
        message: "AI service rate limit exceeded. Please wait a moment and try again.",
      });
    }

    if (
      status === 400 &&
      (errorMessage.includes("API_KEY_INVALID") ||
        errorMessage.includes("invalid api key") ||
        errorMessage.includes("API key not valid"))
    ) {
      return res.status(500).json({
        success: false,
        message: "AI service configuration error. Please contact the administrator.",
      });
    }

    if (
      errorMessage.includes("Failed to parse") ||
      errorMessage.includes("invalid response") ||
      errorMessage.includes("missing valid")
    ) {
      return res.status(502).json({
        success: false,
        message: "AI service returned an unexpected response structure. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the complaint draft.",
    });
  }
};

