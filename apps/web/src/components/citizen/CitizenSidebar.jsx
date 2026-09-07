import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiPlusCircle,
  FiBell,
  FiMap,
  FiActivity,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function CitizenSidebar({ onLogout }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/citizen/dashboard",
      icon: FiHome,
    },
    {
      name: "My Complaints",
      path: "/citizen/complaints",
      icon: FiFileText,
    },
    {
      name: "Report Complaint",
      path: "/citizen/report",
      icon: FiPlusCircle,
    },
    {
    name: "Track Complaint",
    path: "/citizen/track",
    icon: FiMap,
    },
    {
    name: "Activity",
    path: "/citizen/activity",
    icon: FiActivity,
    },
    {
      name: "Notifications",
      path: "/citizen/notifications",
      icon: FiBell,
    },

    {
      name: "Notification Preferences",
      path: "/citizen/preferences",
      icon: FiSettings,
    },

  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-900">
          Citizen Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Civic Connect
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-900 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-900"
                }`
              }
            >
              <Icon className="text-lg" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
}
