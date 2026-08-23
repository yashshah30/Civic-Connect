import { createClient } from "@supabase/supabase-js";

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
      address
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required"
      });
    }

    const authenticatedSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`
          }
        }
      }
    );

    console.log("Authenticated user ID:", req.user.id);

    const { data, error } = await authenticatedSupabase
      .from("complaints")
      .insert({
        user_id: req.user.id,
        title,
        description,
        category,
        priority: priority || "medium",
        status: "pending",
        department_id: department_id || null,
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || null
      })
      .select()
      .single();

    if (error) {
      console.error("Create complaint error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint: data
    });

  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
