import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001";

export default function AssignComplaintModal({
  complaintId,
  isOpen,
  onClose,
  onAssigned,
}) {
  const [departments, setDepartments] =
    useState([]);

  const [officials, setOfficials] =
    useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedOfficial, setSelectedOfficial] =
    useState("");

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const [loadingOfficials, setLoadingOfficials] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  function getHeaders() {
    const token =
      localStorage.getItem(
        "access_token"
      );

    return {
      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  // ============================================================
  // FETCH DEPARTMENTS
  // ============================================================

  async function fetchDepartments() {
    try {
      setLoadingDepartments(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/complaints/departments`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load departments."
        );
      }

      setDepartments(
        Array.isArray(data.departments)
          ? data.departments
          : []
      );
    } catch (err) {
      console.error(
        "Department fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  }

  // ============================================================
  // FETCH OFFICIALS
  // ============================================================

  async function fetchOfficials(
    departmentId
  ) {
    if (!departmentId) {
      setOfficials([]);
      return;
    }

    try {
      setLoadingOfficials(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/complaints/officials?department_id=${encodeURIComponent(
          departmentId
        )}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load officials."
        );
      }

      setOfficials(
        Array.isArray(data.officials)
          ? data.officials
          : []
      );
    } catch (err) {
      console.error(
        "Officials fetch error:",
        err
      );

      setOfficials([]);

      setError(
        err.message ||
          "Unable to load officials."
      );
    } finally {
      setLoadingOfficials(false);
    }
  }

  // ============================================================
  // INITIALIZE MODAL
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setSuccess("");

    setSelectedDepartment("");
    setSelectedOfficial("");
    setOfficials([]);

    fetchDepartments();
  }, [isOpen]);

  // ============================================================
  // DEPARTMENT CHANGE
  // ============================================================

  async function handleDepartmentChange(
    event
  ) {
    const departmentId =
      event.target.value;

    setSelectedDepartment(
      departmentId
    );

    setSelectedOfficial("");
    setOfficials([]);
    setError("");
    setSuccess("");

    await fetchOfficials(
      departmentId
    );
  }

  // ============================================================
  // ASSIGN COMPLAINT
  // ============================================================

  async function handleAssign() {
    if (!selectedDepartment) {
      setError(
        "Please select a department."
      );
      return;
    }

    if (!selectedOfficial) {
      setError(
        "Please select an official."
      );
      return;
    }

    if (!complaintId) {
      setError(
        "Complaint ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/complaints/${complaintId}/assign`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            department_id:
              selectedDepartment,

            official_id:
              selectedOfficial,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to assign complaint."
        );
      }

      setSuccess(
        "Complaint assigned successfully."
      );

      /*
       * Give the user a moment to see
       * the success message before closing.
       */

      setTimeout(() => {
        if (onAssigned) {
          onAssigned(
            data.complaint
          );
        } else {
          onClose?.();
        }
      }, 400);
    } catch (err) {
      console.error(
        "Assignment error:",
        err
      );

      setError(
        err.message ||
          "Failed to assign complaint."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // MODAL CLOSED
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // SELECTED NAMES
  // ============================================================

  const selectedDepartmentData =
    departments.find(
      (department) =>
        department.id ===
        selectedDepartment
    );

  const selectedOfficialData =
    officials.find(
      (official) =>
        official.id ===
        selectedOfficial
    );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (!saving) {
            onClose?.();
          }
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Assign Complaint
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the department and
              official responsible for this
              complaint.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!saving) {
                onClose?.();
              }
            }}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="space-y-5 px-6 py-6">

          {/* Error */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800">
                {success}
              </p>
            </div>
          )}

          {/* ====================================================
              DEPARTMENT
          ==================================================== */}

          <div>
            <label
              htmlFor="assignment-department"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Department
            </label>

            <select
              id="assignment-department"
              value={selectedDepartment}
              onChange={
                handleDepartmentChange
              }
              disabled={
                loadingDepartments ||
                saving
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {loadingDepartments
                  ? "Loading departments..."
                  : "Select department"}
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ====================================================
              OFFICIAL
          ==================================================== */}

          <div>
            <label
              htmlFor="assignment-official"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Assigned Official
            </label>

            <select
              id="assignment-official"
              value={selectedOfficial}
              onChange={(event) =>
                setSelectedOfficial(
                  event.target.value
                )
              }
              disabled={
                !selectedDepartment ||
                loadingOfficials ||
                saving
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {!selectedDepartment
                  ? "Select department first"
                  : loadingOfficials
                  ? "Loading officials..."
                  : officials.length === 0
                  ? "No officials available"
                  : "Select official"}
              </option>

              {officials.map(
                (official) => (
                  <option
                    key={official.id}
                    value={official.id}
                  >
                    {official.full_name}
                    {official.email
                      ? ` — ${official.email}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ====================================================
              ASSIGNMENT PREVIEW
          ==================================================== */}

          {(selectedDepartmentData ||
            selectedOfficialData) && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assignment Preview
              </p>

              <div className="mt-3 space-y-2 text-sm">
                {selectedDepartmentData && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Department
                    </span>

                    <span className="text-right font-medium text-slate-900">
                      {
                        selectedDepartmentData.name
                      }
                    </span>
                  </div>
                )}

                {selectedOfficialData && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Official
                    </span>

                    <span className="text-right font-medium text-slate-900">
                      {
                        selectedOfficialData.full_name
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              if (!saving) {
                onClose?.();
              }
            }}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={
              saving ||
              !selectedDepartment ||
              !selectedOfficial
            }
            className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Assigning..."
              : "Assign Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}