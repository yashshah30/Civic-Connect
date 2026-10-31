import { useState } from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiMaximize2,
  FiX,
  FiImage,
} from "react-icons/fi";

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

export default function ResolutionEvidenceViewer({
  resolution,
  verification,
  complaintTitle = "",
}) {
  const [modalImage, setModalImage] = useState(null);

  if (!resolution) return null;

  const {
    before_image_url,
    after_image_url,
    resolution_description,
    created_at,
  } = resolution;

  const isVerifiedResolved = verification?.verification_status === "resolved";
  const isFlaggedUnresolved =
    verification?.verification_status === "still_unresolved";
  const isPendingVerification = !verification;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header Banner */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <FiCheckCircle className="text-lg" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resolution & Verification Center
              </h3>
              <p className="text-xs text-slate-500">
                Official municipal completion record and citizen verification
              </p>
            </div>
          </div>

          <div>
            {isVerifiedResolved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <FiCheckCircle /> Citizen Verified
              </span>
            )}
            {isFlaggedUnresolved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                <FiAlertTriangle /> Citizen Flagged Unresolved
              </span>
            )}
            {isPendingVerification && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <FiClock /> Awaiting Citizen Verification
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Verification Alert Callouts */}
        {isFlaggedUnresolved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-0.5 text-lg text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  Citizen Flagged Issue as Still Unresolved
                </h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  {verification.comment ||
                    "Citizen reviewed the site and noted the problem has not been completely resolved."}
                </p>
                <p className="mt-2 text-[11px] text-amber-600">
                  Flagged on {formatDate(verification.created_at)} • Complaint reopened for inspection
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerifiedResolved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="mt-0.5 text-lg text-emerald-700 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">
                  Citizen Verified Resolution
                </h4>
                {verification.comment && (
                  <p className="mt-1 text-xs text-emerald-800 leading-relaxed italic">
                    "{verification.comment}"
                  </p>
                )}
                <p className="mt-1 text-[11px] text-emerald-600">
                  Confirmed satisfied by citizen on {formatDate(verification.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Remarks */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Authority Resolution Report
          </label>
          <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
              {resolution_description || "Resolution proof submitted without extra comments."}
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200/60 pt-2 text-xs text-slate-500">
              <FiClock className="text-slate-400" />
              <span>Resolved on {formatDate(created_at)}</span>
            </div>
          </div>
        </div>

        {/* Before & After Visual Comparison */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Photographic Evidence Comparison
            </label>
            <span className="text-xs text-slate-400">
              Click an image to expand
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Before Photo */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Before Repair
                </span>
                {before_image_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setModalImage({
                        url: before_image_url,
                        title: "Before Repair Evidence",
                      })
                    }
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
                  >
                    <FiMaximize2 /> Zoom
                  </button>
                )}
              </div>

              <div className="relative flex h-52 w-full items-center justify-center bg-slate-100">
                {before_image_url ? (
                  <img
                    src={before_image_url}
                    alt="Initial condition before work"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={() =>
                      setModalImage({
                        url: before_image_url,
                        title: "Before Repair Evidence",
                      })
                    }
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`flex h-full w-full flex-col items-center justify-center text-slate-400 p-4 text-center ${
                    before_image_url ? "hidden" : "flex"
                  }`}
                >
                  <FiImage className="h-8 w-8 mb-1 text-slate-300" />
                  <p className="text-xs font-medium">No initial photo submitted</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Original complaint did not include a before photo
                  </p>
                </div>
              </div>
            </div>

            {/* After Photo */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  After Resolution Proof
                </span>
                {after_image_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setModalImage({
                        url: after_image_url,
                        title: "After Resolution Evidence",
                      })
                    }
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    <FiMaximize2 /> Zoom
                  </button>
                )}
              </div>

              <div className="relative flex h-52 w-full items-center justify-center bg-slate-100">
                {after_image_url ? (
                  <img
                    src={after_image_url}
                    alt="Work completion evidence"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={() =>
                      setModalImage({
                        url: after_image_url,
                        title: "After Resolution Evidence",
                      })
                    }
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`flex h-full w-full flex-col items-center justify-center text-slate-400 p-4 text-center ${
                    after_image_url ? "hidden" : "flex"
                  }`}
                >
                  <FiImage className="h-8 w-8 mb-1 text-slate-300" />
                  <p className="text-xs font-medium">No after photo uploaded</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Resolution was submitted with narrative description
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 text-white">
              <span className="text-sm font-semibold">{modalImage.title}</span>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center p-2">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

