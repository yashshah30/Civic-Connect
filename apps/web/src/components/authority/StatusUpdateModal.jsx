import React, { useState } from "react";

const statuses = [
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Assigned", value: "assigned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

export default function StatusUpdateModal({
  isOpen,
  currentStatus,
  onClose,
  onUpdate,
}) {
  const [status, setStatus] = useState(
    currentStatus?.toLowerCase() || "submitted"
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      await onUpdate(status, comment);
      setComment("");
      onClose();
    } finally {
      setSubmitting(false);
    }
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
              Change the complaint status and optionally leave an update note.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Complaint Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Note / Comment{" "}
              <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reason for status change or update notes..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-800"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="flex-1 rounded-xl bg-blue-900 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
