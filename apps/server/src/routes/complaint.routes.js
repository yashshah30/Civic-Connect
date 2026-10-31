import express from "express";
import multer from "multer";

import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintStats,
  updateComplaintStatus,
  getAuthorityComplaints,
  getAuthorityComplaintById,
  getAuthorityAnalytics,
  updateComplaint,
  getComplaintStatusHistory,
  createResolution,
  getComplaintResolution,
  createComplaintVerification,
  getPublicCivicPulseAnalytics,
} from "../controllers/complaint.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Multer configuration for complaint images
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Debug authentication
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

// Public: City Civic Pulse Analytics (public transparency, no auth required)
router.get("/public/analytics", getPublicCivicPulseAnalytics);

// Authority: analytics dashboard data
router.get(
  "/authority/analytics",
  authMiddleware,
  requireRole("authority"),
  getAuthorityAnalytics
);

// Authority: get all complaints
router.get(
  "/authority",
  authMiddleware,
  requireRole("authority"),
  getAuthorityComplaints
);

// Authority: get one complaint
router.get(
  "/authority/:id",
  authMiddleware,
  requireRole("authority"),
  getAuthorityComplaintById
);

// Citizen: get own complaints
router.get(
  "/my",
  authMiddleware,
  requireRole("citizen"),
  getMyComplaints
);

// Citizen: complaint statistics
router.get(
  "/stats",
  authMiddleware,
  requireRole("citizen"),
  getComplaintStats
);

// Authority: update complaint status
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("authority"),
  updateComplaintStatus
);

router.get(
  "/:id/status-history",
  authMiddleware,
  requireRole("citizen"),
  getComplaintStatusHistory
);

// Authority: add resolution proof
router.post(
  "/:id/resolution",
  authMiddleware,
  requireRole("authority"),
  createResolution
);

// Citizen & Authority: get resolution proof
router.get(
  "/:id/resolution",
  authMiddleware,
  requireRole("citizen", "authority"),
  getComplaintResolution
);

// Citizen: submit resolution verification
router.post(
  "/:id/verification",
  authMiddleware,
  requireRole("citizen"),
  createComplaintVerification
);

// Authority: update complaint status/department
router.patch(
  "/:id",
  authMiddleware,
  requireRole("authority"),
  updateComplaint
);

// Citizen: get one own complaint
router.get(
  "/:id",
  authMiddleware,
  requireRole("citizen"),
  getComplaintById
);

// Citizen: create complaint
router.post(
  "/",
  authMiddleware,
  requireRole("citizen"),
  upload.array("images", 5),
  createComplaint
);

export default router;
