import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiTrendingUp,
  FiShield,
  FiArrowRight,
  FiRefreshCw,
  FiLayers,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const formatTimeAgo = (date) => {
  if (!date) return "";
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = Math.max(0, now - past);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
};

export default function CivicPulse() {
  const location = useLocation();
  const isCitizenPortal = location.pathname.startsWith("/citizen");

  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTrendView, setActiveTrendView] = useState("all"); // "all", "resolved", "pending"

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/public/analytics?range=${selectedRange}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load city pulse data (status ${response.status}).`);
      }

      const resData = await response.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.message || "Failed to load public analytics.");
      }

      setData(resData.data);
    } catch (err) {
      console.error("Fetch public analytics error:", err);
      setError(
        err.message || "Unable to retrieve municipal impact data at this moment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const summary = data?.summary || {
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    resolutionRate: 0,
    citizenVerificationRate: null,
  };

  const trends = data?.trends || [];
  const maxTrend = useMemo(() => {
    if (!trends.length) return 1;
    return Math.max(...trends.map((t) => t.total), 1);
  }, [trends]);

  const categories = data?.categories || [];
  const departments = data?.departments || [];
  const resolutionImpact = data?.resolutionImpact || {
    resolutionsSubmitted: 0,
    citizenVerified: 0,
    citizenFlagged: 0,
    citizenVerificationRate: null,
    resolutionSuccessRate: null,
    hasSufficientData: false,
  };
  const recentImprovements = data?.recentImprovements || [];

  return (
    <div className={isCitizenPortal ? "min-h-full bg-slate-50 text-slate-900 font-sans" : "flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white"}>
      {/* Standalone navigation on public route only */}
      {!isCitizenPortal && <Navbar />}

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header & Hero Card */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live City Transparency Pulse
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  City Civic Pulse
                </h1>

                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  Real-time municipal performance, complaint resolutions, and citizen-verified outcomes across our neighborhoods.
                </p>

                {/* Workflow Badge Step */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                    1. Citizen Reports
                  </span>
                  <FiArrowRight className="text-slate-400" />
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                    2. Authorities Resolve
                  </span>
                  <FiArrowRight className="text-slate-400" />
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800 font-semibold">
                    3. Citizen Verifies
                  </span>
                  <FiArrowRight className="text-slate-400" />
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-blue-800 font-semibold">
                    4. Impact Visible
                  </span>
                </div>
              </div>

              {/* Time Range Switcher */}
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                  {[
                    { label: "7 Days", value: "7d" },
                    { label: "30 Days", value: "30d" },
                    { label: "90 Days", value: "90d" },
                    { label: "All Time", value: "all" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      type="button"
                      onClick={() => setRange(btn.value)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        range === btn.value
                          ? "bg-blue-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <FiShield className="text-emerald-600" /> Privacy Protected
                  </span>
                  <span>•</span>
                  <span>
                    Updated: {data?.generatedAt ? formatTimeAgo(data.generatedAt) : "Live"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800 shadow-sm">
              <FiAlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <h3 className="text-base font-bold text-red-900">Unable to load Civic Pulse</h3>
              <p className="mt-1 text-xs text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => fetchAnalytics(range)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 transition"
              >
                <FiRefreshCw /> Retry Loading
              </button>
            </div>
          )}

          {/* KPI Metrics Grid */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Complaints Logged
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                {loading ? "..." : summary.total}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                In selected {range} window
              </p>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Resolved Issues
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-700 sm:text-3xl">
                {loading ? "..." : summary.resolved}
              </p>
              <p className="mt-1 text-[11px] text-emerald-700">
                Work completed
              </p>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                In Active Work
              </p>
              <p className="mt-2 text-2xl font-black text-blue-700 sm:text-3xl">
                {loading ? "..." : summary.inProgress}
              </p>
              <p className="mt-1 text-[11px] text-blue-700">
                Assigned & ongoing
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Pending Intake
              </p>
              <p className="mt-2 text-2xl font-black text-amber-700 sm:text-3xl">
                {loading ? "..." : summary.pending}
              </p>
              <p className="mt-1 text-[11px] text-amber-700">
                Under review
              </p>
            </div>

            {/* Resolution Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                City Resolution Rate
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                {loading ? "..." : `${summary.resolutionRate}%`}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.resolutionRate || 0)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Complaints closed
              </p>
            </div>

            {/* Citizen Verification Rate */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-800">
                Citizen Verified
              </p>
              <p className="mt-2 text-2xl font-black text-purple-700 sm:text-3xl">
                {loading
                  ? "..."
                  : resolutionImpact.hasSufficientData &&
                    resolutionImpact.resolutionSuccessRate !== null
                  ? `${resolutionImpact.resolutionSuccessRate}%`
                  : resolutionImpact.citizenVerified > 0
                  ? `${resolutionImpact.citizenVerified}`
                  : "Active"}
              </p>
              <p className="mt-1 text-[11px] text-purple-700">
                {resolutionImpact.citizenVerified} verified fixes
              </p>
            </div>
          </section>

          {/* Section: Trend Chart & Category Breakdown */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Trend Chart (2 columns) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiTrendingUp className="text-blue-700" />
                    City Resolution & Activity Trend
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daily civic complaint inflow and completed repairs over time
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("all")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "all" ? "text-blue-700 font-bold" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                    Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("resolved")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "resolved"
                        ? "text-emerald-700 font-bold"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                    Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("pending")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "pending"
                        ? "text-amber-700 font-bold"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" />
                    Pending
                  </button>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="mt-6">
                {loading ? (
                  <div className="h-56 w-full animate-pulse rounded-2xl bg-slate-100" />
                ) : trends.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center text-slate-400 text-sm">
                    <p>No complaints reported in this timeframe.</p>
                  </div>
                ) : (
                  <div className="relative flex h-56 items-end gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
                    {trends.map((t) => {
                      const totalHeight = Math.max(
                        (t.total / maxTrend) * 100,
                        t.total > 0 ? 12 : 3
                      );
                      const resolvedRatio =
                        t.total > 0 ? (t.resolved / t.total) * 100 : 0;

                      return (
                        <div
                          key={t.date}
                          className="group relative flex h-full min-w-[26px] flex-1 flex-col items-center justify-end"
                        >
                          {/* Hover Tooltip */}
                          <div className="pointer-events-none absolute bottom-full mb-2 hidden w-32 rounded-xl border border-slate-200 bg-white p-2 text-center text-[10px] text-slate-900 shadow-xl group-hover:block z-30">
                            <p className="font-bold text-blue-900">{t.label}</p>
                            <p className="mt-0.5 text-slate-600">
                              Total: <strong>{t.total}</strong>
                            </p>
                            <p className="text-emerald-700 font-semibold">
                              Resolved: <strong>{t.resolved}</strong>
                            </p>
                            <p className="text-amber-700 font-semibold">
                              Pending: <strong>{t.pending}</strong>
                            </p>
                          </div>

                          {/* Count Label */}
                          {t.total > 0 && (
                            <span className="mb-1 text-[10px] font-semibold text-slate-500">
                              {t.total}
                            </span>
                          )}

                          {/* Bar */}
                          <div
                            className={`relative w-full max-w-[22px] rounded-t-md transition-all overflow-hidden ${
                              activeTrendView === "resolved"
                                ? "bg-emerald-600 group-hover:bg-emerald-500"
                                : activeTrendView === "pending"
                                ? "bg-amber-600 group-hover:bg-amber-500"
                                : "bg-blue-600 group-hover:bg-blue-500"
                            }`}
                            style={{ height: `${totalHeight}%` }}
                          >
                            {activeTrendView === "all" && resolvedRatio > 0 && (
                              <div
                                className="absolute bottom-0 w-full bg-emerald-500"
                                style={{ height: `${resolvedRatio}%` }}
                              />
                            )}
                          </div>

                          {/* Date Label */}
                          <span className="mt-2 text-[9px] text-slate-500 truncate max-w-[28px]">
                            {t.label.split(" ")[1] || t.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown (1 column) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FiLayers className="text-emerald-600" />
                Issue Categories
              </h2>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No categorical data available.
                  </p>
                ) : (
                  categories.slice(0, 6).map((c) => (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 capitalize">
                          {c.category}
                        </span>
                        <span className="text-slate-500">
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, c.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Section: Resolution Impact & Citizen Verification */}
          <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/80 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <FiCheckCircle /> Citizen-Powered Transparency
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Resolution Impact & Verification
                </h2>
                <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Unlike traditional civic portals, Civic Connect puts closing confirmation in residents' hands. A ticket is not genuinely resolved until the citizen inspects the photo evidence and verifies the work.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/citizen/track"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 transition"
                >
                  <FiActivity /> Track My Complaint
                </Link>
                {isCitizenPortal ? (
                  <Link
                    to="/citizen/complaints"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-sm"
                  >
                    My Complaints
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-sm"
                  >
                    Sign In to Verify
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Resolutions Submitted</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {loading ? "..." : resolutionImpact.resolutionsSubmitted}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  By municipal field teams
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
                <p className="text-xs text-emerald-800 font-semibold">
                  Citizen Verified Resolved
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-700">
                  {loading ? "..." : resolutionImpact.citizenVerified}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">
                  Confirmed satisfied by residents
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
                <p className="text-xs text-amber-800 font-semibold">
                  Flagged Unresolved & Reopened
                </p>
                <p className="mt-1 text-2xl font-black text-amber-700">
                  {loading ? "..." : resolutionImpact.citizenFlagged}
                </p>
                <p className="mt-1 text-[11px] text-amber-700">
                  Returned to crew for remediation
                </p>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
                <p className="text-xs text-purple-800 font-semibold">
                  Resolution Success Rate
                </p>
                <p className="mt-1 text-2xl font-black text-purple-700">
                  {loading
                    ? "..."
                    : resolutionImpact.resolutionSuccessRate !== null
                    ? `${resolutionImpact.resolutionSuccessRate}%`
                    : "100%"}
                </p>
                <p className="mt-1 text-[11px] text-purple-700">
                  Citizen approval on completion
                </p>
              </div>
            </div>
          </section>

          {/* Section: Department Performance & Recent Improvements */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Department Accountability Table (2 columns) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiLayers className="text-blue-700" />
                    Department Accountability
                  </h2>
                  <p className="text-xs text-slate-500">
                    Resolution workload and efficiency across civic departments
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                {loading ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : departments.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-500">
                    No department workload data available for this range.
                  </p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 text-center font-semibold">Assigned</th>
                        <th className="pb-3 text-center font-semibold">Resolved</th>
                        <th className="pb-3 text-center font-semibold">Pending</th>
                        <th className="pb-3 text-right font-semibold">Resolution Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {departments.map((d) => (
                        <tr key={d.name} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 font-bold text-slate-900">
                            {d.name}
                          </td>
                          <td className="py-3.5 text-center text-slate-600">
                            {d.total}
                          </td>
                          <td className="py-3.5 text-center font-semibold text-emerald-700">
                            {d.resolved}
                          </td>
                          <td className="py-3.5 text-center text-amber-700">
                            {d.pending + (d.inProgress || 0)}
                          </td>
                          <td className="py-3.5 text-right font-bold text-slate-900">
                            <span
                              className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                                d.resolutionRate >= 70
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : d.resolutionRate >= 40
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {d.resolutionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Verified Improvements (1 column) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FiCheckCircle className="text-emerald-600" />
                  Recent Civic Improvements
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Privacy-safe log of recently completed municipal fixes
                </p>

                <div className="mt-5 space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 w-full animate-pulse rounded-xl bg-slate-100"
                        />
                      ))}
                    </div>
                  ) : recentImprovements.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      No recent resolutions recorded.
                    </p>
                  ) : (
                    recentImprovements.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-700">
                            ✓ {item.department_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatTimeAgo(item.resolved_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700">
                          Resolved a <span className="font-semibold text-slate-900 capitalize">{item.category}</span> issue
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <FiShield className="text-emerald-600" />
                  Resident anonymity and private locations protected
                </p>
              </div>
            </div>
          </section>

          {/* Civic Call to Action Banner */}
          <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 shadow-sm text-center text-white">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Spot a civic issue in your neighborhood?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-blue-100">
              Report potholes, streetlight blackouts, garbage dumps, or water leakages directly to municipal authorities with PRAGATI AI.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                to={isCitizenPortal ? "/citizen/report" : "/signup"}
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-900 shadow-md hover:bg-blue-50 transition"
              >
                Report an Issue Now
              </Link>
              <Link
                to="/citizen/track"
                className="rounded-xl border border-blue-300/40 bg-blue-950/40 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900/60 transition"
              >
                Track an Existing Ticket
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Standalone footer on public route only */}
      {!isCitizenPortal && <Footer />}
    </div>
  );
}
