import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userRole = user?.role || "citizen";

      if (userRole !== allowedRole) {
        const target =
          userRole === "authority"
            ? "/authority/dashboard"
            : "/citizen/dashboard";
        return <Navigate to={target} replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
