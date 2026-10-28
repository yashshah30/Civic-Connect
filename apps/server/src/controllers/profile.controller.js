import { createClient } from "@supabase/supabase-js";

const getProfileClient = (req) => {
  if (req.supabase) return req.supabase;
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${req.user?.accessToken || ""}`,
        },
      },
    }
  );
};

export const getProfile = async (req, res) => {
  try {
    const { data, error } = await getProfileClient(req)
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.json({ success: true, profile: data });
  } catch (error) {
    console.error("Get profile server error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const updates = {
      full_name: name.trim(),
      updated_at: new Date().toISOString(),
    };

    if (mobile !== undefined) {
      updates.phone = mobile?.trim() || null;
      updates.mobile = mobile?.trim() || null;
    }

    if (address !== undefined) {
      updates.address = address?.trim() || null;
    }

    // Try update with optional columns; if columns don't exist yet, fallback to full_name only
    let { data, error } = await getProfileClient(req)
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select("*")
      .maybeSingle();

    if (error && (error.message?.includes("column") || error.code === "42703")) {
      const coreResult = await getProfileClient(req)
        .from("profiles")
        .update({
          full_name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.user.id)
        .select("*")
        .maybeSingle();

      data = coreResult.data;
      error = coreResult.error;
    }

    if (error) {
      console.error("Profile update error:", error);
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, profile: data });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const uploadProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const extension = req.file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${req.user.id}/avatar.${extension}`;
    const client = getProfileClient(req);

    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) {
      return res.status(400).json({ success: false, message: uploadError.message });
    }

    const { data: urlData } = client.storage.from("avatars").getPublicUrl(path);
    const { error: profileError } = await client
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", req.user.id);

    if (profileError) {
      return res.status(400).json({ success: false, message: profileError.message });
    }

    return res.json({ success: true, avatarUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Upload profile avatar error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};