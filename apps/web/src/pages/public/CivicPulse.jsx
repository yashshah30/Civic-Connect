import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header & Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 p-6 sm:p-10 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live City Transparency Pulse
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  City Civic Pulse
                </h1>

                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                  Real-time municipal performance, complaint resolutions, and citizen-verified outcomes across our neighborhoods.
                </p>

                {/* Workflow Badge Step */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
                  <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-slate-200">
                    1. Citizen Reports
                  </span>
                  <FiArrowRight className="text-slate-600" />
                  <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-slate-200">
                    2. Authorities Resolve
                  </span>
                  <FiArrowRight className="text-slate-600" />
                  <span className="rounded-md bg-emerald-950/80 border border-emerald-700/40 px-2.5 py-1 text-emerald-300 font-medium">
                    3. Citizen Verifies
                  </span>
                  <FiArrowRight className="text-slate-600" />
                  <span className="rounded-md bg-blue-950/80 border border-blue-700/40 px-2.5 py-1 text-blue-300 font-medium">
                    4. Impact Visible
                  </span>
                </div>
              </div>

              {/* Time Range Switcher */}
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 shadow-inner">
                  {[
                    { label: "7 Days", value: "7d" },
                    { label: "30 Days", value: "30d" },
                    { label: "90 Days", value: "90d" },
                    { label: "All Time", value: "all" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setRange(btn.value)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                        range === btn.value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiShield className="text-emerald-400" /> Privacy Protected
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
            <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center text-red-200">
              <FiAlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
              <h3 className="text-base font-bold text-red-100">Unable to load Civic Pulse</h3>
              <p className="mt-1 text-xs text-red-300">{error}</p>
              <button
                onClick={() => fetchAnalytics(range)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                <FiRefreshCw /> Retry Loading
              </button>
            </div>
          )}

          {/* KPI Metrics Grid */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* Total */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Complaints Logged
              </p>
              <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {loading ? "..." : summary.total}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                In selected {range} window
              </p>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Resolved Issues
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-300 sm:text-3xl">
                {loading ? "..." : summary.resolved}
              </p>
              <p className="mt-1 text-[11px] text-emerald-500/80">
                Work completed
              </p>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-b from-blue-950/30 to-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                In Active Work
              </p>
              <p className="mt-2 text-2xl font-black text-blue-300 sm:text-3xl">
                {loading ? "..." : summary.inProgress}
              </p>
              <p className="mt-1 text-[11px] text-blue-500/80">
                Assigned & ongoing
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-amber-950/30 to-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                Pending Intake
              </p>
              <p className="mt-2 text-2xl font-black text-amber-300 sm:text-3xl">
                {loading ? "..." : summary.pending}
              </p>
              <p className="mt-1 text-[11px] text-amber-500/80">
                Under review
              </p>
            </div>

            {/* Resolution Rate */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                City Resolution Rate
              </p>
              <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {loading ? "..." : `${summary.resolutionRate}%`}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.resolutionRate || 0)}%` }}
                />
              </div>
            </div>

            {/* Citizen Verification Rate */}
            <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-b from-purple-950/30 to-slate-900/90 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
                Citizen Verified
              </p>
              <p className="mt-2 text-2xl font-black text-purple-300 sm:text-3xl">
                {loading
                  ? "..."
                  : resolutionImpact.hasSufficientData &&
                    resolutionImpact.resolutionSuccessRate !== null
                  ? `${resolutionImpact.resolutionSuccessRate}%`
                  : resolutionImpact.citizenVerified > 0
                  ? `${resolutionImpact.citizenVerified}`
                  : "Active"}
              </p>
              <p className="mt-1 text-[11px] text-purple-400/80">
                {resolutionImpact.citizenVerified} verified fixes
              </p>
            </div>
          </section>

          {/* Section: Trend Chart & Category Breakdown */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Trend Chart (2 columns) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiTrendingUp className="text-blue-400" />
                    City Resolution & Activity Trend
                  </h2>
                  <p className="text-xs text-slate-400">
                    Daily civic complaint inflow and completed repairs over time
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("all")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "all" ? "text-blue-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("resolved")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "resolved"
                        ? "text-emerald-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTrendView("pending")}
                    className={`flex items-center gap-1.5 transition ${
                      activeTrendView === "pending"
                        ? "text-amber-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                    Pending
                  </button>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="mt-6">
                {loading ? (
                  <div className="h-56 w-full animate-pulse rounded-2xl bg-slate-800/60" />
                ) : trends.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center text-slate-500 text-sm">
                    <p>No complaints reported in this timeframe.</p>
                  </div>
                ) : (
                  <div className="relative flex h-56 items-end gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
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
                          <div className="pointer-events-none absolute bottom-full mb-2 hidden w-32 rounded-xl border border-slate-700 bg-slate-950 p-2 text-center text-[10px] text-white shadow-xl group-hover:block z-30">
                            <p className="font-bold text-blue-300">{t.label}</p>
                            <p className="mt-0.5 text-slate-300">
                              Total: <strong>{t.total}</strong>
                            </p>
                            <p className="text-emerald-400">
                              Resolved: <strong>{t.resolved}</strong>
                            </p>
                            <p className="text-amber-400">
                              Pending: <strong>{t.pending}</strong>
                            </p>
                          </div>

                          {/* Count Label */}
                          {t.total > 0 && (
                            <span className="mb-1 text-[10px] font-semibold text-slate-400">
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                <FiLayers className="text-emerald-400" />
                Issue Categories
              </h2>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full animate-pulse rounded-xl bg-slate-800/60"
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
                        <span className="font-semibold text-slate-200 capitalize">
                          {c.category}
                        </span>
                        <span className="text-slate-400">
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
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
          <section className="rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <FiCheckCircle /> Citizen-Powered Transparency
                </span>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Resolution Impact & Verification
                </h2>
                <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Unlike traditional civic portals, Civic Connect puts closing confirmation in residents' hands. A ticket is not genuinely resolved until the citizen inspects the photo evidence and verifies the work.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/citizen/track"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
                >
                  <FiActivity /> Track My Complaint
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
                >
                  Sign In to Verify
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Resolutions Submitted</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {loading ? "..." : resolutionImpact.resolutionsSubmitted}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  By municipal field teams
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-4">
                <p className="text-xs text-emerald-400 font-semibold">
                  Citizen Verified Resolved
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {loading ? "..." : resolutionImpact.citizenVerified}
                </p>
                <p className="mt-1 text-[11px] text-emerald-400/80">
                  Confirmed satisfied by residents
                </p>
              </div>

              <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
                <p className="text-xs text-amber-400 font-semibold">
                  Flagged Unresolved & Reopened
                </p>
                <p className="mt-1 text-2xl font-black text-amber-300">
                  {loading ? "..." : resolutionImpact.citizenFlagged}
                </p>
                <p className="mt-1 text-[11px] text-amber-400/80">
                  Returned to crew for remediation
                </p>
              </div>

              <div className="rounded-2xl border border-purple-900/30 bg-purple-950/20 p-4">
                <p className="text-xs text-purple-400 font-semibold">
                  Resolution Success Rate
                </p>
                <p className="mt-1 text-2xl font-black text-purple-300">
                  {loading
                    ? "..."
                    : resolutionImpact.resolutionSuccessRate !== null
                    ? `${resolutionImpact.resolutionSuccessRate}%`
                    : "100%"}
                </p>
                <p className="mt-1 text-[11px] text-purple-400/80">
                  Citizen approval on completion
                </p>
              </div>
            </div>
          </section>

          {/* Section: Department Performance & Recent Improvements */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Department Accountability Table (2 columns) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiLayers className="text-blue-400" />
                    Department Accountability
                  </h2>
                  <p className="text-xs text-slate-400">
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
                        className="h-12 w-full animate-pulse rounded-xl bg-slate-800/60"
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
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 text-center font-semibold">Assigned</th>
                        <th className="pb-3 text-center font-semibold">Resolved</th>
                        <th className="pb-3 text-center font-semibold">Pending</th>
                        <th className="pb-3 text-right font-semibold">Resolution Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {departments.map((d) => (
                        <tr key={d.name} className="hover:bg-slate-800/30">
                          <td className="py-3.5 font-bold text-slate-200">
                            {d.name}
                          </td>
                          <td className="py-3.5 text-center text-slate-300">
                            {d.total}
                          </td>
                          <td className="py-3.5 text-center font-semibold text-emerald-400">
                            {d.resolved}
                          </td>
                          <td className="py-3.5 text-center text-amber-400">
                            {d.pending + (d.inProgress || 0)}
                          </td>
                          <td className="py-3.5 text-right font-bold text-slate-200">
                            <span
                              className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                                d.resolutionRate >= 70
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : d.resolutionRate >= 40
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : "bg-slate-800 text-slate-300"
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                  <FiCheckCircle className="text-emerald-400" />
                  Recent Civic Improvements
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Privacy-safe log of recently completed municipal fixes
                </p>

                <div className="mt-5 space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 w-full animate-pulse rounded-xl bg-slate-800/60"
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
                        className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400">
                            ✓ {item.department_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatTimeAgo(item.resolved_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">
                          Resolved a <span className="font-medium text-white capitalize">{item.category}</span> issue
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <FiShield className="text-emerald-500" />
                  Resident anonymity and private locations protected
                </p>
              </div>
            </div>
          </section>

          {/* Civic Call to Action Banner */}
          <section className="rounded-3xl border border-blue-900/40 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 p-8 shadow-xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Spot a civic issue in your neighborhood?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-300">
              Report potholes, streetlight blackouts, garbage dumps, or water leakages directly to municipal authorities with PRAGATI AI.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition"
              >
                Report an Issue Now
              </Link>
              <Link
                to="/citizen/track"
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                Track an Existing Ticket
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

