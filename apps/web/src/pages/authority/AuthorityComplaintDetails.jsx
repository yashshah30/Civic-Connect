import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
  "pending",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
];

const PRIORITY_OPTIONS = [
  "low",
  "medium",
  "high",
  "urgent",
];

function formatStatus(value) {
  const map = {
    pending: "Submitted",
    submitted: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return map[String(value || "").toLowerCase()] || value || "Submitted";
}

function formatPriority(value) {
  const map = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  return map[String(value || "").toLowerCase()] || value || "Medium";
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "Submitted":
      return "bg-slate-100 text-slate-700";

    case "Under Review":
      return "bg-blue-100 text-blue-700";

    case "Assigned":
      return "bg-purple-100 text-purple-700";

    case "In Progress":
      return "bg-yellow-100 text-yellow-700";

    case "Resolved":
      return "bg-green-100 text-green-700";

    case "Rejected":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Medium":
      return "bg-yellow-100 text-yellow-700";

    case "Low":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getSlaClass(status) {
  switch (status) {
    case "within":
      return "bg-green-100 text-green-700";

    case "near_deadline":
      return "bg-yellow-100 text-yellow-700";

    case "overdue":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getSlaIcon(status) {
  switch (status) {
    case "within":
      return "🟢";

    case "near_deadline":
      return "🟡";

    case "overdue":
      return "🔴";

    default:
      return "⚪";
  }
}

export default function AuthorityComplaintDetails() {
  const { id } = useParams();

  // ============================================================
  // COMPLAINT STATE
  // ============================================================

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // TIMELINE
  // ============================================================

  const [history, setHistory] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  // ============================================================
  // COMMENTS
  // ============================================================

  const [comments, setComments] = useState([]);

  const [comment, setComment] = useState("");

  const [commentLoading, setCommentLoading] = useState(false);

  // ============================================================
  // MODALS
  // ============================================================

  const [isAssignModalOpen, setIsAssignModalOpen] =
    useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] =
    useState(false);

  const [isPriorityModalOpen, setIsPriorityModalOpen] =
    useState(false);

  const [isResolutionOpen, setIsResolutionOpen] =
    useState(false);

  const [isRejectionOpen, setIsRejectionOpen] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState(null);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [selectedStatus, setSelectedStatus] =
    useState("pending");

  const [selectedPriority, setSelectedPriority] =
    useState("medium");

  const [statusComment, setStatusComment] =
    useState("");

  const [resolutionNote, setResolutionNote] =
    useState("");

  const [resolutionDescription, setResolutionDescription] =
    useState("");

  const [beforeImage, setBeforeImage] =
    useState("");

  const [afterImage, setAfterImage] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  // ============================================================
  // AUTH
  // ============================================================

  function getHeaders() {
    const token = localStorage.getItem("access_token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  // ============================================================
  // FETCH COMPLAINT
  // ============================================================

  async function fetchComplaint() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/complaints/${id}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load complaint."
        );
      }

      setComplaint(data.complaint);

      setSelectedStatus(
        data.complaint.status || "pending"
      );

      setSelectedPriority(
        data.complaint.priority || "medium"
      );

      setResolutionNote(
        data.complaint.resolution?.note || ""
      );

      setResolutionDescription(
        data.complaint.resolution?.description || ""
      );

      setBeforeImage(
        data.complaint.resolution?.before_image ||
          ""
      );

      setAfterImage(
        data.complaint.resolution?.after_image ||
          ""
      );
    } catch (err) {
      console.error("Fetch complaint error:", err);

      setError(
        err.message ||
          "Unable to load complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FETCH HISTORY
  // ============================================================

  async function fetchHistory() {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/history`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load complaint history."
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("History error:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  // ============================================================
  // FETCH COMMENTS
  // ============================================================

  async function fetchComments() {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/${id}/comments`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setComments(data.comments || []);
    } catch (err) {
      console.error("Comments error:", err);
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!id) return;

    fetchComplaint();
    fetchHistory();
    fetchComments();
  }, [id]);

  // ============================================================
  // REFRESH EVERYTHING
  // ============================================================

  async function refreshData() {
    await Promise.all([
      fetchComplaint(),
      fetchHistory(),
      fetchComments(),
    ]);
  }

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  async function handleStatusUpdate() {
    if (!selectedStatus) return;

    const confirmed = window.confirm(
      `Are you sure you want to change the complaint status to "${formatStatus(
        selectedStatus
      )}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: selectedStatus,
            comment:
              statusComment.trim() ||
              `Status changed to ${formatStatus(
                selectedStatus
              )}.`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status."
        );
      }

      setIsStatusModalOpen(false);
      setStatusComment("");

      await refreshData();
    } catch (err) {
      alert(
        err.message ||
          "Failed to update complaint status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ============================================================
  // UPDATE PRIORITY
  // ============================================================

  async function handlePriorityUpdate() {
    const confirmed = window.confirm(
      `Change priority to "${formatPriority(
        selectedPriority
      )}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/priority`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            priority: selectedPriority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update priority."
        );
      }

      setIsPriorityModalOpen(false);

      await refreshData();
    } catch (err) {
      alert(
        err.message ||
          "Failed to update priority."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ============================================================
  // ADD COMMENT
  // ============================================================

  async function handleAddComment() {
    if (!comment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      setCommentLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/comment`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add comment."
        );
      }

      setComment("");

      await fetchComments();
    } catch (err) {
      alert(
        err.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentLoading(false);
    }
  }

  // ============================================================
  // RESOLVE COMPLAINT
  // ============================================================

  async function handleResolve() {
    if (!resolutionNote.trim()) {
      alert("Resolution note is required.");
      return;
    }

    if (!resolutionDescription.trim()) {
      alert(
        "Resolution description is required."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to mark this complaint as resolved?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/resolve`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            note: resolutionNote.trim(),
            description:
              resolutionDescription.trim(),
            before_image:
              beforeImage.trim() || null,
            after_image:
              afterImage.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to resolve complaint."
        );
      }

      setIsResolutionOpen(false);

      await refreshData();
    } catch (err) {
      alert(
        err.message ||
          "Failed to resolve complaint."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ============================================================
  // REJECT COMPLAINT
  // ============================================================

  async function handleReject() {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this complaint?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/reject`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            reason: rejectionReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject complaint."
        );
      }

      setRejectionReason("");
      setIsRejectionOpen(false);

      await refreshData();
    } catch (err) {
      alert(
        err.message ||
          "Failed to reject complaint."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ============================================================
  // RESOLUTION PROOF
  // ============================================================

  async function handleResolutionProof() {
    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/complaints/${id}/resolution-proof`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            before_image:
              beforeImage.trim() || null,
            after_image:
              afterImage.trim() || null,
            description:
              resolutionDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update resolution proof."
        );
      }

      await refreshData();

      alert(
        "Resolution proof updated successfully."
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update resolution proof."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ============================================================
  // ASSIGNMENT SUCCESS
  // ============================================================

  async function handleAssignmentComplete() {
    setIsAssignModalOpen(false);

    await refreshData();
  }

  // ============================================================
  // IMAGE LIST
  // ============================================================

  const complaintImages = useMemo(() => {
    if (!complaint?.images) return [];

    return Array.isArray(complaint.images)
      ? complaint.images
      : [];
  }, [complaint]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold text-blue-900">
              Civic Connect
            </h1>

            <p className="text-xs text-slate-500">
              Authority Portal
            </p>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading complaint...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-bold text-blue-900">
                Civic Connect
              </h1>

              <p className="text-xs text-slate-500">
                Authority Portal
              </p>
            </div>

            <Link
              to="/authority/complaints"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to Load Complaint
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "Complaint not found."}
            </p>

            <button
              type="button"
              onClick={fetchComplaint}
              className="mt-6 rounded-lg bg-blue-900 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusText = formatStatus(
    complaint.status
  );

  const priorityText = formatPriority(
    complaint.priority
  );

  const department =
    complaint.department?.name ||
    "Not assigned";

  const official =
    complaint.official?.full_name ||
    "Not assigned";

  const sla = complaint.sla;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-blue-900">
              Civic Connect
            </h1>

            <p className="text-xs text-slate-500">
              Authority Portal
            </p>
          </div>

          <Link
            to="/authority/complaints"
            className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Complaints
          </Link>
        </div>
      </nav>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}

        <section>
          <p className="text-sm font-medium text-blue-800">
            Complaint Details
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {complaint.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaint ID:{" "}
                <span className="font-medium">
                  {complaint.id}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                  statusText
                )}`}
              >
                {statusText}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getPriorityClass(
                  priorityText
                )}`}
              >
                {priorityText} Priority
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            ACTION BUTTONS
        ===================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setIsAssignModalOpen(true)
              }
              className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Assign Complaint
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus(
                  complaint.status || "pending"
                );

                setIsStatusModalOpen(true);
              }}
              className="rounded-lg border border-blue-900 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              Update Status
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPriority(
                  complaint.priority || "medium"
                );

                setIsPriorityModalOpen(true);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Change Priority
            </button>

            <button
              type="button"
              onClick={() =>
                setIsResolutionOpen(true)
              }
              className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Resolve Complaint
            </button>

            <button
              type="button"
              onClick={() =>
                setIsRejectionOpen(true)
              }
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        </section>

        {/* ====================================================
            SLA
        ===================================================== */}

        {sla && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  SLA Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Deadline:{" "}
                  {formatDate(sla.deadline)}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getSlaClass(
                  sla.status
                )}`}
              >
                {getSlaIcon(sla.status)}{" "}
                {sla.label}
              </span>
            </div>
          </section>
        )}

        {/* ====================================================
            COMPLAINT INFORMATION
        ===================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* DESCRIPTION */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Complaint ID"
                  value={complaint.id}
                />

                <InfoItem
                  label="Category"
                  value={complaint.category}
                />

                <InfoItem
                  label="Created"
                  value={formatDate(
                    complaint.created_at
                  )}
                />

                <InfoItem
                  label="Last Updated"
                  value={formatDate(
                    complaint.updated_at
                  )}
                />

                <InfoItem
                  label="Department"
                  value={department}
                />

                <InfoItem
                  label="Assigned Official"
                  value={official}
                />
              </div>

              <div className="mt-6 border-t pt-5">
                <p className="text-sm font-medium text-slate-500">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* CITIZEN */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Citizen Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Name"
                  value={
                    complaint.citizen
                      ?.full_name ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    complaint.citizen
                      ?.email ||
                    "Not available"
                  }
                />
              </div>
            </div>

            {/* LOCATION */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <p className="mt-4 text-sm text-slate-700">
                {complaint.address ||
                  "Address not available"}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Latitude"
                  value={
                    complaint.latitude ??
                    "Not available"
                  }
                />

                <InfoItem
                  label="Longitude"
                  value={
                    complaint.longitude ??
                    "Not available"
                  }
                />
              </div>

              {complaint.latitude &&
                complaint.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-block rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                  >
                    Open Location in Maps
                  </a>
                )}
            </div>

            {/* COMPLAINT IMAGES */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Complaint Evidence
                </h3>

                <span className="text-sm text-slate-500">
                  {complaintImages.length} image
                  {complaintImages.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              {complaintImages.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No complaint images available.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {complaintImages.map(
                    (image, index) => (
                      <button
                        key={
                          image.id ||
                          `${image.url}-${index}`
                        }
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            image.url
                          )
                        }
                        className="group overflow-hidden rounded-xl border border-slate-200 text-left"
                      >
                        <img
                          src={image.url}
                          alt={
                            image.name ||
                            `Complaint evidence ${
                              index + 1
                            }`
                          }
                          className="h-48 w-full object-cover transition group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-800">
                            {image.name ||
                              `Evidence ${
                                index + 1
                              }`}
                          </p>

                          {image.type && (
                            <p className="mt-1 text-xs capitalize text-slate-500">
                              {image.type}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* RESOLUTION PROOF */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Resolution Proof
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Before/After evidence and
                    resolution description.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleResolutionProof
                  }
                  disabled={actionLoading}
                  className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
                >
                  Save Proof
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProofInput
                  label="Before Image URL"
                  value={beforeImage}
                  onChange={setBeforeImage}
                  placeholder="Paste before-image URL"
                />

                <ProofInput
                  label="After Image URL"
                  value={afterImage}
                  onChange={setAfterImage}
                  placeholder="Paste after-image URL"
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-slate-700">
                  Resolution Description
                </label>

                <textarea
                  value={resolutionDescription}
                  onChange={(event) =>
                    setResolutionDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe how the complaint was resolved..."
                  className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <ProofPreview
                  title="Before"
                  url={beforeImage}
                  onClick={() =>
                    setSelectedImage(
                      beforeImage
                    )
                  }
                />

                <ProofPreview
                  title="After"
                  url={afterImage}
                  onClick={() =>
                    setSelectedImage(
                      afterImage
                    )
                  }
                />
              </div>
            </div>

            {/* COMMENTS */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Authority Comments
              </h3>

              <div className="mt-5">
                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
                />

                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={commentLoading}
                  className="mt-3 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {commentLoading
                    ? "Adding..."
                    : "Add Comment"}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <p className="text-sm text-slate-800">
                        {item.comment}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(
                          item.created_at
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE
          =================================================== */}

          <div className="space-y-6">
            {/* ASSIGNMENT */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Assignment
              </h3>

              <div className="mt-5 space-y-4">
                <InfoItem
                  label="Department"
                  value={department}
                />

                <InfoItem
                  label="Official"
                  value={official}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsAssignModalOpen(true)
                }
                className="mt-5 w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                {department ===
                  "Not assigned"
                  ? "Assign Department"
                  : "Change Assignment"}
              </button>
            </div>

            {/* STATUS */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Current Status
              </h3>

              <span
                className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                  statusText
                )}`}
              >
                {statusText}
              </span>

              <button
                type="button"
                onClick={() =>
                  setIsStatusModalOpen(true)
                }
                className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Update Status
              </button>
            </div>

            {/* PRIORITY */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Priority
              </h3>

              <span
                className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPriorityClass(
                  priorityText
                )}`}
              >
                {priorityText}
              </span>

              <button
                type="button"
                onClick={() =>
                  setIsPriorityModalOpen(
                    true
                  )
                }
                className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Change Priority
              </button>
            </div>

            {/* TIMELINE */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Timeline
              </h3>

              {historyLoading ? (
                <p className="mt-5 text-sm text-slate-500">
                  Loading timeline...
                </p>
              ) : history.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No timeline entries available.
                </p>
              ) : (
                <div className="mt-6 space-y-6">
                  {history.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        className="relative pl-7"
                      >
                        {index <
                          history.length -
                            1 && (
                          <div className="absolute left-2 top-5 h-full w-px bg-slate-200" />
                        )}

                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-blue-900 ring-4 ring-blue-100" />

                        <p className="font-semibold text-slate-800">
                          {formatStatus(
                            item.new_status
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            item.created_at
                          )}
                        </p>

                        {item.comment && (
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            {item.comment}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================
          ASSIGN MODAL
      ======================================================= */}

      <AssignComplaintModal
        isOpen={isAssignModalOpen}
        onClose={() =>
          setIsAssignModalOpen(false)
        }
        complaintId={id}
        currentDepartmentId={
          complaint.department_id
        }
        currentOfficialId={
          complaint.official_id
        }
        onAssigned={
          handleAssignmentComplete
        }
      />

      {/* ======================================================
          STATUS MODAL
      ======================================================= */}

      {isStatusModalOpen && (
        <Modal
          title="Update Complaint Status"
          onClose={() =>
            setIsStatusModalOpen(false)
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            New Status
          </label>

          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          >
            {STATUS_OPTIONS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {formatStatus(item)}
              </option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Comment
          </label>

          <textarea
            value={statusComment}
            onChange={(event) =>
              setStatusComment(
                event.target.value
              )
            }
            rows={3}
            placeholder="Reason or update..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          />

          <ModalActions
            onCancel={() =>
              setIsStatusModalOpen(false)
            }
            onConfirm={handleStatusUpdate}
            loading={actionLoading}
            confirmText="Update Status"
          />
        </Modal>
      )}

      {/* ======================================================
          PRIORITY MODAL
      ======================================================= */}

      {isPriorityModalOpen && (
        <Modal
          title="Change Priority"
          onClose={() =>
            setIsPriorityModalOpen(false)
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            value={selectedPriority}
            onChange={(event) =>
              setSelectedPriority(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          >
            {PRIORITY_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatPriority(item)}
                </option>
              )
            )}
          </select>

          <ModalActions
            onCancel={() =>
              setIsPriorityModalOpen(
                false
              )
            }
            onConfirm={handlePriorityUpdate}
            loading={actionLoading}
            confirmText="Update Priority"
          />
        </Modal>
      )}

      {/* ======================================================
          RESOLUTION MODAL
      ======================================================= */}

      {isResolutionOpen && (
        <Modal
          title="Resolve Complaint"
          onClose={() =>
            setIsResolutionOpen(false)
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Resolution Note *
          </label>

          <textarea
            value={resolutionNote}
            onChange={(event) =>
              setResolutionNote(
                event.target.value
              )
            }
            rows={3}
            placeholder="Enter resolution note..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          />

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Resolution Description *
          </label>

          <textarea
            value={resolutionDescription}
            onChange={(event) =>
              setResolutionDescription(
                event.target.value
              )
            }
            rows={4}
            placeholder="Explain how the issue was resolved..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          />

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Before Image URL
          </label>

          <input
            value={beforeImage}
            onChange={(event) =>
              setBeforeImage(
                event.target.value
              )
            }
            placeholder="Paste before image URL"
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          />

          <label className="mt-5 block text-sm font-medium text-slate-700">
            After Image URL
          </label>

          <input
            value={afterImage}
            onChange={(event) =>
              setAfterImage(
                event.target.value
              )
            }
            placeholder="Paste after image URL"
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
          />

          <ModalActions
            onCancel={() =>
              setIsResolutionOpen(false)
            }
            onConfirm={handleResolve}
            loading={actionLoading}
            confirmText="Resolve Complaint"
            confirmClass="bg-green-700 hover:bg-green-800"
          />
        </Modal>
      )}

      {/* ======================================================
          REJECTION MODAL
      ======================================================= */}

      {isRejectionOpen && (
        <Modal
          title="Reject Complaint"
          onClose={() =>
            setIsRejectionOpen(false)
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Rejection Reason *
          </label>

          <textarea
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            rows={5}
            placeholder="Enter the reason for rejecting this complaint..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-600"
          />

          <ModalActions
            onCancel={() =>
              setIsRejectionOpen(false)
            }
            onConfirm={handleReject}
            loading={actionLoading}
            confirmText="Reject Complaint"
            confirmClass="bg-red-600 hover:bg-red-700"
          />
        </Modal>
      )}

      {/* ======================================================
          IMAGE VIEWER
      ======================================================= */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage}
              alt="Full size evidence"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />

            <button
              type="button"
              onClick={() =>
                setSelectedImage(null)
              }
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1.5 text-lg font-bold text-slate-800 shadow"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

// ============================================================
// PROOF INPUT
// ============================================================

function ProofInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="url"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-900"
      />
    </div>
  );
}

// ============================================================
// PROOF PREVIEW
// ============================================================

function ProofPreview({
  title,
  url,
  onClick,
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">
        {title}
      </p>

      {url ? (
        <button
          type="button"
          onClick={onClick}
          className="block w-full overflow-hidden rounded-lg border border-slate-200"
        >
          <img
            src={url}
            alt={`${title} proof`}
            className="h-48 w-full object-cover"
          />
        </button>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
          <p className="text-sm text-slate-500">
            No image added
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL ACTIONS
// ============================================================

function ModalActions({
  onCancel,
  onConfirm,
  loading,
  confirmText,
  confirmClass = "bg-blue-900 hover:bg-blue-800",
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${confirmClass}`}
      >
        {loading ? "Processing..." : confirmText}
      </button>
    </div>
  );
}