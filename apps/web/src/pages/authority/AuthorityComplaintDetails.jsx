import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";

const API_URL =
  "https://civic-connect-backend-6i78.onrender.com/api/complaints";

export default function AuthorityComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login again to view this complaint.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaint");
      }

      setComplaint(data.complaint);
    } catch (err) {
      console.error("Complaint details error:", err);
      setError(err.message || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Pending";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatText = (value) => {
    if (!value) return "—";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getTimeline = () => {
    if (!complaint) return [];

    const status = String(complaint.status || "submitted").toLowerCase();

    const statusOrder = [
      "submitted",
      "under review",
      "assigned",
      "in progress",
      "resolved",
    ];

    let currentIndex = statusOrder.indexOf(status);

    if (currentIndex === -1) {
      if (status === "pending" || status === "new") {
        currentIndex = 0;
      } else {
        currentIndex = 0;
      }
    }

    return [
      {
        status: "Submitted",
        date: formatDateTime(complaint.created_at),
        description: "Complaint submitted by citizen.",
        completed: currentIndex >= 0,
      },
      {
        status: "Under Review",
        date: currentIndex >= 1 ? formatDateTime(complaint.updated_at) : "Pending",
        description: "Complaint reviewed by authority officer.",
        completed: currentIndex >= 1,
      },
      {
        status: "Assigned",
        date: currentIndex >= 2 ? formatDateTime(complaint.updated_at) : "Pending",
        description: "Complaint department assignment.",
        completed: currentIndex >= 2,
      },
      {
        status: "In Progress",
        date: currentIndex >= 3 ? formatDateTime(complaint.updated_at) : "Pending",
        description: "Work related to the complaint is in progress.",
        completed: currentIndex >= 3,
      },
      {
        status: "Resolved",
        date: currentIndex >= 4 ? formatDateTime(complaint.updated_at) : "Pending",
        description: "Complaint has been resolved.",
        completed: currentIndex >= 4,
      },
    ];
  };

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

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading complaint details...
            </p>
          </div>
        </main>

      </div>
    );
  }

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
              Back to Complaints
            </Link>

          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <p className="text-sm font-medium text-red-600">
              {error || "Complaint not found."}
            </p>

            <button
              type="button"
              onClick={fetchComplaint}
              className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Try Again
            </button>

          </div>
        </main>

      </div>
    );
  }

  const media = complaint.complaint_media || [];
  const timeline = getTimeline();

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
                Complaint ID: {complaint.id}
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {formatText(complaint.priority)} Priority
            </span>

          </div>

        </section>

        {/* Complaint Information */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Complaint */}
          <div className="space-y-6 lg:col-span-2">

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
                    {complaint.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatText(complaint.category)}
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
                    Current Status
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {formatText(complaint.status)}
                  </span>
                </div>

              </div>

              <div className="mt-6">

                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="mt-2 leading-7 text-slate-700">
                  {complaint.description || "No description provided."}
                </p>

              </div>

            </div>

            {/* Uploaded Image */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Uploaded Image
              </h3>

              {media.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {media.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-lg"
                    >
                      <img
                        src={image.file_url}
                        alt={image.file_name || "Complaint"}
                        className="h-72 w-full object-cover"
                      />
                    </div>
                  ))}

                </div>
              ) : (
                <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-slate-100">
                  <p className="text-sm text-slate-500">
                    No image uploaded with this complaint.
                  </p>
                </div>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Images uploaded by citizen with the complaint.
              </p>

            </div>

            {/* Location */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <p className="mt-3 text-slate-700">
                {complaint.address || "Location not provided"}
              </p>

              <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-slate-100">

                <div className="text-center">

                  <div className="text-3xl">
                    📍
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Map Location
                  </p>

                  <p className="text-xs text-slate-400">
                    Latitude: {complaint.latitude ?? "—"} | Longitude:{" "}
                    {complaint.longitude ?? "—"}
                  </p>

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

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.user_id || "Citizen information unavailable"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-slate-700">
                    {complaint.address || "Location not provided"}
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
                  className="w-full rounded-lg border border-blue-900 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-50"
                >
                  Change Status
                </button>

                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add Comment
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

            {timeline.map((item, index) => (

              <div
                key={item.status}
                className="flex gap-4"
              >

                {/* Timeline Line */}
                <div className="flex flex-col items-center">

                  <div
                    className={`h-4 w-4 rounded-full ${
                      item.completed
                        ? "bg-blue-800"
                        : "bg-slate-300"
                    }`}
                  />

                  {index !== timeline.length - 1 && (
                    <div className="h-16 w-px bg-slate-200" />
                  )}

                </div>

                {/* Timeline Content */}
                <div className="pb-8">

                  <div className="flex flex-wrap items-center gap-2">

                    <h4 className="font-semibold text-slate-800">
                      {item.status}
                    </h4>

                    <span className="text-xs text-slate-400">
                      {item.date}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

      <AssignComplaintModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />

    </div>
  );
}