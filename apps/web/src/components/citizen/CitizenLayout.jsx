import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

import CitizenSidebar from "./CitizenSidebar";

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <div>
          <h1 className="text-lg font-bold text-blue-900">
            Civic Connect
          </h1>
          <p className="text-xs text-slate-500">
            Citizen Portal
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
        >
          {sidebarOpen ? (
            <FiX className="text-xl" />
          ) : (
            <FiMenu className="text-xl" />
          )}
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] lg:min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <CitizenSidebar onLogout={handleLogout} />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="fixed inset-y-0 left-0 z-50 flex w-64 lg:hidden">
              <CitizenSidebar onLogout={handleLogout} />
            </div>
          </>
        )}

        {/* Page Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
