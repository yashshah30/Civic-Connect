const client = (req) => req.supabase;

export const listNotifications = async (req, res) => {
  const { data, error } = await client(req)
    .from("notifications")
    .select("id, message, complaint_id, read, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true, notifications: data });
};

export const markNotificationRead = async (req, res) => {
  const { data, error } = await client(req)
    .from("notifications")
    .update({ read: true })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select("id, message, complaint_id, read, created_at")
    .single();

  if (error) return res.status(404).json({ success: false, message: "Notification not found" });
  return res.json({ success: true, notification: data });
};

export const markAllNotificationsRead = async (req, res) => {
  const { error } = await client(req).from("notifications")
    .update({ read: true }).eq("user_id", req.user.id).eq("read", false);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true });
};

export const clearNotifications = async (req, res) => {
  const { error } = await client(req).from("notifications").delete().eq("user_id", req.user.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true });
};