import express from "express";
import {
  draftComplaint,
  handleConversationalAction,
} from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// All AI routes require an authenticated user
router.use(authMiddleware);

// POST /api/ai/draft-complaint (Existing drafting endpoint — PRESERVED UNCHANGED)
router.post("/draft-complaint", draftComplaint);

// POST /api/ai/chat - Controlled conversational action endpoint for citizens
router.post("/chat", requireRole("citizen"), handleConversationalAction);
router.post(
  "/conversational-action",
  requireRole("citizen"),
  handleConversationalAction
);

export default router;
