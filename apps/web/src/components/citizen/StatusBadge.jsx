const StatusBadge = ({ status }) => {
    const styles = {
        Submitted: "bg-blue-100 text-blue-700",
        "Under Review": "bg-yellow-100 text-yellow-700",
        Assigned: "bg-purple-100 text-purple-700",
        "In Progress": "bg-orange-100 text-orange-700",
        Resolved: "bg-green-100 text-green-700",
        Rejected: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;