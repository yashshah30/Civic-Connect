import express from "express";
import multer from "multer";

import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintStats,
  updateComplaintStatus,
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


// Get complaints belonging to logged-in citizen
router.get(
  "/my",
  authMiddleware,
  requireRole("citizen"),
  getMyComplaints
);

router.get(
  "/stats",
  authMiddleware,
  requireRole("citizen"),
  getComplaintStats
);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("authority"),
  updateComplaintStatus
);

router.get(
  "/:id",
  authMiddleware,
  requireRole("citizen"),
  getComplaintById
);

// Create complaint
router.post(
  "/",
  authMiddleware,
  requireRole("citizen"),
  upload.array("images", 5),
  createComplaint
);


export default router;