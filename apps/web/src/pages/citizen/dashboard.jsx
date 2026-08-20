import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Button from "../../components/ui/button";
import ComplaintStats from "../../components/citizen/ComplaintStats";
import ComplaintCard from "../../components/citizen/ComplaintCard";

const complaints = [
  {
    id: "#CC-001",
    title: "Road pothole near college",
    category: "Road",
    location: "Bhopal",
    date: "20 Aug 2026",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "#CC-002",
    title: "Garbage collection issue",
    category: "Sanitation",
    location: "Bhopal",
    date: "18 Aug 2026",
    status: "Under Review",
    priority: "Medium",
  },
  {
    id: "#CC-003",
    title: "Water leakage in residential area",
    category: "Water",
    location: "Bhopal",
    date: "15 Aug 2026",
    status: "Resolved",
    priority: "Low",
  },
];

const stats = {
  total: 12,
  submitted: 3,
  inProgress: 4,
  resolved: 5,
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome Section */}
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

            <div className="md:w-auto">
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

        {/* Statistics */}
        <section className="mb-8">
          <ComplaintStats stats={stats} />
        </section>

        {/* Recent Complaints */}
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
            {complaints.map((complaint) => (
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