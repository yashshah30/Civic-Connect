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

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      department_id,
      latitude,
      longitude,
      address,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .insert({
          user_id: req.user.id,
          title,
          description,
          category,
          priority: priority || "medium",
          status: "submitted",
          department_id: department_id || null,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          address: address || null,
        })
        .select()
        .single();

    if (complaintError) {
      console.error("Create complaint error:", complaintError);

      return res.status(400).json({
        success: false,
        message: complaintError.message,
      });
    }

    const uploadedMedia = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const safeFileName = file.originalname.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const filePath = `${req.user.id}/${complaint.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } =
          await authenticatedSupabase.storage
            .from("complaint-images")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

        if (uploadError) {
          console.error("Image upload error:", uploadError);

          await authenticatedSupabase
            .from("complaints")
            .delete()
            .eq("id", complaint.id);

          return res.status(400).json({
            success: false,
            message: `Failed to upload image: ${uploadError.message}`,
          });
        }

        const { data: publicUrlData } =
          authenticatedSupabase.storage
            .from("complaint-images")
            .getPublicUrl(filePath);

        const fileUrl = publicUrlData.publicUrl;

        const { data: media, error: mediaError } =
          await authenticatedSupabase
            .from("complaint_media")
            .insert({
              complaint_id: complaint.id,
              file_url: fileUrl,
              file_type: "image",
              file_name: file.originalname,
            })
            .select()
            .single();

        if (mediaError) {
          console.error("Complaint media error:", mediaError);

          return res.status(400).json({
            success: false,
            message: `Image uploaded but media record failed: ${mediaError.message}`,
          });
        }

        uploadedMedia.push(media);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint,
      media: uploadedMedia,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get complaints submitted by the logged-in citizen
export const getMyComplaints = async (req, res) => {
  try {
    const authenticatedSupabase = getSupabase(req);

    const { data: complaints, error } =
      await authenticatedSupabase
        .from("complaints")
        .select(`
          *,
          complaint_media (
            id,
            file_url,
            file_type,
            file_name,
            created_at
          )
        `)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) {
      console.error("Get my complaints error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      complaints: complaints || [],
    });
  } catch (error) {
    console.error("Get my complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a single complaint belonging to the logged-in citizen
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    const { data: complaint, error } =
      await authenticatedSupabase
        .from("complaints")
        .select(`
          *,
          complaint_media (
            id,
            file_url,
            file_type,
            file_name,
            created_at
          )
        `)
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (error || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get complaint by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get complaint statistics for the logged-in citizen
export const getComplaintStats = async (req, res) => {
  try {
    const authenticatedSupabase = getSupabase(req);

    const { data: complaints, error } =
      await authenticatedSupabase
        .from("complaints")
        .select("status")
        .eq("user_id", req.user.id);

    if (error) {
      console.error("Get complaint stats error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const allComplaints = complaints || [];

    const stats = {
      total: allComplaints.length,
      pending: allComplaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "pending" ||
          complaint.status?.toLowerCase() === "submitted"
      ).length,
      inProgress: allComplaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "in_progress" ||
          complaint.status?.toLowerCase() === "in progress"
      ).length,
      resolved: allComplaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "resolved"
      ).length,
    };

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get complaint stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update complaint status by authority
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const allowedStatuses = [
      "submitted",
      "under_review",
      "assigned",
      "in_progress",
      "resolved",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .select("id, user_id, status, title")
        .eq("id", id)
        .single();

    if (complaintError || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const oldStatus = complaint.status;

    const { data: updatedComplaint, error: updateError } =
      await authenticatedSupabase
        .from("complaints")
        .update({ status })
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

    const { error: historyError } =
      await authenticatedSupabase
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
    }

    const { error: notificationError } =
      await authenticatedSupabase
        .from("notifications")
        .insert({
          user_id: complaint.user_id,
          complaint_id: id,
          title: "Complaint Status Updated",
          message: `Your complaint "${complaint.title}" status changed to ${status.replace(
            "_",
            " "
          )}.`,
          type: "status_update",
          is_read: false,
        });

    if (notificationError) {
      console.error("Notification error:", notificationError);
    }

    return res.json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all complaints for authority
export const getAuthorityComplaints = async (req, res) => {
  try {
    const authenticatedSupabase = getSupabase(req);

    const { data: complaints, error } =
      await authenticatedSupabase
        .from("complaints")
        .select(`
          *,
          complaint_media (*)
        `)
        .order("created_at", { ascending: false });

    if (error) {
      console.error("Get authority complaints error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      complaints: complaints || [],
    });
  } catch (error) {
    console.error("Get authority complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get one complaint for authority
export const getAuthorityComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const authenticatedSupabase = getSupabase(req);

    const { data: complaint, error } =
      await authenticatedSupabase
        .from("complaints")
        .select(`
          *,
          complaint_media (*)
        `)
        .eq("id", id)
        .single();

    if (error || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get authority complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Gautam compatibility: get all complaints
export const getComplaints = getAuthorityComplaints;

// Gautam compatibility: get citizen complaints
export const getCitizenComplaints = getMyComplaints;

// Gautam compatibility: get citizen complaint by ID
export const getCitizenComplaintById = getComplaintById;

// Gautam compatibility: update complaint
export const updateComplaint = async (req, res) => {
  try {
    const { status, department_id } = req.body;

    if (!status && department_id === undefined) {
      return res.status(400).json({
        success: false,
        message: "Status or department is required",
      });
    }

    const allowedStatuses = [
      "submitted",
      "under_review",
      "assigned",
      "in_progress",
      "resolved",
      "rejected",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (department_id !== undefined) {
      updates.department_id = department_id || null;
    }

    const { data, error } =
      await authenticatedSupabase
        .from("complaints")
        .update(updates)
        .eq("id", req.params.id)
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
      message: "Complaint updated successfully",
      complaint: data,
    });
  } catch (error) {
    console.error("Update complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};