import express from "express";
import { createComplaint } from "../controllers/complaint.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/debug-auth",
  authMiddleware,
  (req, res) => {
    res.json({
      success: true,
      userId: req.user.id,
      accessTokenPresent: !!req.user.accessToken
    });
  }
);

router.post(
  "/",
  authMiddleware,
  requireRole("citizen"),
  createComplaint
);

export default router;
