import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notification.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();


/*
 * Get all notifications for the logged-in citizen.
 */
router.get(
  "/",
  authMiddleware,
  requireRole("citizen"),
  getNotifications
);


/*
 * Mark one notification as read.
 */
router.patch(
  "/:id/read",
  authMiddleware,
  requireRole("citizen"),
  markNotificationAsRead
);


/*
 * Mark all notifications as read.
 */
router.patch(
  "/read-all",
  authMiddleware,
  requireRole("citizen"),
  markAllNotificationsAsRead
);


/*
 * Delete one notification.
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("citizen"),
  deleteNotification
);


/*
 * Clear all notifications.
 */
router.delete(
  "/",
  authMiddleware,
  requireRole("citizen"),
  clearNotifications
);


export default router;
