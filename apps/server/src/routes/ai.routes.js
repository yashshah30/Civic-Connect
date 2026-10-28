import express from "express";
import { draftComplaint } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All AI routes require an authenticated user
router.use(authMiddleware);

// POST /api/ai/draft-complaint
router.post("/draft-complaint", draftComplaint);

export default router;

