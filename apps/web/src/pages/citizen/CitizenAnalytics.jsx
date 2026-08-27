import Navbar from "../../components/layout/navbar";

import StatCard from "../../components/analytics/StatCard";
import CategoryChart from "../../components/analytics/CategoryChart";
import StatusChart from "../../components/analytics/StatusChart";
import ActivityChart from "../../components/analytics/ActivityChart";

import mockComplaints from "../../data/mockComplaints";
import { getComplaintAnalytics } from "../../utils/complaintAnalytics";

const CitizenAnalytics = () => {
    const analytics = getComplaintAnalytics(mockComplaints);

    const {
        total,
        resolved,
        inProgress,
        pending,
        resolutionRate,
        complaintsByCategory,
        complaintsByStatus,
        complaintsOverTime,
        resolutionTrend,
    } = analytics;

    // Number of unique areas reported
    const areasReported = new Set(
        mockComplaints.map(
            (complaint) => complaint.location
        )
    ).size;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <section className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        My Activity
                    </h1>

                    <p className="mt-2 max-w-2xl text-slate-600">
                        Understand your complaint history, resolution
                        progress and civic activity.
                    </p>
                </section>

                {/* Statistics */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                            title="Total Complaints"
                            value={total}
                            description="All complaints reported"
                        />

                        <StatCard
                            title="Resolved"
                            value={resolved}
                            description="Successfully resolved"
                        />

                        <StatCard
                            title="In Progress"
                            value={inProgress}
                            description="Currently being handled"
                        />

                        <StatCard
                            title="Pending"
                            value={pending}
                            description="Awaiting action"
                        />

                    </div>
                </section>

                {/* Resolution Rate */}
                <section className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Resolution Rate
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Percentage of complaints that have
                                    been resolved.
                                </p>
                            </div>

                            <div className="text-3xl font-bold text-blue-900">
                                {resolutionRate}%
                            </div>

                        </div>

                        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-blue-800 transition-all"
                                style={{
                                    width: `${resolutionRate}%`,
                                }}
                            />
                        </div>

                    </div>
                </section>

                {/* Category + Status */}
                <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <CategoryChart
                        data={complaintsByCategory}
                    />

                    <StatusChart
                        data={complaintsByStatus}
                    />

                </section>

                {/* Complaints Over Time */}
                <section className="mb-8">
                    <ActivityChart
                        data={complaintsOverTime}
                        title="Complaints Over Time"
                    />
                </section>

                {/* Resolution Trend */}
                {resolutionTrend.length > 0 && (
                    <section className="mb-8">
                        <ActivityChart
                            data={resolutionTrend}
                            title="Resolution Trend"
                        />
                    </section>
                )}

                {/* Civic Contribution */}
                <section className="mb-8">

                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                Your Civic Contribution
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                A summary of your contribution to
                                improving your community.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Complaints Reported
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {total}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Issues Resolved
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {resolved}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Areas Reported
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {areasReported}
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
};

export default CitizenAnalytics;