import {
    FiCheck,
    FiClock,
    FiUser,
} from "react-icons/fi";

const statuses = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
];

const statusDetails = {
    Submitted: {
        date: "06 Sep 2026",
        time: "10:30 AM",
        remark: "Complaint was submitted successfully.",
        department: null,
    },

    "Under Review": {
        date: "06 Sep 2026",
        time: "11:15 AM",
        remark: "The concerned department is reviewing your complaint.",
        department: "Public Works Department",
    },

    Assigned: {
        date: "06 Sep 2026",
        time: "12:00 PM",
        remark: "Complaint has been assigned to the concerned department.",
        department: "Public Works Department",
    },

    "In Progress": {
        date: "07 Sep 2026",
        time: "09:30 AM",
        remark: "Repair work has started.",
        department: "Public Works Department",
    },

    Resolved: {
        date: null,
        time: null,
        remark: null,
        department: null,
    },
};

const StatusTimeline = ({ currentStatus }) => {
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="space-y-0">
            {statuses.map((status, index) => {
                const completed = index < currentIndex;
                const current = index === currentIndex;
                const details = statusDetails[status];

                return (
                    <div
                        key={status}
                        className="relative flex gap-4"
                    >
                        {/* Timeline line + circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                                    completed || current
                                        ? "border-blue-900 bg-blue-900 text-white"
                                        : "border-slate-300 bg-white text-slate-400"
                                }`}
                            >
                                {completed ? (
                                    <FiCheck size={17} />
                                ) : current ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                ) : (
                                    <FiClock size={15} />
                                )}
                            </div>

                            {/* Connecting line */}
                            {index < statuses.length - 1 && (
                                <div
                                    className={`min-h-20 w-0.5 ${
                                        index < currentIndex
                                            ? "bg-blue-900"
                                            : "bg-slate-300"
                                    }`}
                                />
                            )}
                        </div>

                        {/* Status information */}
                        <div className="min-w-0 flex-1 pb-8">
                            {/* Status + date */}
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p
                                    className={`font-semibold ${
                                        completed || current
                                            ? "text-slate-900"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {status}
                                </p>

                                {details.date && (
                                    <span className="text-xs text-slate-500">
                                        {details.date} • {details.time}
                                    </span>
                                )}
                            </div>

                            {/* Current status */}
                            {current && (
                                <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900">
                                    Current status
                                </span>
                            )}

                            {/* Remark */}
                            {details.remark && (
                                <p
                                    className={`mt-2 text-sm leading-6 ${
                                        completed || current
                                            ? "text-slate-600"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {details.remark}
                                </p>
                            )}

                            {/* Department */}
                            {details.department && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                                    <FiUser size={14} />
                                    {details.department}
                                </div>
                            )}

                            {/* Pending message */}
                            {!completed && !current && (
                                <p className="mt-2 text-sm text-slate-400">
                                    Waiting for this stage.
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatusTimeline;