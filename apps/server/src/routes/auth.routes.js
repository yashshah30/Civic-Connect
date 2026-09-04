import express from "express";
import {
  signup,
  login,
  forgotPassword,
  getMe
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.get("/me", authMiddleware, getMe);

export default router;

