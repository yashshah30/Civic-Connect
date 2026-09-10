import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRole("citizen"),
  getNotifications
);

router.get(
  "/unread-count",
  authMiddleware,
  requireRole("citizen"),
  getUnreadNotificationCount
);
router.patch(
  "/read-all",
  authMiddleware,
  requireRole("citizen"),
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  authMiddleware,
  requireRole("citizen"),
  markNotificationAsRead
);

export default router;