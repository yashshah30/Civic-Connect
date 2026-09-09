import { useState, useEffect } from "react";
import Navbar from "../../components/layout/navbar";
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const fallbackProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  mobile: "+91 9876543210",
  address: "123 Civic Street, City Center",
  avatarUrl: "",
  role: "Citizen",
  createdAt: "2026-01-15",
};

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Request failed");
  return data;
};

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    avatarUrl: "",
    role: "Citizen",
    createdAt: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      if (!localStorage.getItem("access_token")) {
        setProfile(fallbackProfile);
        setFormData(fallbackProfile);
        return;
      }

      const { profile: data } = await apiRequest("/api/profile");

      const userProfile = {
        name: data?.full_name || "Citizen User",
        email: data?.email || "",
        mobile: data?.phone || data?.mobile || "",
        address: data?.address || "",
        avatarUrl: data?.avatar_url || "",
        role: "Citizen",
        createdAt: data?.created_at ? new Date(data.created_at).toLocaleDateString() : "N/A",
      };

      setProfile(userProfile);
      setFormData(userProfile);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setMessage({ type: "error", text: "Failed to load profile details." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchUserProfile, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setSaving(true);
      setMessage({ type: "", text: "" });

      const body = new FormData();
      body.append("avatar", file);
      const { avatarUrl: publicUrl } = await apiRequest("/api/profile/avatar", { method: "POST", body });

      setProfile((prev) => ({ ...prev, avatarUrl: publicUrl }));
      setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
      setMessage({ type: "success", text: "Profile picture updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to upload image" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (localStorage.getItem("access_token")) {
        const { profile: updatedProfile } = await apiRequest("/api/profile", {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        setProfile((current) => ({
          ...current,
          name: updatedProfile.full_name,
          mobile: updatedProfile.phone || updatedProfile.mobile || "",
          address: updatedProfile.address || "",
          avatarUrl: updatedProfile.avatar_url || current.avatarUrl,
        }));
      }

      if (!localStorage.getItem("access_token")) setProfile({ ...formData });
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Error updating profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)] text-gray-600 dark:text-gray-300">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Citizen Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message.text && (
          <div
            className={`p-4 mb-6 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative group w-24 h-24">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-blue-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-md">
                  {profile.name ? profile.name.charAt(0) : "C"}
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-black transition shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                {profile.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email (Non-editable)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            {profile.createdAt && (
              <div>
                <label className="block text-sm font-medium mb-1">Account Created On</label>
                <input
                  type="text"
                  value={profile.createdAt}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}