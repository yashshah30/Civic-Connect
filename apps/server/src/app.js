import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import { getAuthorityAnalytics, getPublicCivicPulseAnalytics } from "./controllers/complaint.controller.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { requireRole } from "./middleware/role.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Civic Connect Backend Running"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase
      .from("departments")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "Civic Connect API and database are connected"
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/departments", departmentRoutes);

// Direct authority analytics alias
app.get(
  "/api/authority/analytics",
  authMiddleware,
  requireRole("authority"),
  getAuthorityAnalytics
);

// Direct public civic pulse analytics endpoints
app.get("/api/complaints/public/analytics", getPublicCivicPulseAnalytics);
app.get("/api/civic-pulse/analytics", getPublicCivicPulseAnalytics);

export default app;
