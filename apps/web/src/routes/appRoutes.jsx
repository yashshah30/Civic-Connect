import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import OTPVerification from "../pages/auth/OTPVerification";

import Dashboard from "../pages/citizen/dashboard";
import AuthorityDashboard from "../pages/authority/dashboard";
import Landing from "../pages/landing/landing";
import NotFound from "../pages/notfound/notfound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Landing />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp" element={<OTPVerification />} />

      {/* Other Pages */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/citizen/dashboard" element={<Dashboard />} />
      <Route path="/authority/dashboard" element={<AuthorityDashboard />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}