import { useNavigate } from "react-router-dom";
import { FiPlus, FiBell } from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Button from "../../components/ui/button";
import ComplaintStats from "../../components/citizen/ComplaintStats";
import ComplaintCard from "../../components/citizen/ComplaintCard";

import mockComplaints from "../../data/mockComplaints";
import mockNotifications from "../../data/mockNotifications";

export default function Dashboard() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // Calculate dashboard statistics from mock data
  // --------------------------------------------------

  const total = mockComplaints.length;

  const submitted = mockComplaints.filter(
    (complaint) => complaint.status === "Submitted"
  ).length;

  const inProgress = mockComplaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolved = mockComplaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const stats = {
    total,
    submitted,
    inProgress,
    resolved,
  };

  // --------------------------------------------------
  // Notification count
  // --------------------------------------------------

  const unreadNotifications = mockNotifications.filter(
    (notification) => !notification.read
  ).length;

  // --------------------------------------------------
  // Show latest 3 complaints
  // --------------------------------------------------

  const recentComplaints = [...mockComplaints]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* --------------------------------------------------
            Welcome Section
        -------------------------------------------------- */}

        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-medium text-blue-900">
                Citizen Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Welcome back, Citizen!
              </h1>

              <p className="mt-2 text-slate-600">
                Track your complaints and report civic issues in your area.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:w-auto">

              {/* Notifications Button */}
              <button
                onClick={() => navigate("/citizen/notifications")}
                className="relative flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FiBell className="text-lg" />

                Notifications

                {unreadNotifications > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Report Complaint */}
              <Button
                onClick={() => navigate("/citizen/report")}
                className="!w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiPlus />
                  Report New Complaint
                </span>
              </Button>

            </div>
          </div>
        </section>

        {/* --------------------------------------------------
            Statistics
        -------------------------------------------------- */}

        <section className="mb-8">
          <ComplaintStats stats={stats} />
        </section>

        {/* --------------------------------------------------
            Recent Complaints
        -------------------------------------------------- */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recent Complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overview of your latest reported issues.
              </p>
            </div>

            <button
              onClick={() => navigate("/citizen/complaints")}
              className="text-sm font-semibold text-blue-900 hover:underline"
            >
              View All
            </button>

          </div>

          <div className="grid gap-5">

            {recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
              />
            ))}

          </div>

        </section>

      </main>
    </div>
  );
}