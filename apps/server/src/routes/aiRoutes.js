import express from "express";
import { 
  classifyCategory, 
  generateDescription, 
  detectPriority, 
  analyzeComplaint 
} from "../services/aiService.js";

const router = express.Router();

// POST /ai/classify-complaint
router.post("/classify-complaint", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  const result = await classifyCategory(text);
  return res.json(result);
});

// POST /ai/generate-description
router.post("/generate-description", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  const result = await generateDescription(text);
  return res.json(result);
});

// POST /ai/priority
router.post("/priority", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  const priority = await detectPriority(text);
  return res.json({ priority });
});

// 11 & 13 Sep Unified Endpoint: POST /ai/analyze
router.post("/analyze", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Complaint text is required" });
  }

  const result = await analyzeComplaint(text);
  return res.json(result);
});

export default router;