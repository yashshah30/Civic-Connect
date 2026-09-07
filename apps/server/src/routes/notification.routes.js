import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
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

router.patch(
  "/:id/read",
  authMiddleware,
  requireRole("citizen"),
  markNotificationAsRead
);

router.patch(
  "/read-all",
  authMiddleware,
  requireRole("citizen"),
  markAllNotificationsAsRead
);

router.delete(
  "/",
  authMiddleware,
  requireRole("citizen"),
  clearNotifications
);

export default router;
