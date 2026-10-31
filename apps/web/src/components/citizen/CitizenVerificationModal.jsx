import { useState } from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
} from "react-icons/fi";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

export default function CitizenVerificationModal({
  isOpen,
  complaintId,
  initialMode = "resolved", // "resolved" or "still_unresolved"
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isResolving = mode === "resolved";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isResolving && !comment.trim()) {
      setError("Please describe what remains unresolved so the municipal department can fix it.");
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
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${complaintId}/verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verification_status: mode,
            comment: comment.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit verification.");
      }

      if (onSuccess) {
        onSuccess(data.verification, mode);
      }
      onClose();
    } catch (err) {
      console.error("Verification submit error:", err);
      setError(err.message || "An error occurred submitting your feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isResolving
              ? "border-emerald-100 bg-emerald-50/70"
              : "border-amber-100 bg-amber-50/70"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${
                isResolving ? "bg-emerald-600" : "bg-amber-600"
              }`}
            >
              {isResolving ? (
                <FiCheckCircle className="text-lg" />
              ) : (
                <FiAlertTriangle className="text-lg" />
              )}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isResolving
                  ? "Confirm Complaint Resolution"
                  : "Report Problem Still Unresolved"}
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

        {/* Toggle Mode Option */}
        <div className="border-b border-slate-100 bg-slate-50 p-3">
          <div className="flex rounded-xl bg-slate-200/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("resolved");
                setError("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                isResolving
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiCheckCircle /> Confirm Fixed
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("still_unresolved");
                setError("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                !isResolving
                  ? "bg-white text-amber-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiAlertTriangle /> Still Unresolved
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <FiAlertCircle className="shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              {isResolving
                ? "Feedback Comments (Optional)"
                : "What remains unresolved? *"}
            </label>
            <textarea
              required={!isResolving}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isResolving
                  ? "Share any feedback about the work quality or speed (optional)..."
                  : "Please detail exactly what is still defective or incomplete on the ground so the municipal crew can return to finish it..."
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div
            className={`rounded-xl p-3 text-xs leading-relaxed ${
              isResolving
                ? "bg-emerald-50/70 text-emerald-900"
                : "bg-amber-50/70 text-amber-900"
            }`}
          >
            {isResolving ? (
              <p>
                By confirming, this ticket will be recorded as officially verified
                and resolved by the citizen.
              </p>
            ) : (
              <p>
                By flagging this as still unresolved, this ticket will be
                immediately reopened back to In Progress and returned to the
                department for remediation.
              </p>
            )}
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
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
                isResolving
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Feedback...
                </>
              ) : isResolving ? (
                <>
                  <FiCheckCircle className="text-sm" />
                  Confirm & Close Ticket
                </>
              ) : (
                <>
                  <FiAlertTriangle className="text-sm" />
                  Submit Rejection & Reopen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

