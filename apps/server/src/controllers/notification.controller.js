import { createClient } from "@supabase/supabase-js";

// Create authenticated Supabase client
const getSupabase = (req) =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
        },
      },
    }
  );

// Get notifications for the logged-in citizen
export const getNotifications = async (req, res) => {
  try {
    const supabase = getSupabase(req);

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get notifications error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark one notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const supabase = getSupabase(req);

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select("id, message, complaint_id, read, created_at")
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const supabase = getSupabase(req);

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", req.user.id)
      .eq("read", false);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Clear all notifications
export const clearNotifications = async (req, res) => {
  try {
    const supabase = getSupabase(req);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", req.user.id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Clear notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};