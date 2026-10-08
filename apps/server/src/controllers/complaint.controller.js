/*
|--------------------------------------------------------------------------
| Update Complaint Status
|--------------------------------------------------------------------------
*/
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "pending",
      "under_review",
      "assigned",
      "in_progress",
      "resolved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const authenticatedSupabase = createClient(
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

    /*
    |--------------------------------------------------------------------------
    | Get current complaint
    |--------------------------------------------------------------------------
    */

    const { data: existingComplaint, error: fetchError } =
      await authenticatedSupabase
        .from("complaints")
        .select("id, status, user_id, title")
        .eq("id", id)
        .single();

    if (fetchError) {
      console.error("Fetch complaint status error:", fetchError);

      if (fetchError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      return res.status(400).json({
        success: false,
        message: fetchError.message,
      });
    }

    const oldStatus = existingComplaint.status;

    /*
    |--------------------------------------------------------------------------
    | Prevent unnecessary status update
    |--------------------------------------------------------------------------
    */

    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        message: "Complaint is already in this status",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Update complaint
    |--------------------------------------------------------------------------
    */

    const { data: updatedComplaint, error: updateError } =
      await authenticatedSupabase
        .from("complaints")
        .update({
          status,
        })
        .eq("id", id)
        .select()
        .single();

    if (updateError) {
      console.error("Update complaint status error:", updateError);

      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Add status history
    |--------------------------------------------------------------------------
    */

    const { error: historyError } = await authenticatedSupabase
      .from("complaint_status_history")
      .insert({
        complaint_id: id,
        old_status: oldStatus,
        new_status: status,
        changed_by: req.user.id,
        comment: comment || null,
      });

    if (historyError) {
      console.error("Status history error:", historyError);

      /*
      | The complaint itself has already been updated.
      | We return the updated complaint but notify the frontend
      | that history insertion failed.
      */

      return res.status(200).json({
        success: true,
        message: "Complaint status updated, but history could not be saved",
        complaint: updatedComplaint,
        historySaved: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create citizen notification
    |--------------------------------------------------------------------------
    */

    try {
      await createNotification({
        accessToken: req.user.accessToken,
        userId: existingComplaint.user_id,
        complaintId: id,
        title: "Complaint Status Updated",
        message: `Your complaint "${existingComplaint.title}" is now ${status.replace(
          /_/g,
          " "
        )}.`,
        type: "status_change",
      });
    } catch (notificationError) {
      console.error(
        "Status notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
      historySaved: true,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Complaint Status History
|--------------------------------------------------------------------------
*/
export const getComplaintStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

    const authenticatedSupabase = createClient(
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

    const { data, error } = await authenticatedSupabase
      .from("complaint_status_history")
      .select(`
        id,
        complaint_id,
        old_status,
        new_status,
        changed_by,
        comment,
        created_at
      `)
      .eq("complaint_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Get complaint status history error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      history: data || [],
    });
  } catch (error) {
    console.error(
      "Get complaint status history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};