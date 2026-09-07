import express from "express";

import {
  getComplaints,
  createComplaint,
  updateComplaint,
} from "../controllers/complaint.controller.js";

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
      accessTokenPresent: !!req.user.accessToken,
    });
  }
);


/*
 * Get all complaints.
 * Authorities can view complaints.
 */
router.get(
  "/",
  authMiddleware,
  requireRole("authority"),
  getComplaints
);


/*
 * Citizens create complaints.
 */
router.post(
  "/",
  authMiddleware,
  requireRole("citizen"),
  createComplaint
);


/*
 * Authorities update complaint status
 * or department.
 */
router.patch(
  "/:id",
  authMiddleware,
  requireRole("authority"),
  updateComplaint
);


export default router;
