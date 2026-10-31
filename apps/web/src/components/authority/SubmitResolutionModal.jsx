import { useState } from "react";
import {
  FiCheckCircle,
  FiUploadCloud,
  FiX,
  FiAlertCircle,
  FiImage,
} from "react-icons/fi";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

export default function SubmitResolutionModal({
  isOpen,
  complaintId,
  complaintTitle = "",
  initialBeforeImageUrl = "",
  onClose,
  onSuccess,
}) {
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [beforeImageUrl, setBeforeImageUrl] = useState(
    initialBeforeImageUrl || ""
  );
  const [afterImageUrl, setAfterImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionDescription.trim()) {
      setError("Please describe the resolution and work performed.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${complaintId}/resolution`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resolution_description: resolutionDescription.trim(),
            before_image_url: beforeImageUrl.trim() || null,
            after_image_url: afterImageUrl.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit resolution proof.");
      }

      if (onSuccess) {
        onSuccess(data.resolution);
      }
      onClose();
    } catch (err) {
      console.error("Resolution submission error:", err);
      setError(err.message || "An error occurred while submitting resolution.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white">
              <FiCheckCircle className="text-lg" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Submit Resolution Proof
              </h2>
              <p className="text-xs text-slate-500">
                Ticket: #{complaintId ? complaintId.slice(0, 8) : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <FiAlertCircle className="shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Resolution Summary & Work Description *
            </label>
            <textarea
              required
              rows={4}
              value={resolutionDescription}
              onChange={(e) => setResolutionDescription(e.target.value)}
              placeholder="Detail the actions taken by the field team (e.g. Cleared 25m blockage in storm line, replaced fractured manhole cover, tested water runoff)..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Before Photo URL */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Before Image URL
                </label>
                {initialBeforeImageUrl && !beforeImageUrl && (
                  <button
                    type="button"
                    onClick={() => setBeforeImageUrl(initialBeforeImageUrl)}
                    className="text-[11px] font-medium text-blue-700 hover:underline"
                  >
                    Use Report Photo
                  </button>
                )}
              </div>
              <input
                type="url"
                value={beforeImageUrl}
                onChange={(e) => setBeforeImageUrl(e.target.value)}
                placeholder="https://... (or complaint image)"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-900"
              />
              {beforeImageUrl && (
                <div className="mt-2 h-20 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={beforeImageUrl}
                    alt="Before preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* After Photo URL */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                After Proof Image URL
              </label>
              <input
                type="url"
                value={afterImageUrl}
                onChange={(e) => setAfterImageUrl(e.target.value)}
                placeholder="https://... (completed work)"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-900"
              />
              {afterImageUrl && (
                <div className="mt-2 h-20 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={afterImageUrl}
                    alt="After preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/60 p-3 text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Workflow Note:</span> Submitting resolution proof marks this complaint as <span className="font-semibold">Resolved</span> and automatically notifies the citizen to inspect the site and confirm closure.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Proof...
                </>
              ) : (
                <>
                  <FiUploadCloud className="text-sm" />
                  Submit Resolution & Close
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

