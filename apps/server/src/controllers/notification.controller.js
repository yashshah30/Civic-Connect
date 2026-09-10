import { createClient } from "@supabase/supabase-js";

const getAuthenticatedSupabase = (accessToken) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(
      req.user.accessToken
    );

    const { data, error } = await authenticatedSupabase
      .from("notifications")
      .select(`
        id,
        complaint_id,
        title,
        message,
        type,
        is_read,
        created_at
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get notifications error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      notifications: data,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/notifications/unread-count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(
      req.user.accessToken
    );

    const { count, error } = await authenticatedSupabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Get unread notification count error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      unread_count: count || 0,
    });
  } catch (error) {
    console.error("Get unread notification count error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const authenticatedSupabase = getAuthenticatedSupabase(
      req.user.accessToken
    );

    const { data, error } = await authenticatedSupabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("Mark notification as read error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: data,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(
      req.user.accessToken
    );

    const { error } = await authenticatedSupabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all notifications as read error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};