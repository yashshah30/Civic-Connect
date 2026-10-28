import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

const getSupabaseClient = (req) => {
  if (req.supabase) return req.supabase;
  if (req.user?.accessToken) {
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
  }
  return supabase;
};

export const getDepartments = async (req, res) => {
  try {
    const client = getSupabaseClient(req);

    let { data, error } = await client
      .from("departments")
      .select("id, name, description")
      .order("name", { ascending: true });

    // Fallback to service/standard client if user client has RLS restrictions on departments
    if (error && client !== supabase) {
      console.warn("User client departments fetch failed, falling back to server client:", error.message);
      const fallback = await supabase
        .from("departments")
        .select("id, name, description")
        .order("name", { ascending: true });

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Get departments error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch departments",
      });
    }

    return res.json({
      success: true,
      departments: data || [],
    });
  } catch (error) {
    console.error("Get departments server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

