import React, { useState } from "react";

const statuses = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

export default function StatusUpdateModal({
  isOpen,
  currentStatus,
  onClose,
  onUpdate,
}) {
  const [status, setStatus] = useState(currentStatus || "Submitted");

  if (!isOpen) return null;

  const handleUpdate = () => {
    onUpdate(status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Update Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Change the current complaint status.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>

        </div>

        <div className="mt-6">

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Complaint Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="flex-1 rounded-xl bg-blue-900 px-4 py-3 font-medium text-white hover:bg-blue-800"
          >
            Update Status
          </button>

        </div>

      </div>

    </div>
  );
}
