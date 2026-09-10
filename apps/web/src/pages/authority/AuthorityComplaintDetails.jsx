import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";

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

  return new Date(date).toLocaleString();
};

export default function AuthorityComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      throw new Error(
        data.message || "Failed to load complaint."
      );
    }

    setComplaint(data.complaint);
  } catch (error) {
    console.error("Fetch complaint error:", error);

    setError(
      error.message || "Failed to load complaint."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading complaint...
        </p>
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

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.category}
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
                    {formatStatus(status)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Department
                  </p>

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.department_id || "Not assigned"}
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

            {/* Location */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <p className="mt-3 text-slate-700">
                {complaint.address || "Address not provided"}
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
                    Map integration will be added later.
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
                    Citizen ID
                  </p>

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {complaint.user_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-slate-700">
                    {complaint.address || "Not provided"}
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
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-blue-900 px-4 py-3 text-sm font-medium text-blue-900 opacity-50"
                >
                  Change Status
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 opacity-50"
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

            <div className="flex gap-4">

              <div className="flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-blue-800" />
              </div>

              <div className="pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-800">
                    {formatStatus(status)}
                  </h4>

                  <span className="text-xs text-slate-400">
                    {formatDate(complaint.updated_at)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Current complaint status.
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

    </div>
  );
}
