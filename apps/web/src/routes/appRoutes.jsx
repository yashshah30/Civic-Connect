import { Routes, Route } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import Login from "../pages/login/Login";
import CitizenDashboard from "../pages/citizen/Dashboard";
import AuthorityDashboard from "../pages/authority/Dashboard";
import NotFound from "../pages/notfound/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
      <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;