import {
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiXCircle,
} from "react-icons/fi";

const complaints = [
    {
        id: "CC-1024",
        title: "Road Damage Near Main Road",
        status: "In Progress",
        date: "06 Sep 2026",
        activity: "Complaint status changed to In Progress",
        time: "2 hours ago",
    },
    {
        id: "CC-1019",
        title: "Street Light Not Working",
        status: "Resolved",
        date: "04 Sep 2026",
        activity: "Complaint was resolved",
        time: "Yesterday",
    },
    {
        id: "CC-1015",
        title: "Water Supply Issue",
        status: "Under Review",
        date: "03 Sep 2026",
        activity: "Complaint is under review",
        time: "2 days ago",
    },
    {
        id: "CC-1012",
        title: "Garbage Collection Issue",
        status: "Rejected",
        date: "01 Sep 2026",
        activity: "Complaint was rejected",
        time: "5 days ago",
    },
    {
        id: "CC-1008",
        title: "Blocked Drainage",
        status: "Submitted",
        date: "30 Aug 2026",
        activity: "Complaint was submitted",
        time: "1 week ago",
    },
];

const getStatusClasses = (status) => {
    switch (status) {
        case "Resolved":
            return "bg-green-100 text-green-700";

        case "Rejected":
            return "bg-red-100 text-red-700";

        case "In Progress":
            return "bg-blue-100 text-blue-700";

        case "Under Review":
            return "bg-yellow-100 text-yellow-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "Resolved":
            return FiCheckCircle;

        case "Rejected":
            return FiXCircle;

        case "In Progress":
        case "Under Review":
            return FiClock;

        default:
            return FiFileText;
    }
};

export default function Activity() {
    const totalComplaints = complaints.length;

    const resolvedComplaints = complaints.filter(
        (complaint) => complaint.status === "Resolved"
    ).length;

    const rejectedComplaints = complaints.filter(
        (complaint) => complaint.status === "Rejected"
    ).length;

    const activeComplaints = complaints.filter(
        (complaint) =>
            complaint.status !== "Resolved" &&
            complaint.status !== "Rejected"
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                            <FiActivity size={22} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                My Activity
                            </h1>

                            <p className="mt-1 text-slate-500">
                                View your complaint history and recent activity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Total */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Complaints
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {totalComplaints}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                                <FiFileText size={21} />
                            </div>
                        </div>
                    </div>

                    {/* Active */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold text-blue-900">
                                    {activeComplaints}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                                <FiClock size={21} />
                            </div>
                        </div>
                    </div>

                    {/* Resolved */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Resolved
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-700">
                                    {resolvedComplaints}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                <FiCheckCircle size={21} />
                            </div>
                        </div>
                    </div>

                    {/* Rejected */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Rejected
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-700">
                                    {rejectedComplaints}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                                <FiXCircle size={21} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Recent Activity
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your latest complaint activity and status changes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {complaints.map((complaint) => {
                            const StatusIcon = getStatusIcon(
                                complaint.status
                            );

                            return (
                                <div
                                    key={complaint.id}
                                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 sm:flex-row sm:items-center"
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getStatusClasses(
                                            complaint.status
                                        )}`}
                                    >
                                        <StatusIcon size={20} />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {complaint.title}
                                                </p>

                                                <p className="mt-1 text-xs font-medium text-slate-500">
                                                    #{complaint.id} •{" "}
                                                    {complaint.date}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                    complaint.status
                                                )}`}
                                            >
                                                {complaint.status}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-slate-600">
                                            {complaint.activity}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {complaint.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Empty state */}
                {complaints.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <FiActivity size={28} />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-slate-900">
                            No activity yet
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Your complaint activity will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}