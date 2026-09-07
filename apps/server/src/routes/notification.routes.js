import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { clearNotifications, listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notification.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);
router.delete("/", clearNotifications);

export default router;