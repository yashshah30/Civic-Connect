const getProfileClient = (req) => req.supabase;

export const getProfile = async (req, res) => {
  const { data, error } = await getProfileClient(req)
    .from("profiles")
    .select("id, full_name, email, phone, mobile, address, avatar_url, role, created_at")
    .eq("id", req.user.id)
    .single();

  if (error) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  return res.json({ success: true, profile: data });
};

export const updateProfile = async (req, res) => {
  const { name, mobile, address } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  const { data, error } = await getProfileClient(req)
    .from("profiles")
    .upsert({
      id: req.user.id,
      full_name: name.trim(),
      phone: mobile?.trim() || null,
      address: address?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .select("id, full_name, email, phone, mobile, address, avatar_url, role, created_at")
    .single();

  if (error) {
    console.error("Profile update error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }

  return res.json({ success: true, profile: data });
};

export const uploadProfileAvatar = async (req, res) => {
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
};