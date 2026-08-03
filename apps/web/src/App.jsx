import { Routes, Route } from 'react-router-dom'

import Landing from './pages/landing/landing'
import Login from './pages/login/login'
import CitizenDashboard from './pages/citizen/dashboard'
import AuthorityDashboard from './pages/authority/dashboard'
import NotFound from './pages/notfound/notfound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/citizen/dashboard"
        element={<CitizenDashboard />}
      />
      <Route
        path="/authority/dashboard"
        element={<AuthorityDashboard />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}