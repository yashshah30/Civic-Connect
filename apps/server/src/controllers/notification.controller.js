import { createClient } from "@supabase/supabase-js";

const getAuthenticatedSupabase = (req) => {
  return createClient(
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
};

/**
 * Get notifications for the logged-in citizen.
 * Also attaches complaint and department information.
 */
export const getNotifications = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req);

    const { data: notifications, error: notificationError } =
      await authenticatedSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (notificationError) {
      console.error(
        "Get notifications error:",
        notificationError
      );

      return res.status(400).json({
        success: false,
        message: notificationError.message,
      });
    }

    const notificationList = notifications || [];

    /*
     * Get all complaint IDs used by these notifications.
     */
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
        await authenticatedSupabase
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

    /*
     * Get department names used by the complaints.
     */
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
        await authenticatedSupabase
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

    /*
     * Attach complaint and department information
     * to each notification.
     */
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


/**
 * Mark one notification as read.
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const authenticatedSupabase = getAuthenticatedSupabase(req);

    console.log(
      "MARK AS READ REQUEST:",
      id,
      req.user.id
    );

    const { data, error } = await authenticatedSupabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.log(
      "NOTIFICATION MARKED AS READ:",
      id
    );

    return res.json({
      success: true,
      message: "Notification marked as read",
      notification: data,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * Mark all notifications belonging to the
 * logged-in citizen as read.
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req);

    const { error } = await authenticatedSupabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      return res.status(400).json({
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
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * Delete all notifications belonging to
 * the logged-in citizen.
 */
export const clearNotifications = async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req);

    const { error } = await authenticatedSupabase
      .from("notifications")
      .delete()
      .eq("user_id", req.user.id);

    if (error) {
      console.error(
        "Clear notifications error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Notifications cleared successfully",
    });
  } catch (error) {
    console.error(
      "Clear notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
