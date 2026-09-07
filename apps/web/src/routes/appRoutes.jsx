import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Landing & Authentication
import Landing from "../pages/landing/landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import OTPVerification from "../pages/auth/OTPVerification";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Citizen
import Dashboard from "../pages/citizen/dashboard";
import ReportComplaint from "../pages/citizen/ReportComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";
import Notifications from "../pages/citizen/Notifications";
import ComplaintHistory from "../pages/citizen/ComplaintHistory";
import CitizenAnalytics from "../pages/citizen/CitizenAnalytics";
import CitizenLayout from "../components/citizen/CitizenLayout";

// Authority
import AuthorityDashboard from "../pages/authority/AuthorityDashboard";
import AuthorityComplaints from "../pages/authority/AuthorityComplaints";
import AuthorityComplaintDetails from "../pages/authority/AuthorityComplaintDetails";
import CivicMap from "../pages/authority/CivicMap";

// 404
import NotFound from "../pages/notfound/notfound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/landing" replace />}
        />

        {/* Landing */}
        <Route
          path="/landing"
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
          path="/reset-password"
          element={<ResetPassword />}
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

        <Route
          path="/citizen/activity"
          element={<CitizenAnalytics />}
        />

        <Route
          path="/citizen/history"
          element={<ComplaintHistory />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<CitizenLayout />}>
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
          </Route>
        </Route>

        {/* Authority */}
        <Route
          path="/authority/dashboard"
          element={<AuthorityDashboard />}
        />

        <Route
          path="/authority/complaints"
          element={<AuthorityComplaints />}
        />

        <Route
          path="/authority/complaints/:id"
          element={<AuthorityComplaintDetails />}
        />

        <Route
          path="/authority/map"
          element={<CivicMap />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;