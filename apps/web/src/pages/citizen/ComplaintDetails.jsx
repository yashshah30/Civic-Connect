import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL =
  "https://civic-connect-backend-6i78.onrender.com";

export default function ComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const response = await fetch(
          `${API_URL}/api/complaints/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          let message = "Failed to load complaint.";

          if (contentType.includes("application/json")) {
            const data = await response.json();
            message = data.message || message;
          } else {
            message = `Server returned ${response.status}.`;
          }

          throw new Error(message);
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The server returned an invalid response. Please try again."
          );
        }

        const data = await response.json();

        if (!data.success || !data.complaint) {
          throw new Error(
            data.message || "Complaint not found."
          );
        }

        setComplaint(data.complaint);
      } catch (err) {
        console.error("Complaint details error:", err);
        setError(err.message || "Unable to load complaint.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    try {
      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return date;
    }
  };

  const statusStyles = {
    submitted: "bg-slate-100 text-slate-700",
    "under review": "bg-blue-100 text-blue-700",
    assigned: "bg-purple-100 text-purple-700",
    "in progress": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const priorityStyles = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

            <p className="mt-4 text-sm text-slate-500">
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
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Complaint Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Unable to load this complaint."}
            </p>

            <Link
              to="/citizen/complaints"
              className="mt-6 inline-flex rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Back to My Complaints
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const status =
    complaint.status?.replace(/_/g, " ") || "Unknown";

  const priority =
    complaint.priority?.replace(/_/g, " ") || "Unknown";

  const normalizedStatus = status.toLowerCase();
  const normalizedPriority = priority.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            to="/citizen/complaints"
            className="text-xl font-bold text-blue-900"
          >
            Civic Connect
          </Link>

          <Link
            to="/citizen/complaints"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Complaints
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <section>
          <p className="text-sm font-medium text-blue-800">
            Citizen Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Complaint Details
          </h1>

          <p className="mt-2 text-slate-500">
            View the complete information and current status of your complaint.
          </p>
        </section>

        {/* Complaint Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-blue-800">
                {complaint.id}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {complaint.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Submitted on {formatDate(complaint.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusStyles[normalizedStatus] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {status}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  priorityStyles[normalizedPriority] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {priority} Priority
              </span>

            </div>

          </div>

        </section>

        {/* Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Information */}
          <div className="space-y-6 lg:col-span-2">

            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Description
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                {complaint.description || "No description provided."}
              </p>

            </section>

            {/* Location */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <div className="mt-4 space-y-4">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {complaint.address || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Latitude
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {complaint.latitude ?? "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Longitude
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {complaint.longitude ?? "Not available"}
                    </p>
                  </div>

                </div>

              </div>

            </section>

            {/* Images */}
            {complaint.complaint_media?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-lg font-semibold text-slate-900">
                  Complaint Images
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {complaint.complaint_media.map((media) => (
                    <div
                      key={media.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      <img
                        src={media.file_url}
                        alt={media.file_name || "Complaint evidence"}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  ))}

                </div>

              </section>
            )}

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Complaint Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Information
              </h3>

              <div className="mt-5 space-y-5">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                    {complaint.category || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {complaint.department_id || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(complaint.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(complaint.updated_at)}
                  </p>
                </div>

              </div>

            </section>

            {/* Status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Current Status
              </h3>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">

                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                    statusStyles[normalizedStatus] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {status}
                </span>

                <p className="mt-3 text-sm text-slate-500">
                  Your complaint is currently marked as{" "}
                  <span className="font-medium text-slate-700">
                    {status}
                  </span>
                  .
                </p>

              </div>

            </section>

          </aside>

        </div>

      </main>
    </div>
  );
}
