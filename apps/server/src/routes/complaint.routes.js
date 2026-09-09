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
  updateComplaint,
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