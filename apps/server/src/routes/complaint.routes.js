import express from "express";

import {
  createComplaint,
  getAuthorityComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintStatusHistory,
} from "../controllers/complaint.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Debug Authentication
|--------------------------------------------------------------------------
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
|--------------------------------------------------------------------------
| Authority - Get All Complaints
|--------------------------------------------------------------------------
*/

router.get(
  "/authority",
  authMiddleware,
  requireRole("authority"),
  getAuthorityComplaints
);


/*
|--------------------------------------------------------------------------
| Authority - Update Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("authority"),
  updateComplaintStatus
);


/*
|--------------------------------------------------------------------------
| Authority - Status History
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/history",
  authMiddleware,
  requireRole("authority"),
  getComplaintStatusHistory
);


/*
|--------------------------------------------------------------------------
| Authority - Get Single Complaint
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  requireRole("authority"),
  getComplaintById
);


/*
|--------------------------------------------------------------------------
| Citizen - Create Complaint
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  requireRole("citizen"),
  createComplaint
);


export default router;