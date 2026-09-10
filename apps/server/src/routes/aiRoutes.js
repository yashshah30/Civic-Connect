import express from "express";
import { classifyCategory, generateDescription } from "../services/aiService.js";

const router = express.Router();

// POST /ai/classify-complaint
router.post("/classify-complaint", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const result = await classifyCategory(text);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "AI classification failed" });
  }
});

// POST /ai/generate-description
router.post("/generate-description", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const result = await generateDescription(text);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;