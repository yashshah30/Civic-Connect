import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintCard from "../../components/citizen/ComplaintCard";

const API_URL = "https://civic-connect-backend-6i78.onrender.com";

export default function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
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
          `${API_URL}/api/complaints/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          let message = `Failed to load complaints. Server returned ${response.status}.`;

          if (contentType.includes("application/json")) {
            const data = await response.json();
            message = data.message || message;
          }

          throw new Error(message);
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load complaints."
          );
        }

        setComplaints(data.complaints || []);
      } catch (err) {
        console.error("My complaints error:", err);
        setError(err.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Complaints
            </h1>
            <p className="mt-1 text-slate-500">
              Track and manage your submitted complaints.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/citizen/report")}
            className="rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Report New Complaint
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your complaints...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No complaints yet
            </h2>
            <p className="mt-2 text-slate-500">
              You haven't submitted any complaints.
            </p>

            <button
              type="button"
              onClick={() => navigate("/citizen/report")}
              className="mt-5 rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Report a Complaint
            </button>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
