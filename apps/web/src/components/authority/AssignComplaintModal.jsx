import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const departments = [
  {
    id: "4f3bc094-f7e7-4cb8-bcc8-8d7e72edc281",
    name: "Drainage Department",
  },
  {
    id: "0b309841-217a-4819-aac4-cc7ec1b9dca0",
    name: "Road & Infrastructure",
  },
  {
    id: "df2b24e5-680e-4400-a80b-137fc4914f76",
    name: "Sanitation Department",
  },
  {
    id: "5f59bd48-a624-4fd8-8a67-46083850ed4b",
    name: "Water Department",
  },
];

export default function AssignComplaintModal({
  isOpen,
  onClose,
  complaintId,
  onAssigned,
}) {
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleAssign = async () => {
    if (!departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!complaintId) {
      setError("Complaint ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${complaintId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            department_id: departmentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to assign department."
        );
      }

      if (onAssigned) {
        onAssigned(data.complaint);
      }

      setDepartmentId("");
      onClose();
    } catch (error) {
      console.error("Assign department error:", error);

      setError(
        error.message || "Failed to assign department."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Assign Complaint
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assign this complaint to a department.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">

          {/* Department */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <select
              value={departmentId}
              onChange={(event) =>
                setDepartmentId(event.target.value)
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800"
            >
              <option value="">
                Select Department
              </option>

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={loading}
              className="flex-1 rounded-xl bg-blue-900 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
