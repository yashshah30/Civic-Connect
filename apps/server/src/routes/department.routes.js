import express from "express";
import { getDepartments } from "../controllers/department.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All department routes require an authenticated user
router.use(authMiddleware);

// GET /api/departments
router.get("/", getDepartments);

export default router;

