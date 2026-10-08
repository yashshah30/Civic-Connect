import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";

const statusOrder = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
];

const fallbackTimeline = [
  {
    status: "Submitted",
    date: "Pending",
    description: "Complaint submitted by citizen.",
  },
  {
    status: "Under Review",
    date: "Pending",
    description: "Complaint reviewed by authority officer.",
  },
  {
    status: "Assigned",
    date: "Pending",
    description: "Department assignment is pending.",
  },
  {
    status: "In Progress",
    date: "Pending",
    description: "Work has not started yet.",
  },
  {
    status: "Resolved",
    date: "Pending",
    description: "Complaint resolution is pending.",
  },
];

export default function AuthorityComplaintDetails() {
  const { id } = useParams();

  // --------------------------------------------------
  // Complaint data
  // --------------------------------------------------

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Authority state
  // --------------------------------------------------

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // --------------------------------------------------
  // Modal states
  // --------------------------------------------------

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);

  // --------------------------------------------------
  // Form states
  // --------------------------------------------------

  const [comment, setComment] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // --------------------------------------------------
  // Evidence viewer
  // --------------------------------------------------

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [brokenImages, setBrokenImages] = useState([]);

  // --------------------------------------------------
  // Fetch complaint
  // --------------------------------------------------

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/complaints/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch complaint details."
        );
      }

      if (!data.complaint) {
        throw new Error("Complaint data was not returned by the server.");
      }

      setComplaint(data.complaint);

      setStatus(
        formatStatus(data.complaint.status)
      );

      setPriority(
        formatPriority(data.complaint.priority)
      );
    } catch (err) {
      console.error("Fetch complaint error:", err);

      setError(
        err.message || "Unable to load complaint details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  // --------------------------------------------------
  // Formatting helpers
  // --------------------------------------------------

  function formatStatus(value) {
    if (!value) return "Submitted";

    const statusMap = {
      pending: "Submitted",
      submitted: "Submitted",
      under_review: "Under Review",
      "under review": "Under Review",
      assigned: "Assigned",
      in_progress: "In Progress",
      "in progress": "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
    };

    return (
      statusMap[String(value).toLowerCase()] ||
      value
    );
  }

  function formatPriority(value) {
    if (!value) return "Medium";

    return (
      String(value).charAt(0).toUpperCase() +
      String(value).slice(1).toLowerCase()
    );
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

  // --------------------------------------------------
  // Complaint images
  // --------------------------------------------------

  const images = complaint?.images || [];

  const handleOpenImage = (index) => {
    setSelectedImage(index);
    setImageLoading(true);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
    setImageLoading(false);
  };

  const handlePreviousImage = () => {
    if (selectedImage === null || images.length === 0) {
      return;
    }

    const previousIndex =
      selectedImage === 0
        ? images.length - 1
        : selectedImage - 1;

    setSelectedImage(previousIndex);
    setImageLoading(true);
  };

  const handleNextImage = () => {
    if (selectedImage === null || images.length === 0) {
      return;
    }

    const nextIndex =
      selectedImage === images.length - 1
        ? 0
        : selectedImage + 1;

    setSelectedImage(nextIndex);
    setImageLoading(true);
  };

  const handleBrokenImage = (index) => {
    setBrokenImages((previous) => {
      if (previous.includes(index)) {
        return previous;
      }

      return [...previous, index];
    });

    setImageLoading(false);
  };

  // --------------------------------------------------
  // Resolution / rejection
  // --------------------------------------------------

  const handleResolution = () => {
    if (!resolutionNote.trim()) {
      return;
    }

    console.log("Resolution:", resolutionNote);

    setStatus("Resolved");
    setResolutionNote("");
    setIsResolutionOpen(false);
  };

  const handleRejection = () => {
    if (!rejectionReason.trim()) {
      return;
    }

    console.log("Rejection Reason:", rejectionReason);

    setStatus("Rejected");
    setRejectionReason("");
    setIsRejectionOpen(false);
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
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
              Back to Complaints
            </Link>

          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading complaint details...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
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
              Back to Complaints
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
              {error}
            </p>

            <div className="mt-6 flex justify-center gap-3">

              <button
                type="button"
                onClick={fetchComplaint}
                className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800"
              >
                Try Again
              </button>

              <Link
                to="/authority/complaints"
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Complaints
              </Link>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // --------------------------------------------------
  // Safety check
  // --------------------------------------------------

  if (!complaint) {
    return null;
  }

  // --------------------------------------------------
  // Timeline
  // --------------------------------------------------

  const currentStatusIndex = statusOrder.indexOf(status);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
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
            Back to Complaints
          </Link>

        </div>

      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section>

          <p className="text-sm font-medium text-blue-800">
            Complaint Details
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-3xl font-bold text-slate-900">
                {complaint.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaint ID: {complaint.id || id}
              </p>

            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {priority} Priority
            </span>

          </div>

        </section>

        {/* Complaint Information */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Complaint */}
          <div className="space-y-6 lg:col-span-2">

            {/* Complaint Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-slate-500">
                    Complaint ID
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.id || id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.category || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Date Submitted
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(complaint.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(complaint.updated_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Current Status
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Department
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.departments?.name ||
                      "Not assigned"}
                  </p>
                </div>

              </div>

              <div className="mt-6">

                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="mt-2 leading-7 text-slate-700">
                  {complaint.description}
                </p>

              </div>

            </div>

            {/* Evidence */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Uploaded Evidence
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Images submitted with the complaint.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {images.length} Images
                </span>

              </div>

              {images.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {images.map((image, index) => (

                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => handleOpenImage(index)}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left"
                    >

                      {!brokenImages.includes(index) ? (
                        <img
                          src={image}
                          alt={`Complaint evidence ${index + 1}`}
                          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={() =>
                            handleBrokenImage(index)
                          }
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center px-4 text-center">

                          <div>
                            <div className="text-3xl">
                              🖼️
                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-600">
                              Image unavailable
                            </p>

                          </div>

                        </div>
                      )}

                      {!brokenImages.includes(index) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">

                          <span className="rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 opacity-0 shadow transition group-hover:opacity-100">
                            View Full Size
                          </span>

                        </div>
                      )}

                    </button>

                  ))}

                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">

                  <div className="text-3xl">
                    🖼️
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    No evidence images available
                  </p>

                </div>
              )}

            </div>

            {/* Location */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <p className="mt-3 text-slate-700">
                {complaint.address || "Address not available"}
              </p>

              <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-slate-100">

                <div className="text-center">

                  <div className="text-3xl">
                    📍
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Map Location
                  </p>

                  {complaint.latitude &&
                  complaint.longitude ? (
                    <p className="text-xs text-slate-400">
                      {complaint.latitude},{" "}
                      {complaint.longitude}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Coordinates not available
                    </p>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* Citizen + Actions */}
          <div className="space-y-6">

            {/* Citizen Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Citizen Information
              </h3>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-sm text-slate-500">
                    Citizen
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.profiles?.full_name ||
                      "Citizen"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-700">
                    {complaint.profiles?.email ||
                      "Email not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-slate-700">
                    {complaint.address ||
                      "Location not available"}
                  </p>
                </div>

              </div>

            </div>

            {/* Authority Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Authority Actions
              </h3>

              <div className="mt-4 space-y-3">

                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Assign Department
                </button>

                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="w-full rounded-lg border border-blue-900 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-50"
                >
                  Change Status
                </button>

                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(true)}
                  className="w-full rounded-lg border border-orange-600 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-50"
                >
                  Change Priority
                </button>

                <button
                  type="button"
                  onClick={() => setIsCommentOpen(true)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add Comment
                </button>

                <button
                  type="button"
                  onClick={() => setIsResolutionOpen(true)}
                  className="w-full rounded-lg border border-green-600 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  Resolve Complaint
                </button>

                <button
                  type="button"
                  onClick={() => setIsRejectionOpen(true)}
                  className="w-full rounded-lg border border-red-600 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Reject Complaint
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Status Timeline */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-semibold text-slate-900">
            Status Timeline
          </h3>

          <div className="mt-6">

            {fallbackTimeline.map((item, index) => {

              const isCompleted =
                currentStatusIndex >= index &&
                currentStatusIndex !== -1;

              return (
                <div
                  key={item.status}
                  className="flex gap-4"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`h-4 w-4 rounded-full ${
                        isCompleted
                          ? "bg-blue-800"
                          : "bg-slate-300"
                      }`}
                    />

                    {index !== fallbackTimeline.length - 1 && (
                      <div className="h-16 w-px bg-slate-200" />
                    )}

                  </div>

                  <div className="pb-8">

                    <div className="flex flex-wrap items-center gap-2">

                      <h4 className="font-semibold text-slate-800">
                        {item.status}
                      </h4>

                      <span className="text-xs text-slate-400">
                        {item.status === status
                          ? "Current"
                          : item.date}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </main>

      {/* Assign Department */}
      <AssignComplaintModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />

      {/* Image Viewer */}
      {selectedImage !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 py-6"
          onClick={handleCloseImage}
        >

          <div
            className="relative flex h-full w-full max-w-5xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              onClick={handleCloseImage}
              className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-4 py-2 text-xl font-bold text-slate-800 shadow hover:bg-white sm:right-4 sm:top-4"
            >
              ×
            </button>

            <button
              type="button"
              onClick={handlePreviousImage}
              className="absolute left-0 z-10 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-slate-800 shadow hover:bg-white sm:left-4"
            >
              ←
            </button>

            <div className="relative flex max-h-full max-w-full items-center justify-center">

              {imageLoading && (
                <div className="absolute z-10 rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow">
                  Loading image...
                </div>
              )}

              {!brokenImages.includes(selectedImage) ? (
                <img
                  src={images[selectedImage]}
                  alt={`Complaint evidence ${
                    selectedImage + 1
                  }`}
                  className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    handleBrokenImage(selectedImage);
                  }}
                />
              ) : (
                <div className="rounded-xl bg-white px-8 py-12 text-center shadow-xl">

                  <div className="text-5xl">
                    🖼️
                  </div>

                  <p className="mt-4 font-semibold text-slate-800">
                    Image unavailable
                  </p>

                </div>
              )}

            </div>

            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-0 z-10 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-slate-800 shadow hover:bg-white sm:right-4"
            >
              →
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
              {selectedImage + 1} / {images.length}
            </div>

          </div>

        </div>
      )}

      {/* Change Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Change Complaint Status
              </h3>

              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Select the new status for this complaint.
            </p>

            <div className="mt-5 space-y-3">

              {[
                "Submitted",
                "Under Review",
                "Assigned",
                "In Progress",
                "Resolved",
                "Rejected",
              ].map((newStatus) => (

                <button
                  key={newStatus}
                  type="button"
                  onClick={() => {
                    setStatus(newStatus);
                    setIsStatusModalOpen(false);
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                    status === newStatus
                      ? "border-blue-900 bg-blue-50 text-blue-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {newStatus}
                </button>

              ))}

            </div>

          </div>

        </div>
      )}

      {/* Change Priority */}
      {isPriorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Change Priority
              </h3>

              <button
                type="button"
                onClick={() => setIsPriorityModalOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Select the priority for this complaint.
            </p>

            <div className="mt-5 space-y-3">

              {["Low", "Medium", "High", "Urgent"].map(
                (newPriority) => (

                  <button
                    key={newPriority}
                    type="button"
                    onClick={() => {
                      setPriority(newPriority);
                      setIsPriorityModalOpen(false);
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                      priority === newPriority
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {newPriority}
                  </button>

                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* Comment */}
      {isCommentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Add Comment
              </h3>

              <button
                type="button"
                onClick={() => setIsCommentOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={5}
              className="mt-5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-800"
            />

            <div className="mt-4 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setComment("");
                  setIsCommentOpen(false);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!comment.trim()}
                onClick={() => {
                  console.log("Comment:", comment);

                  setComment("");
                  setIsCommentOpen(false);
                }}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Add Comment
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Resolution */}
      {isResolutionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Resolve Complaint
              </h3>

              <button
                type="button"
                onClick={() => setIsResolutionOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Add remarks describing how this complaint was resolved.
            </p>

            <textarea
              value={resolutionNote}
              onChange={(e) =>
                setResolutionNote(e.target.value)
              }
              placeholder="Enter resolution remarks..."
              rows={5}
              className="mt-5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-green-700"
            />

            <div className="mt-4 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setResolutionNote("");
                  setIsResolutionOpen(false);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!resolutionNote.trim()}
                onClick={handleResolution}
                className="flex-1 rounded-lg bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Resolve
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Rejection */}
      {isRejectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Reject Complaint
              </h3>

              <button
                type="button"
                onClick={() => setIsRejectionOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              A rejection reason is required before rejecting this complaint.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(e.target.value)
              }
              placeholder="Enter rejection reason..."
              rows={5}
              className="mt-5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-red-700"
            />

            <div className="mt-4 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setRejectionReason("");
                  setIsRejectionOpen(false);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={handleRejection}
                className="flex-1 rounded-lg bg-red-700 px-4 py-3 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Reject
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}