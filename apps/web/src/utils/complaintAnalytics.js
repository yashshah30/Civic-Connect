export const getComplaintAnalytics = (complaints) => {
    const total = complaints.length;

    const resolved = complaints.filter(
        (complaint) => complaint.status === "Resolved"
    ).length;

    const inProgress = complaints.filter(
        (complaint) => complaint.status === "In Progress"
    ).length;

    const pending = complaints.filter(
        (complaint) =>
            complaint.status === "Submitted" ||
            complaint.status === "Under Review" ||
            complaint.status === "Assigned"
    ).length;

    const resolutionRate =
        total > 0
            ? Number(((resolved / total) * 100).toFixed(1))
            : 0;

    // ----------------------------------------
    // Complaints by Category
    // ----------------------------------------

    const categoryCounts = {};

    complaints.forEach((complaint) => {
        const category = complaint.category || "Other";

        categoryCounts[category] =
            (categoryCounts[category] || 0) + 1;
    });

    const complaintsByCategory = Object.entries(categoryCounts)
        .map(([category, count]) => ({
            category,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    // ----------------------------------------
    // Complaints by Status
    // ----------------------------------------

    const statusCounts = {};

    complaints.forEach((complaint) => {
        const status = complaint.status || "Unknown";

        statusCounts[status] =
            (statusCounts[status] || 0) + 1;
    });

    const complaintsByStatus = Object.entries(statusCounts)
        .map(([status, count]) => ({
            status,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    // ----------------------------------------
    // Complaints over time
    // ----------------------------------------

    const dateCounts = {};

    complaints.forEach((complaint) => {
        const date = complaint.date;

        if (!date) return;

        dateCounts[date] =
            (dateCounts[date] || 0) + 1;
    });

    const complaintsOverTime = Object.entries(dateCounts)
        .map(([date, count]) => ({
            date,
            count,
        }))
        .reverse();

    // ----------------------------------------
    // Resolution trend
    // ----------------------------------------

    const resolvedByDate = {};

    complaints
        .filter((complaint) => complaint.status === "Resolved")
        .forEach((complaint) => {
            const date = complaint.date;

            if (!date) return;

            resolvedByDate[date] =
                (resolvedByDate[date] || 0) + 1;
        });

    const resolutionTrend = Object.entries(resolvedByDate)
        .map(([date, count]) => ({
            date,
            count,
        }))
        .reverse();

    return {
        total,
        resolved,
        inProgress,
        pending,
        resolutionRate,
        complaintsByCategory,
        complaintsByStatus,
        complaintsOverTime,
        resolutionTrend,
    };
};