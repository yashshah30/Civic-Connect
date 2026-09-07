import express from "express";

import {
  getComplaints,
  getCitizenComplaints,
  getCitizenComplaintById,
  createComplaint,
  updateComplaint,
} from "../controllers/complaint.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();


/*
 * Debug authentication.
 */
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
 * Citizens can view all of their own complaints.
 */
router.get(
  "/my",
  authMiddleware,
  requireRole("citizen"),
  getCitizenComplaints
);


/*
 * Authorities can view all complaints.
 */
router.get(
  "/",
  authMiddleware,
  requireRole("authority"),
  getComplaints
);


/*
 * Citizens can view one of their own complaints.
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("citizen"),
  getCitizenComplaintById
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
