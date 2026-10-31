import { NavLink, useNavigate } from "react-router-dom";
import {
    FiHome,
    FiFileText,
    FiPlusCircle,
    FiBell,
    FiLogOut,
    FiMapPin,
    FiMap,
    FiActivity,
    FiSettings,
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
            name: "City Civic Pulse",
            path: "/civic-pulse",
            icon: FiActivity,
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
        <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="border-b border-slate-100 px-6 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
                        <FiMapPin size={21} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Civic Connect
                        </h2>

                        <p className="text-xs font-medium text-slate-500">
                            Citizen Portal
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-4 pt-6">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Menu
                </p>

                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-blue-900 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-900"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            size={19}
                                            className={
                                                isActive
                                                    ? "text-white"
                                                    : "text-slate-400 group-hover:text-blue-900"
                                            }
                                        />

                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom */}
            <div className="mt-auto border-t border-slate-100 p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                    <FiLogOut
                        size={19}
                        className="text-slate-400 group-hover:text-red-600"
                    />

                    Logout
                </button>
            </div>
        </aside>
    );
}