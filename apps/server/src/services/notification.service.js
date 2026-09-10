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

export const createNotification = async ({
  accessToken,
  userId,
  complaintId = null,
  title,
  message,
  type = "general",
}) => {
  try {
    const authenticatedSupabase =
      getAuthenticatedSupabase(accessToken);

    const { data, error } = await authenticatedSupabase
      .from("notifications")
      .insert({
        user_id: userId,
        complaint_id: complaintId,
        title,
        message,
        type,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Create notification error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};