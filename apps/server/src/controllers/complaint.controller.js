import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

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

export const getComplaintStatusHistory = async (req, res) => {
  try {
    const authenticatedSupabase = getSupabase(req);
    const { id } = req.params;

    // Verify that this complaint belongs to the logged-in citizen
    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (complaintError) {
      console.error(
        "Complaint ownership check error:",
        complaintError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to verify complaint access.",
      });
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    const { data: history, error: historyError } =
      await authenticatedSupabase
        .from("complaint_status_history")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: true });

    if (historyError) {
      console.error(
        "Get complaint status history error:",
        historyError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch complaint status history.",
      });
    }

    return res.json({
      success: true,
      history: history || [],
    });
  } catch (error) {
    console.error(
      "Get complaint status history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching status history.",
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

    let { error: notificationError } =
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

    if (
      notificationError &&
      (notificationError.message?.includes("column") ||
        notificationError.code === "42703")
    ) {
      const fallbackResult = await authenticatedSupabase
        .from("notifications")
        .insert({
          user_id: complaint.user_id,
          complaint_id: id,
          message: `Your complaint "${complaint.title}" status changed to ${status.replace(
            "_",
            " "
          )}.`,
          read: false,
        });

      notificationError = fallbackResult.error;
    }

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


// Authority: create resolution proof
export const createResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      before_image_url,
      after_image_url,
      resolution_description,
    } = req.body;

    if (!resolution_description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resolution description is required",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    // Verify complaint exists
    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .select("id, user_id, title, status")
        .eq("id", id)
        .single();

    if (complaintError || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const { data: resolution, error: resolutionError } =
      await authenticatedSupabase
        .from("complaint_resolutions")
        .insert({
          complaint_id: id,
          resolved_by: req.user.id,
          before_image_url: before_image_url || null,
          after_image_url: after_image_url || null,
          resolution_description: resolution_description.trim(),
        })
        .select()
        .single();

    if (resolutionError) {
      console.error("Create resolution error:", resolutionError);

      return res.status(400).json({
        success: false,
        message: resolutionError.message,
      });
    }

    // Automatically update complaint status to "resolved" so citizen verification is unlocked
    const oldStatus = complaint.status;
    const { error: updateError } = await authenticatedSupabase
      .from("complaints")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.error("Update status error after resolution:", updateError);
    }

    // Add status history entry
    const { error: historyError } = await authenticatedSupabase
      .from("complaint_status_history")
      .insert({
        complaint_id: id,
        old_status: oldStatus,
        new_status: "resolved",
        changed_by: req.user.id,
        comment: `Resolution submitted: ${resolution_description.trim()}`,
      });

    if (historyError) {
      console.error("Status history error after resolution:", historyError);
    }

    // Notify citizen that resolution proof has been submitted
    if (complaint.user_id) {
      const { error: notifError } = await authenticatedSupabase
        .from("notifications")
        .insert({
          user_id: complaint.user_id,
          complaint_id: id,
          title: "Resolution Submitted - Action Needed",
          message: `Work for complaint "${complaint.title || id}" has been marked resolved. Please inspect the evidence and verify the resolution.`,
          type: "resolution",
          is_read: false,
        });

      if (notifError) {
        console.warn("Notification error after resolution:", notifError);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Resolution proof added successfully",
      resolution,
    });
  } catch (error) {
    console.error("Create resolution error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Citizen/Authority: get resolution proof
export const getComplaintResolution = async (req, res) => {
  try {
    const { id } = req.params;

    const authenticatedSupabase = getSupabase(req);

    // Verify complaint exists & permissions
    let complaintQuery = authenticatedSupabase
      .from("complaints")
      .select("id, user_id, status")
      .eq("id", id);

    if (req.user?.role === "citizen") {
      complaintQuery = complaintQuery.eq("user_id", req.user.id);
    }

    const { data: complaint, error: complaintError } =
      await complaintQuery.maybeSingle();

    if (complaintError || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const { data: resolution, error: resolutionError } =
      await authenticatedSupabase
        .from("complaint_resolutions")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (resolutionError) {
      console.error("Get resolution error:", resolutionError);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch resolution proof",
      });
    }

    // Also fetch the latest verification record if any
    const { data: verification, error: verificationError } =
      await authenticatedSupabase
        .from("complaint_verifications")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (verificationError) {
      console.warn("Get verification warning:", verificationError);
    }

    return res.json({
      success: true,
      resolution: resolution || null,
      verification: verification || null,
    });
  } catch (error) {
    console.error("Get resolution error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Citizen: verify resolution
export const createComplaintVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, comment } = req.body;

    const allowedStatuses = [
      "resolved",
      "still_unresolved",
    ];

    if (!allowedStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message:
          "Verification status must be resolved or still_unresolved",
      });
    }

    const authenticatedSupabase = getSupabase(req);

    // Verify complaint belongs to logged-in citizen
    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .select("id, status, title")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (complaintError || !complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be resolved before verification",
      });
    }

    const { data: verification, error: verificationError } =
      await authenticatedSupabase
        .from("complaint_verifications")
        .insert({
          complaint_id: id,
          citizen_id: req.user.id,
          verification_status,
          comment: comment?.trim() || null,
        })
        .select()
        .single();

    if (verificationError) {
      console.error(
        "Create verification error:",
        verificationError
      );

      return res.status(400).json({
        success: false,
        message: verificationError.message,
      });
    }

    // Civic Workflow Transition:
    // If still_unresolved: reopen complaint to in_progress and log status history
    // If resolved: log verification confirmation
    if (verification_status === "still_unresolved") {
      await authenticatedSupabase
        .from("complaints")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", id);

      await authenticatedSupabase
        .from("complaint_status_history")
        .insert({
          complaint_id: id,
          old_status: "resolved",
          new_status: "in_progress",
          changed_by: req.user.id,
          comment: `Citizen rejected resolution: ${comment?.trim() || "Problem remains unresolved"}`,
        });
    } else {
      await authenticatedSupabase
        .from("complaint_status_history")
        .insert({
          complaint_id: id,
          old_status: "resolved",
          new_status: "resolved",
          changed_by: req.user.id,
          comment: `Citizen verified and confirmed resolution${comment?.trim() ? `: ${comment.trim()}` : ""}`,
        });
    }

    return res.status(201).json({
      success: true,
      message:
        verification_status === "resolved"
          ? "Resolution confirmed. Thank you for your feedback!"
          : "Feedback received. Complaint has been reopened for further work.",
      verification,
    });
  } catch (error) {
    console.error("Create verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Priority SLA in hours
const SLA_HOURS = {
  urgent: 48,
  high: 72,
  medium: 168, // 7 days
  low: 336,    // 14 days
};

export const getAuthorityAnalytics = async (req, res) => {
  try {
    const { range = "30d", department, status, priority } = req.query;
    const authenticatedSupabase = getSupabase(req);

    // 1. Fetch departments (with fallback to server client if user client has RLS)
    let departments = [];
    const { data: deptData } = await authenticatedSupabase
      .from("departments")
      .select("id, name, description")
      .order("name", { ascending: true });

    if (deptData && deptData.length > 0) {
      departments = deptData;
    } else {
      const { data: fallbackDept } = await supabase
        .from("departments")
        .select("id, name, description")
        .order("name", { ascending: true });
      departments = fallbackDept || [];
    }

    const deptMap = new Map();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    // 2. Determine date ranges
    const now = new Date();
    let days = 30;
    if (range === "7d") days = 7;
    else if (range === "90d") days = 90;
    else if (range === "all") days = null;

    const periodStart = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
    const priorPeriodStart = days ? new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000) : null;

    // 3. Query complaints (selecting only necessary analytics fields)
    let query = authenticatedSupabase
      .from("complaints")
      .select("id, title, category, priority, status, department_id, address, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (priorPeriodStart) {
      query = query.gte("created_at", priorPeriodStart.toISOString());
    }

    const { data: rawComplaints, error: complaintsError } = await query;

    if (complaintsError) {
      console.error("Get authority analytics error:", complaintsError);
      return res.status(400).json({
        success: false,
        message: complaintsError.message,
      });
    }

    const allFetched = rawComplaints || [];

    // Helper to evaluate SLA on a single complaint
    const evaluateSla = (c) => {
      const p = String(c.priority || "medium").toLowerCase();
      const slaLimitHours = SLA_HOURS[p] || SLA_HOURS.medium;
      const slaLimitMs = slaLimitHours * 3600 * 1000;
      const createdTime = new Date(c.created_at).getTime();
      const st = String(c.status || "").toLowerCase();
      const isResolved = st === "resolved";

      if (isResolved) {
        const resolvedTime = new Date(c.updated_at || c.created_at).getTime();
        const durationMs = Math.max(0, resolvedTime - createdTime);
        const breached = durationMs > slaLimitMs;
        return {
          isResolved: true,
          isBreached: breached,
          isApproaching: false,
          durationHours: Number((durationMs / (3600 * 1000)).toFixed(1)),
          slaLimitHours,
        };
      } else {
        const elapsedMs = Math.max(0, now.getTime() - createdTime);
        const elapsedHours = Number((elapsedMs / (3600 * 1000)).toFixed(1));
        const breached = elapsedMs > slaLimitMs;
        const approaching = !breached && elapsedMs >= 0.75 * slaLimitMs;
        const hoursRemaining = Math.max(
          0,
          Number(((slaLimitMs - elapsedMs) / (3600 * 1000)).toFixed(1))
        );
        return {
          isResolved: false,
          isBreached: breached,
          isApproaching: approaching,
          elapsedHours,
          hoursRemaining,
          slaLimitHours,
        };
      }
    };

    // Split into prior period and current period (for trend / comparison)
    let priorPeriodCount = 0;
    const currentPeriodComplaints = [];

    allFetched.forEach((c) => {
      const cDate = new Date(c.created_at);
      if (periodStart) {
        if (cDate >= periodStart) {
          currentPeriodComplaints.push(c);
        } else if (priorPeriodStart && cDate >= priorPeriodStart && cDate < periodStart) {
          priorPeriodCount++;
        }
      } else {
        currentPeriodComplaints.push(c);
      }
    });

    // Apply optional filters (department, status, priority)
    let filtered = currentPeriodComplaints;

    if (department && department !== "all") {
      filtered = filtered.filter((c) => {
        if (department === "unassigned") return !c.department_id;
        return (
          c.department_id === department ||
          deptMap.get(c.department_id)?.toLowerCase() === department.toLowerCase()
        );
      });
    }

    if (status && status !== "all") {
      filtered = filtered.filter((c) => {
        const s = String(c.status || "").toLowerCase();
        if (status === "pending") {
          return (
            s === "submitted" ||
            s === "pending" ||
            s === "under review" ||
            s === "under_review"
          );
        }
        if (status === "in_progress") {
          return (
            s === "in progress" ||
            s === "in_progress" ||
            s === "assigned"
          );
        }
        return s === status.toLowerCase();
      });
    }

    if (priority && priority !== "all") {
      filtered = filtered.filter(
        (c) => String(c.priority || "").toLowerCase() === priority.toLowerCase()
      );
    }

    // 4. Compute Metrics
    const total = filtered.length;
    let pendingCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let rejectedCount = 0;
    let openBreachedCount = 0;
    let openApproachingCount = 0;
    let resolvedBreachedCount = 0;
    let totalResolutionHours = 0;

    const enrichedComplaints = filtered.map((c) => {
      const sla = evaluateSla(c);
      const st = String(c.status || "").toLowerCase();

      if (
        st === "submitted" ||
        st === "pending" ||
        st === "under review" ||
        st === "under_review"
      ) {
        pendingCount++;
        if (sla.isBreached) openBreachedCount++;
        if (sla.isApproaching) openApproachingCount++;
      } else if (
        st === "in progress" ||
        st === "in_progress" ||
        st === "assigned"
      ) {
        inProgressCount++;
        if (sla.isBreached) openBreachedCount++;
        if (sla.isApproaching) openApproachingCount++;
      } else if (st === "resolved") {
        resolvedCount++;
        totalResolutionHours += sla.durationHours;
        if (sla.isBreached) resolvedBreachedCount++;
      } else if (st === "rejected") {
        rejectedCount++;
      }

      return {
        ...c,
        department_name: deptMap.get(c.department_id) || "Unassigned",
        sla,
      };
    });

    const totalBreached = openBreachedCount + resolvedBreachedCount;
    const resolutionRate =
      total > 0 ? Number(((resolvedCount / total) * 100).toFixed(1)) : 0;
    const avgResolutionTimeHours =
      resolvedCount > 0
        ? Number((totalResolutionHours / resolvedCount).toFixed(1))
        : null;
    const complianceRate =
      total > 0
        ? Number((((total - totalBreached) / total) * 100).toFixed(1))
        : 100;

    // Period-over-period percentage change
    let periodChangePercent = null;
    if (days && priorPeriodCount > 0) {
      const diff = total - priorPeriodCount;
      periodChangePercent = Number(((diff / priorPeriodCount) * 100).toFixed(1));
    }

    // 5. Build Continuous Daily Trend (for 7d / 30d / 90d)
    const trendBuckets = [];
    const trendDays = days || 30;
    const dayBucketsMap = new Map();

    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dayBucketsMap.set(key, { date: key, label, total: 0, resolved: 0, pending: 0 });
    }

    filtered.forEach((c) => {
      const key = new Date(c.created_at).toISOString().split("T")[0];
      if (dayBucketsMap.has(key)) {
        const bucket = dayBucketsMap.get(key);
        bucket.total++;
        const st = String(c.status || "").toLowerCase();
        if (st === "resolved") bucket.resolved++;
        else bucket.pending++;
      }
    });

    for (const bucket of dayBucketsMap.values()) {
      trendBuckets.push(bucket);
    }

    // 6. Department Workload
    const deptWorkloadMap = new Map();
    departments.forEach((d) => {
      deptWorkloadMap.set(d.id, {
        id: d.id,
        name: d.name,
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        slaBreached: 0,
        resolutionHoursTotal: 0,
        resolutionRate: 0,
        avgResolutionTimeHours: null,
      });
    });

    deptWorkloadMap.set("unassigned", {
      id: "unassigned",
      name: "Unassigned",
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      slaBreached: 0,
      resolutionHoursTotal: 0,
      resolutionRate: 0,
      avgResolutionTimeHours: null,
    });

    enrichedComplaints.forEach((c) => {
      const key = c.department_id || "unassigned";
      let dStat = deptWorkloadMap.get(key);
      if (!dStat) {
        dStat = {
          id: key,
          name: c.department_name || "Unknown",
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          slaBreached: 0,
          resolutionHoursTotal: 0,
          resolutionRate: 0,
          avgResolutionTimeHours: null,
        };
        deptWorkloadMap.set(key, dStat);
      }

      dStat.total++;
      const st = String(c.status || "").toLowerCase();
      if (
        st === "submitted" ||
        st === "pending" ||
        st === "under review" ||
        st === "under_review"
      ) {
        dStat.pending++;
      } else if (
        st === "in progress" ||
        st === "in_progress" ||
        st === "assigned"
      ) {
        dStat.inProgress++;
      } else if (st === "resolved") {
        dStat.resolved++;
        if (c.sla?.durationHours) {
          dStat.resolutionHoursTotal += c.sla.durationHours;
        }
      }

      if (c.sla?.isBreached) dStat.slaBreached++;
    });

    const departmentWorkload = Array.from(deptWorkloadMap.values())
      .map((d) => {
        const rate =
          d.total > 0 ? Number(((d.resolved / d.total) * 100).toFixed(1)) : 0;
        const avgH =
          d.resolved > 0
            ? Number((d.resolutionHoursTotal / d.resolved).toFixed(1))
            : null;
        return {
          ...d,
          resolutionRate: rate,
          avgResolutionTimeHours: avgH,
        };
      })
      .filter((d) => d.total > 0 || d.id !== "unassigned")
      .sort((a, b) => b.total - a.total);

    // 7. Status Distribution
    const statusDistribution = [
      {
        status: "under_review",
        label: "Under Review / Pending",
        count: pendingCount,
        percentage:
          total > 0 ? Number(((pendingCount / total) * 100).toFixed(1)) : 0,
        color: "#f59e0b",
      },
      {
        status: "in_progress",
        label: "In Progress / Assigned",
        count: inProgressCount,
        percentage:
          total > 0 ? Number(((inProgressCount / total) * 100).toFixed(1)) : 0,
        color: "#3b82f6",
      },
      {
        status: "resolved",
        label: "Resolved",
        count: resolvedCount,
        percentage:
          total > 0 ? Number(((resolvedCount / total) * 100).toFixed(1)) : 0,
        color: "#10b981",
      },
      {
        status: "rejected",
        label: "Rejected",
        count: rejectedCount,
        percentage:
          total > 0 ? Number(((rejectedCount / total) * 100).toFixed(1)) : 0,
        color: "#ef4444",
      },
    ];

    // 8. Priority Distribution
    const priorityCounts = { urgent: 0, high: 0, medium: 0, low: 0 };
    enrichedComplaints.forEach((c) => {
      const p = String(c.priority || "medium").toLowerCase();
      if (priorityCounts[p] !== undefined) priorityCounts[p]++;
      else priorityCounts.medium++;
    });

    const priorityDistribution = [
      {
        priority: "urgent",
        label: "Urgent",
        count: priorityCounts.urgent,
        percentage:
          total > 0 ? Number(((priorityCounts.urgent / total) * 100).toFixed(1)) : 0,
        color: "#dc2626",
      },
      {
        priority: "high",
        label: "High",
        count: priorityCounts.high,
        percentage:
          total > 0 ? Number(((priorityCounts.high / total) * 100).toFixed(1)) : 0,
        color: "#f97316",
      },
      {
        priority: "medium",
        label: "Medium",
        count: priorityCounts.medium,
        percentage:
          total > 0 ? Number(((priorityCounts.medium / total) * 100).toFixed(1)) : 0,
        color: "#eab308",
      },
      {
        priority: "low",
        label: "Low",
        count: priorityCounts.low,
        percentage:
          total > 0 ? Number(((priorityCounts.low / total) * 100).toFixed(1)) : 0,
        color: "#22c55e",
      },
    ];

    // 9. Category Distribution
    const catMap = new Map();
    enrichedComplaints.forEach((c) => {
      const cat = c.category || "General";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const categoryDistribution = Array.from(catMap.entries())
      .map(([cat, count]) => ({
        category: cat,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 10. City Pulse Insights (Real-data facts only!)
    const topDept = departmentWorkload.find((d) => d.total > 0 && d.id !== "unassigned");
    const largestPendingDept = [...departmentWorkload]
      .filter((d) => d.id !== "unassigned")
      .sort(
        (a, b) =>
          b.pending + b.inProgress - (a.pending + a.inProgress)
      )[0];
    const topCat = categoryDistribution[0];
    const urgentCount = priorityCounts.urgent + priorityCounts.high;
    const unresolvedCount = pendingCount + inProgressCount;

    const cityPulseHighlights = [];
    if (total === 0) {
      cityPulseHighlights.push("No civic complaints recorded in this period.");
    } else {
      if (topDept && topDept.total > 0) {
        cityPulseHighlights.push(
          `${topDept.name} manages the highest workload with ${topDept.total} complaint${
            topDept.total > 1 ? "s" : ""
          } (${((topDept.total / total) * 100).toFixed(0)}% of total volume).`
        );
      }
      if (topCat && topCat.count > 0) {
        cityPulseHighlights.push(
          `"${topCat.category}" is the most reported issue category with ${topCat.count} report${
            topCat.count > 1 ? "s" : ""
          }.`
        );
      }
      if (openBreachedCount > 0) {
        cityPulseHighlights.push(
          `${openBreachedCount} open complaint${
            openBreachedCount > 1 ? "s have" : " has"
          } breached the municipal resolution SLA and require immediate operational attention.`
        );
      }
      if (openApproachingCount > 0) {
        cityPulseHighlights.push(
          `${openApproachingCount} complaint${
            openApproachingCount > 1 ? "s are" : " is"
          } approaching SLA deadlines (>75% window elapsed).`
        );
      }
      if (urgentCount > 0) {
        cityPulseHighlights.push(
          `${urgentCount} ticket${urgentCount > 1 ? "s are" : " is"} flagged with Urgent or High priority.`
        );
      }
      if (periodChangePercent !== null) {
        const direction = periodChangePercent >= 0 ? "increase" : "decrease";
        cityPulseHighlights.push(
          `Complaint inflow shows a ${Math.abs(periodChangePercent)}% ${direction} compared to the previous period.`
        );
      }
    }

    const cityPulse = {
      topDepartment: topDept ? { name: topDept.name, count: topDept.total } : null,
      largestPendingDepartment:
        largestPendingDept &&
        largestPendingDept.pending + largestPendingDept.inProgress > 0
          ? {
              name: largestPendingDept.name,
              pendingCount:
                largestPendingDept.pending + largestPendingDept.inProgress,
            }
          : null,
      topCategory: topCat ? { category: topCat.category, count: topCat.count } : null,
      urgentCount,
      unresolvedCount,
      periodChangePercent,
      priorPeriodCount,
      highlights: cityPulseHighlights,
    };

    // 11. "Needs Attention" Priority Queue (Top 8 urgent/breached/overdue tickets)
    const openTickets = enrichedComplaints.filter((c) => {
      const st = String(c.status || "").toLowerCase();
      return st !== "resolved" && st !== "rejected";
    });

    openTickets.sort((a, b) => {
      if (a.sla?.isBreached && !b.sla?.isBreached) return -1;
      if (!a.sla?.isBreached && b.sla?.isBreached) return 1;

      const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const wa = weight[String(a.priority || "").toLowerCase()] || 2;
      const wb = weight[String(b.priority || "").toLowerCase()] || 2;
      if (wa !== wb) return wb - wa;

      if (a.sla?.isApproaching && !b.sla?.isApproaching) return -1;
      if (!a.sla?.isApproaching && b.sla?.isApproaching) return 1;

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const needsAttentionQueue = openTickets.slice(0, 8).map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      address: c.address,
      department_id: c.department_id,
      department_name: c.department_name,
      created_at: c.created_at,
      sla: c.sla,
    }));

    return res.json({
      success: true,
      data: {
        summary: {
          total,
          pending: pendingCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          rejected: rejectedCount,
          slaBreached: totalBreached,
          openSlaBreached: openBreachedCount,
          slaApproaching: openApproachingCount,
          resolutionRate,
          avgResolutionTimeHours,
          complianceRate,
        },
        trends: trendBuckets,
        departmentWorkload,
        statusDistribution,
        priorityDistribution,
        categoryDistribution,
        slaPerformance: {
          withinSla: total - totalBreached,
          breached: totalBreached,
          approaching: openApproachingCount,
          complianceRate,
        },
        cityPulse,
        needsAttentionQueue,
        departments,
      },
    });
  } catch (error) {
    console.error("Authority analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error calculating analytics",
    });
  }
};


// Public: City Civic Pulse Analytics (privacy-safe, aggregated, public access)
export const getPublicCivicPulseAnalytics = async (req, res) => {
  try {
    const { range = "30d" } = req.query;

    const client = getSupabase(req);

    // 1. Fetch departments
    let departments = [];
    const { data: deptData } = await client
      .from("departments")
      .select("id, name")
      .order("name", { ascending: true });

    if (deptData && deptData.length > 0) {
      departments = deptData;
    } else {
      const { data: fallbackDept } = await supabase
        .from("departments")
        .select("id, name")
        .order("name", { ascending: true });
      departments = fallbackDept || [];
    }

    const deptMap = new Map();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    // 2. Date ranges
    const now = new Date();
    let days = 30;
    if (range === "7d") days = 7;
    else if (range === "90d") days = 90;
    else if (range === "all") days = null;

    const periodStart = days
      ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      : null;

    // 3. Query complaints (selecting strictly non-sensitive fields)
    let query = client
      .from("complaints")
      .select("id, category, status, department_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (periodStart) {
      query = query.gte("created_at", periodStart.toISOString());
    }

    let { data: complaints, error: complaintsError } = await query;

    if (complaintsError || !complaints) {
      let fallbackQuery = supabase
        .from("complaints")
        .select("id, category, status, department_id, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (periodStart) {
        fallbackQuery = fallbackQuery.gte("created_at", periodStart.toISOString());
      }
      const { data: fbData } = await fallbackQuery;
      complaints = fbData || [];
    }

    const allComplaints = complaints || [];
    const total = allComplaints.length;

    let pendingCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let rejectedCount = 0;

    allComplaints.forEach((c) => {
      const st = String(c.status || "").toLowerCase();
      if (
        st === "submitted" ||
        st === "pending" ||
        st === "under review" ||
        st === "under_review"
      ) {
        pendingCount++;
      } else if (
        st === "in progress" ||
        st === "in_progress" ||
        st === "assigned"
      ) {
        inProgressCount++;
      } else if (st === "resolved") {
        resolvedCount++;
      } else if (st === "rejected") {
        rejectedCount++;
      }
    });

    const resolutionRate =
      total > 0 ? Number(((resolvedCount / total) * 100).toFixed(1)) : 0;

    // 4. Query Resolution & Verification metrics (real data only)
    let resolutionsCount = 0;
    let verifications = [];

    try {
      const { data: resData } = await client
        .from("complaint_resolutions")
        .select("id, complaint_id, created_at");
      resolutionsCount = resData?.length || 0;
    } catch {
      // Graceful fallback
    }

    try {
      const { data: verData } = await client
        .from("complaint_verifications")
        .select("id, complaint_id, verification_status, created_at");
      verifications = verData || [];
    } catch {
      // Graceful fallback
    }

    const citizenVerified = verifications.filter(
      (v) => v.verification_status === "resolved"
    ).length;

    const citizenFlagged = verifications.filter(
      (v) => v.verification_status === "still_unresolved"
    ).length;

    const totalVerified = citizenVerified + citizenFlagged;

    const citizenVerificationRate =
      resolutionsCount > 0
        ? Number(((totalVerified / resolutionsCount) * 100).toFixed(1))
        : null;

    const resolutionSuccessRate =
      totalVerified > 0
        ? Number(((citizenVerified / totalVerified) * 100).toFixed(1))
        : null;

    const resolutionImpact = {
      resolutionsSubmitted: resolutionsCount,
      citizenVerified,
      citizenFlagged,
      citizenVerificationRate,
      resolutionSuccessRate,
      hasSufficientData: resolutionsCount > 0,
    };

    // 5. Continuous Daily Trend
    const trendDays = days || 30;
    const dayBucketsMap = new Map();

    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dayBucketsMap.set(key, { date: key, label, total: 0, resolved: 0, pending: 0 });
    }

    allComplaints.forEach((c) => {
      const key = new Date(c.created_at).toISOString().split("T")[0];
      if (dayBucketsMap.has(key)) {
        const b = dayBucketsMap.get(key);
        b.total++;
        const st = String(c.status || "").toLowerCase();
        if (st === "resolved") b.resolved++;
        else b.pending++;
      }
    });

    const trends = Array.from(dayBucketsMap.values());

    // 6. Category Distribution
    const catMap = new Map();
    allComplaints.forEach((c) => {
      const cat = c.category || "General / Other";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const categories = Array.from(catMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 7. Department Performance
    const deptWorkloadMap = new Map();
    departments.forEach((d) => {
      deptWorkloadMap.set(d.id, {
        id: d.id,
        name: d.name,
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        resolutionRate: 0,
      });
    });

    allComplaints.forEach((c) => {
      if (!c.department_id) return;
      let d = deptWorkloadMap.get(c.department_id);
      if (!d) {
        d = {
          id: c.department_id,
          name: deptMap.get(c.department_id) || "Assigned Department",
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          resolutionRate: 0,
        };
        deptWorkloadMap.set(c.department_id, d);
      }
      d.total++;
      const st = String(c.status || "").toLowerCase();
      if (
        st === "submitted" ||
        st === "pending" ||
        st === "under review" ||
        st === "under_review"
      ) {
        d.pending++;
      } else if (
        st === "in progress" ||
        st === "in_progress" ||
        st === "assigned"
      ) {
        d.inProgress++;
      } else if (st === "resolved") {
        d.resolved++;
      }
    });

    const departmentPerformance = Array.from(deptWorkloadMap.values())
      .filter((d) => d.total > 0)
      .map((d) => ({
        ...d,
        resolutionRate:
          d.total > 0 ? Number(((d.resolved / d.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // 8. Recent Civic Improvements (Privacy-Safe Summary)
    const recentImprovements = allComplaints
      .filter((c) => String(c.status || "").toLowerCase() === "resolved")
      .slice(0, 8)
      .map((c) => ({
        id: c.id ? c.id.slice(0, 8).toUpperCase() : "RESOLVED",
        category: c.category || "Civic Improvement",
        department_name: deptMap.get(c.department_id) || "Municipal Services",
        resolved_at: c.updated_at || c.created_at,
      }));

    return res.json({
      success: true,
      data: {
        summary: {
          total,
          resolved: resolvedCount,
          pending: pendingCount,
          inProgress: inProgressCount,
          rejected: rejectedCount,
          resolutionRate,
          citizenVerificationRate,
        },
        trends,
        categories,
        departments: departmentPerformance,
        resolutionImpact,
        recentImprovements,
        range,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Public civic pulse error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to calculate public civic pulse analytics",
    });
  }
};
