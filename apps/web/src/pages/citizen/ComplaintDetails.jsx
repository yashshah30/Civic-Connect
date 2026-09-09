import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiPrinter,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import StatusTimeline from "../../components/citizen/StatusTimeline";
import ComplaintLocationMap from "../../components/citizen/ComplaintLocationMap";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  try {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/complaints/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
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
          throw new Error(data.message || "Complaint not found.");
        }

        console.log(
          "COMPLAINT MEDIA:",
          JSON.stringify(data.complaint.complaint_media, null, 2)
        );

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
    } else {
      setError("Complaint ID is missing.");
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <div className="py-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

              <p className="mt-4 text-sm text-slate-500">
                Loading complaint details...
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-12">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                !
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Complaint Not Found
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {error || "Unable to load this complaint."}
              </p>

              <button
                onClick={() => navigate("/citizen/complaints")}
                className="mt-6 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Back to My Complaints
              </button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const status = complaint.status || "Unknown";

  const location =
    complaint.address ||
    (complaint.latitude != null && complaint.longitude != null
      ? `${complaint.latitude}, ${complaint.longitude}`
      : "Location not provided");

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <Navbar />

      <style>{`
        @media print {
          @page {
            margin: 16mm;
          }

          body {
            background: white !important;
          }

          nav,
          header {
            display: none !important;
          }

          button {
            display: none !important;
          }

          .shadow,
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">

        {/* Back + Print */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <FiPrinter />
            Print Complaint
          </button>
        </div>

        {/* Header */}
        <section className="mb-8">
          <p className="text-sm font-semibold text-blue-900">
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
        <section className="mb-6">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="break-all text-sm font-semibold text-slate-500">
                  #{complaint.id}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {complaint.title || complaint.category || "Complaint"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Submitted on {formatDate(complaint.created_at)}
                </p>
              </div>

              <StatusBadge status={formatStatus(status)} />
            </div>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main Information */}
          <div className="space-y-6 lg:col-span-2">

            {/* Complaint Information */}
            <Card>
              <h2 className="text-xl font-bold text-slate-900">
                Complaint Information
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {complaint.description || "No description provided."}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {complaint.category || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Priority</p>

                  <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold capitalize text-red-700">
                    {complaint.priority || "Not specified"}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <FiMapPin className="mt-1 text-blue-900" />

                  <div>
                    <p className="text-sm text-slate-500">Location</p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {location}
                    </p>

                    {complaint.latitude != null &&
                      complaint.longitude != null && (
                        <p className="mt-1 text-xs text-slate-500">
                          Coordinates: {complaint.latitude},{" "}
                          {complaint.longitude}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FiCalendar className="mt-1 text-blue-900" />

                  <div>
                    <p className="text-sm text-slate-500">
                      Date Submitted
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(complaint.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Map */}
            <Card>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-blue-900" />

                <h2 className="text-xl font-bold text-slate-900">
                  Complaint Location
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Map showing the location where this complaint was submitted.
              </p>

              <div className="mt-4">
                <ComplaintLocationMap
                  latitude={complaint.latitude}
                  longitude={complaint.longitude}
                  address={complaint.address}
                />
              </div>
            </Card>

            {/* Images */}
            {complaint.complaint_media?.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-slate-900">
                  Complaint Images
                </h2>

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
              </Card>
            )}

            {/* Tracking */}
            <Card>
              <h2 className="text-xl font-bold text-slate-900">
                Complaint Tracking
              </h2>

              <div className="mt-6">
                <StatusTimeline
                  currentStatus={formatStatus(status)}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            <Card>
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
                    {complaint.department?.name ||
                      complaint.department_id ||
                      "Not assigned"}
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
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900">
                Current Status
              </h3>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <StatusBadge status={formatStatus(status)} />

                <p className="mt-3 text-sm text-slate-500">
                  Your complaint is currently marked as{" "}
                  <span className="font-medium text-slate-700">
                    {formatStatus(status)}
                  </span>
                  .
                </p>
              </div>
            </Card>
          </aside>
        </div>

        {/* Print Footer */}
        <div className="mt-8 hidden border-t border-slate-300 pt-4 text-sm text-slate-500 print:block">
          <p className="font-semibold text-slate-900">
            CIVIC CONNECT
          </p>

          <p className="mt-1">
            Official citizen complaint report generated from Civic Connect.
          </p>
        </div>
      </main>
    </div>
  );
}