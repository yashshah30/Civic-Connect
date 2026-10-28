import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // 3. Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // 4. Validate token with Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 5. Fetch profile safely using '*' to avoid missing-column errors
    const authenticatedSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  }
);

const { data: profile, error: profileError } =
  await authenticatedSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

if (profileError) {
  console.error("Profile fetch error:", profileError);
} // maybeSingle() avoids throwing exception on empty match

    // If profile is missing, fallback gracefully instead of breaking auth
    const userRole = profile?.role || "citizen";

    req.user = {
      ...user,
      role: userRole,
      profile: profile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "User",
        role: "citizen",
      },
      accessToken: token,
    };
    req.supabase = authenticatedSupabase;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};