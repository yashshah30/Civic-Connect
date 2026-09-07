import { createClient } from "@supabase/supabase-js";


/**
 * Get complaints.
 * Used by authorities.
 */
export const getComplaints = async (req, res) => {
  try {
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
      .from("complaints")
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        priority,
        status,
        department_id,
        latitude,
        longitude,
        address,
        created_at,
        updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get complaints error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      complaints: data || [],
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * Create a new complaint.
 * Used by citizens.
 */
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

    console.log("Authenticated user ID:", req.user.id);
    console.log("Complaint user ID:", req.user.id);

    const { data, error } = await authenticatedSupabase
      .from("complaints")
      .insert({
        user_id: req.user.id,
        title,
        description,
        category,
        priority: priority || "medium",
        status: "submitted",
        department_id: department_id || null,
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create complaint error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint: data,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * Update complaint status or department.
 * Used by authorities.
 *
 * The database trigger automatically creates
 * citizen notifications when status or department changes.
 */
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department_id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

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

    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (department_id !== undefined) {
      updates.department_id = department_id || null;
    }

    console.log("UPDATE COMPLAINT REQUEST:", {
      complaintId: id,
      updates,
      authorityId: req.user.id,
    });

    const { data, error } = await authenticatedSupabase
      .from("complaints")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update complaint error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.log("COMPLAINT UPDATED:", data.id);

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
