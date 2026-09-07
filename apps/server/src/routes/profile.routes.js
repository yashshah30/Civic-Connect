import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile, uploadProfileAvatar } from "../controllers/profile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);
router.get("/", getProfile);
router.patch("/", updateProfile);
router.post("/avatar", upload.single("avatar"), uploadProfileAvatar);

export default router;