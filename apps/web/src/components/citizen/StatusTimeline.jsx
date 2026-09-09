const statuses = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
];

const normalizeStatus = (status) => {
    if (!status) return "";

    const normalized = status.toLowerCase().replace(/_/g, " ");

    const statusMap = {
        submitted: "Submitted",
        "under review": "Under Review",
        assigned: "Assigned",
        "in progress": "In Progress",
        resolved: "Resolved",
    };

    return statusMap[normalized] || status;
};

const StatusTimeline = ({ currentStatus, history = [] }) => {
    const normalizedCurrentStatus = normalizeStatus(currentStatus);
    const currentIndex = statuses.indexOf(normalizedCurrentStatus);

    return (
        <div className="space-y-0">
            {statuses.map((status, index) => {
                const completed = index < currentIndex;
                const current = index === currentIndex;

                const historyItem = history.find(
                    (item) => normalizeStatus(item.new_status) === status
                );

                return (
                    <div key={status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                                    completed || current
                                        ? "border-blue-900 bg-blue-900 text-white"
                                        : "border-slate-300 bg-white text-slate-400"
                                }`}
                            >
                                {completed ? "✓" : current ? "●" : ""}
                            </div>

                            {index < statuses.length - 1 && (
                                <div
                                    className={`h-12 w-0.5 ${
                                        index < currentIndex
                                            ? "bg-blue-900"
                                            : "bg-slate-300"
                                    }`}
                                />
                            )}
                        </div>

                        <div className="pb-8">
                            <p
                                className={`font-semibold ${
                                    completed || current
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                }`}
                            >
                                {status}
                            </p>

                            {current && (
                                <p className="mt-1 text-sm text-blue-900">
                                    Current status
                                </p>
                            )}

                            {historyItem?.created_at && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {new Date(
                                        historyItem.created_at
                                    ).toLocaleString()}
                                </p>
                            )}

                            {historyItem?.comment && (
                                <p className="mt-1 text-sm text-slate-600">
                                    {historyItem.comment}
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