import express from "express";

import { getNotifications } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRole("citizen"),
  getNotifications
);

export default router;