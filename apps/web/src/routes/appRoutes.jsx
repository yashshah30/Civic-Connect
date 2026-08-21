import { Routes, Route } from "react-router-dom";
import Notifications from "../pages/citizen/Notifications";

// Landing & Authentication
import Landing from "../pages/landing/landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import OTPVerification from "../pages/auth/OTPVerification";

// Citizen
import Dashboard from "../pages/citizen/dashboard";
import ReportComplaint from "../pages/citizen/ReportComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";

// Authority
import AuthorityDashboard from "../pages/authority/dashboard";

// 404
import NotFound from "../pages/notfound/notfound";

function AppRoutes() {
  return (
    <Routes>
      {/* Landing */}
      <Route
        path="/"
        element={<Landing />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/otp"
        element={<OTPVerification />}
      />

      {/* Citizen */}
      <Route
        path="/citizen/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/citizen/report"
        element={<ReportComplaint />}
      />

      <Route
        path="/citizen/complaints"
        element={<MyComplaints />}
      />

      <Route
        path="/citizen/complaints/:id"
        element={<ComplaintDetails />}
      />

      <Route
        path="/citizen/notifications"
        element={<Notifications />}
      />

      {/* Authority */}
      <Route
        path="/authority/dashboard"
        element={<AuthorityDashboard />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;