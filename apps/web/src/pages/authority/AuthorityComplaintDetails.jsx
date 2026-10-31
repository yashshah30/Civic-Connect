import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheckCircle, FiUploadCloud, FiImage, FiClock } from "react-icons/fi";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";
import StatusUpdateModal from "../../components/authority/StatusUpdateModal";
import SubmitResolutionModal from "../../components/authority/SubmitResolutionModal";
import ResolutionEvidenceViewer from "../../components/resolution/ResolutionEvidenceViewer";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) {
    return "Medium";
  }

  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  try {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
};

export default function AuthorityComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [verification, setVerification] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleStatusUpdate = async (newStatus, comment) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Please log in again.");

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            comment: comment?.trim() || null,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update complaint status.");
      }

      setComplaint((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update status.");
    }
  };

  const fetchResolution = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${id}/resolution`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResolution(data.resolution || null);
          setVerification(data.verification || null);
        }
      }
    } catch (resErr) {
      console.warn("Could not load resolution data:", resErr);
    }
  };

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/authority/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load complaint.");
      }

      setComplaint(data.complaint);
      await fetchResolution();
    } catch (error) {
      console.error("Fetch complaint error:", error);
      setError(error.message || "Failed to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleResolutionSuccess = (newResolution) => {
    setResolution(newResolution);
    setComplaint((prev) => ({
      ...prev,
      status: "resolved",
      updated_at: new Date().toISOString(),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading complaint...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-bold text-blue-900">Civic Connect</h1>
              <p className="text-xs text-slate-500">Authority Portal</p>
            </div>
            <Link
              to="/authority/complaints"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Complaints
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800">
              Unable to load complaint
            </h2>
            <p className="mt-2 text-sm text-red-700">
              {error || "Complaint not found."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const priority = formatPriority(complaint.priority);
  const status = complaint.status || "submitted";
  const initialMedia = complaint.complaint_media?.[0]?.file_url || "";

  // Clearly differentiate resolution & verification status
  const displayStatus = (() => {
    if (resolution) {
      if (!verification) {
        return "Resolution Submitted (Awaiting Verification)";
      }
      if (verification.verification_status === "resolved") {
        return "Citizen Verified";
      }
      if (verification.verification_status === "still_unresolved") {
        return "Citizen Flagged Unresolved";
      }
    }
    return formatStatus(status);
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Civic Connect</h1>
            <p className="text-xs text-slate-500">Authority Portal</p>
          </div>

          <Link
            to="/authority/complaints"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Complaints
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section>
          <p className="text-sm font-medium text-blue-800">Complaint Details</p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {complaint.title || complaint.category || "Complaint"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                Complaint ID: {complaint.id}
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {priority} Priority
            </span>
          </div>
        </section>

        {/* Complaint Information */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Resolution Center Viewer (if resolution exists) */}
            {resolution && (
              <ResolutionEvidenceViewer
                resolution={resolution}
                verification={verification}
                complaintTitle={complaint.title}
              />
            )}

            {/* Complaint Information Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Complaint ID</p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="mt-1 font-semibold text-slate-800 capitalize">
                    {complaint.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Date Submitted</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(complaint.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Current Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                      resolution && !verification
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : verification?.verification_status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : verification?.verification_status === "still_unresolved"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {displayStatus}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.department?.name ||
                      complaint.department_id ||
                      "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">Description</p>
                <p className="mt-2 leading-7 text-slate-700">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Citizen Submitted Evidence Images */}
            {complaint.complaint_media?.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FiImage className="text-blue-900" />
                  Initial Citizen Photos
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {complaint.complaint_media.map((media) => (
                    <div
                      key={media.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={media.file_url}
                        alt={media.file_name || "Complaint evidence"}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Location</h3>
              <p className="mt-3 text-slate-700">
                {complaint.address || "Address not provided"}
              </p>
              {complaint.latitude != null && complaint.longitude != null && (
                <p className="mt-1 text-xs text-slate-500">
                  Coordinates: {complaint.latitude}, {complaint.longitude}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Citizen Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Citizen Information
              </h3>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Citizen ID</p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.user_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reported Address</p>
                  <p className="mt-1 text-slate-700">
                    {complaint.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Authority Actions & Resolution Center */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Authority Actions
              </h3>

              <div className="mt-4 space-y-3">
                {/* Submit / Update Resolution Proof Button */}
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <FiCheckCircle className="text-base" />
                  {resolution
                    ? "Update Resolution Proof"
                    : "Submit Resolution Proof"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Assign Department
                </button>

                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="w-full rounded-xl border border-blue-900 px-4 py-3 text-sm font-medium text-blue-900 transition hover:bg-blue-50"
                >
                  Change Status
                </button>
              </div>
            </div>

            {/* Quick Resolution Summary Card */}
            {resolution && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <FiCheckCircle className="text-base" />
                  Resolution Recorded
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {resolution.resolution_description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-emerald-100 pt-2">
                  <span>Resolved: {formatDate(resolution.created_at)}</span>
                  {verification ? (
                    <span className="font-semibold text-emerald-700">
                      Citizen Verified
                    </span>
                  ) : (
                    <span className="font-medium text-amber-700">
                      Awaiting Verification
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Status Timeline */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Status Timeline
          </h3>

          <div className="mt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-blue-800" />
              </div>

              <div className="pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-800">
                    {displayStatus}
                  </h4>

                  <span className="text-xs text-slate-400">
                    {formatDate(complaint.updated_at || complaint.created_at)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {resolution && !verification
                    ? "Resolution evidence submitted by authority; awaiting citizen verification."
                    : verification?.verification_status === "resolved"
                    ? "Resolution confirmed and closed by citizen."
                    : verification?.verification_status === "still_unresolved"
                    ? "Citizen flagged resolution as incomplete; complaint reopened."
                    : "Current complaint status."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AssignComplaintModal
        isOpen={isAssignModalOpen}
        complaintId={complaint.id}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={(updatedComplaint) => {
          setComplaint(updatedComplaint);
        }}
      />

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        currentStatus={complaint.status}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={handleStatusUpdate}
      />

      <SubmitResolutionModal
        isOpen={isResolutionModalOpen}
        complaintId={complaint.id}
        complaintTitle={complaint.title}
        initialBeforeImageUrl={initialMedia}
        onClose={() => setIsResolutionModalOpen(false)}
        onSuccess={handleResolutionSuccess}
      />
    </div>
  );
}
