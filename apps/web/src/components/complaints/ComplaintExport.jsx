import { FiDownload } from "react-icons/fi";

const ComplaintExport = ({ complaints }) => {
    const exportCSV = () => {
        if (!complaints || complaints.length === 0) {
            alert("There are no complaints to export.");
            return;
        }

        const headers = [
            "Complaint ID",
            "Title",
            "Category",
            "Priority",
            "Status",
            "Date",
            "Address",
        ];

        const rows = complaints.map((complaint) => [
            complaint.id,
            complaint.title,
            complaint.category,
            complaint.priority,
            complaint.status,
            complaint.date,
            complaint.location,
        ]);

        const escapeCSV = (value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
        };

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) =>
                row.map(escapeCSV).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "civic-connect-complaints.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <button
            type="button"
            onClick={exportCSV}
            disabled={!complaints || complaints.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
            <FiDownload />
            Export CSV
        </button>
    );
};

export default ComplaintExport;
