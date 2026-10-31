/**
 * PRAGATI AI Service
 * "Your Smart Civic Assistant"
 *
 * Frontend service to communicate with Civic Connect AI backend endpoints.
 * Communicates strictly with the backend; never exposes API keys on the client.
 */

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

/**
 * Retrieve the current authenticated user's access token from local storage.
 */
export const getStoredAccessToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

/**
 * Generate a formal complaint draft using PRAGATI AI.
 *
 * @param {string} input - Rough citizen notes or description
 * @param {string} [token] - Optional auth token, falls back to stored token
 * @returns {Promise<{ title: string, description: string, category: string, priority: string }>}
 */
export const draftComplaintWithAI = async (input, token = null) => {
  const authToken = token || getStoredAccessToken();

  if (!authToken) {
    const error = new Error("Please log in to use PRAGATI AI.");
    error.status = 401;
    throw error;
  }

  const trimmedInput = typeof input === "string" ? input.trim() : "";

  if (!trimmedInput) {
    const error = new Error(
      "Please enter a rough description of the issue first so PRAGATI AI can assist you."
    );
    error.status = 400;
    throw error;
  }

  if (trimmedInput.length < 5) {
    const error = new Error(
      "Description is too short. Please provide at least 5 characters for PRAGATI AI to draft a complaint."
    );
    error.status = 400;
    throw error;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/ai/draft-complaint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ input: trimmedInput }),
    });
  } catch (networkError) {
    console.error("PRAGATI AI network error:", networkError);
    const error = new Error(
      "PRAGATI AI is temporarily unavailable. You can continue submitting your complaint manually."
    );
    error.status = 0;
    error.original = networkError;
    throw error;
  }

  let responseData = {};
  const responseText = await response.text();
  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }
  }

  if (!response.ok || !responseData.success) {
    let friendlyMessage =
      "PRAGATI AI is temporarily unavailable. You can continue submitting your complaint manually.";

    if (response.status === 400) {
      friendlyMessage =
        responseData.message ||
        "Please provide more details in the description so PRAGATI AI can assist you.";
    } else if (response.status === 401 || response.status === 403) {
      friendlyMessage =
        "Your session has expired. Please log in again to use PRAGATI AI.";
    } else if (response.status === 429) {
      friendlyMessage =
        responseData.message ||
        "PRAGATI AI request limit reached. Please wait a moment or submit your complaint manually.";
    } else if (response.status === 503 || response.status === 504) {
      friendlyMessage =
        "PRAGATI AI is temporarily unavailable. You can continue submitting your complaint manually.";
    }

    const error = new Error(friendlyMessage);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  const draft = responseData.draft || {
    title: responseData.title || "",
    description: responseData.description || "",
    category: responseData.category || "other",
    priority: responseData.priority || "medium",
  };

  return draft;
};



/**
 * Send a message to the controlled conversational PRAGATI AI assistant.
 *
 * @param {string} message - User natural-language message
 * @param {object} [context] - Current conversational context (e.g. lastComplaintId)
 * @param {string} [token] - Optional auth token, falls back to stored token
 * @returns {Promise<{ success: boolean, intent: string, message: string, primaryAction: object, secondaryActions: Array, data: object, context: object }>}
 */
export const sendCivicAIMessage = async (message, context = {}, token = null) => {
  const authToken = token || getStoredAccessToken();

  if (!authToken) {
    const error = new Error("Please log in to chat with PRAGATI AI.");
    error.status = 401;
    throw error;
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (!trimmedMessage) {
    const error = new Error("Message cannot be empty.");
    error.status = 400;
    throw error;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message: trimmedMessage,
        context,
      }),
    });
  } catch (networkError) {
    console.error("PRAGATI AI chat network error:", networkError);
    const error = new Error(
      "Unable to reach PRAGATI AI assistant right now. Please check your connection."
    );
    error.status = 0;
    error.original = networkError;
    throw error;
  }

  let responseData = {};
  const responseText = await response.text();
  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }
  }

  if (!response.ok || !responseData.success) {
    let friendlyMessage =
      responseData.message ||
      "PRAGATI AI is temporarily unable to process that request. Please try again.";

    if (response.status === 401 || response.status === 403) {
      friendlyMessage = "Your session has expired. Please log in again to use PRAGATI AI.";
    }

    const error = new Error(friendlyMessage);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
};
