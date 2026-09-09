import { createClient } from "@supabase/supabase-js";

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

    const notificationList = notifications || [];

    // Enrich notifications with complaint information
    const complaintIds = [
      ...new Set(
        notificationList
          .map((notification) => notification.complaint_id)
          .filter(Boolean)
      ),
    ];

    let complaints = [];

    if (complaintIds.length > 0) {
      const { data: complaintData, error: complaintError } =
        await supabase
          .from("complaints")
          .select(
            "id, title, status, department_id, created_at, updated_at"
          )
          .in("id", complaintIds)
          .eq("user_id", req.user.id);

      if (complaintError) {
        console.error(
          "Get notification complaints error:",
          complaintError
        );
      } else {
        complaints = complaintData || [];
      }
    }

    // Enrich with department information
    const departmentIds = [
      ...new Set(
        complaints
          .map((complaint) => complaint.department_id)
          .filter(Boolean)
      ),
    ];

    let departments = [];

    if (departmentIds.length > 0) {
      const { data: departmentData, error: departmentError } =
        await supabase
          .from("departments")
          .select("id, name")
          .in("id", departmentIds);

      if (departmentError) {
        console.error(
          "Get notification departments error:",
          departmentError
        );
      } else {
        departments = departmentData || [];
      }
    }

    const enrichedNotifications = notificationList.map(
      (notification) => {
        const complaint = complaints.find(
          (item) => item.id === notification.complaint_id
        );

        const department = complaint?.department_id
          ? departments.find(
              (item) => item.id === complaint.department_id
            )
          : null;

        return {
          ...notification,

          complaint: complaint
            ? {
                id: complaint.id,
                title: complaint.title,
                status: complaint.status,
                department_id: complaint.department_id,
                created_at: complaint.created_at,
                updated_at: complaint.updated_at,
              }
            : null,

          department: department
            ? {
                id: department.id,
                name: department.name,
              }
            : null,
        };
      }
    );

    return res.json({
      success: true,
      notifications: enrichedNotifications,
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
      .update({
        is_read: true,
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
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

// Gautam compatibility alias
export const markNotificationAsRead = markNotificationRead;

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const supabase = getSupabase(req);

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Gautam compatibility alias
export const markAllNotificationsAsRead =
  markAllNotificationsRead;

// Delete one notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const supabase = getSupabase(req);

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Notification cleared successfully",
      notification: data,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

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

    return res.json({
      success: true,
      message: "Notifications cleared successfully",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};