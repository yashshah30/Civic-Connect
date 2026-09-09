import express from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from "../controllers/notification.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("citizen"));

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);
router.delete("/", clearNotifications);

export default router;