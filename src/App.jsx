import { Navigate, Route, Routes } from "react-router";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Profile from "./Pages/Profile";
import Incidents from "./Pages/Incidents";
import IncidentDetail from "./Pages/IncidentDetail";
import ReportIncident from "./Pages/ReportIncident";
import Patrols from "./Pages/Patrols";
import Alerts from "./Pages/Alerts";
import NotFound from "./Pages/NotFound";
import Layout from "./Layouts/Layout";
import ProtectedRoute from "./Auth/ProtectedRoute";
import GuestRoute from "./Auth/GuestRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/report-incident" element={<ReportIncident />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/patrols" element={<ProtectedRoute allowedRoles={["patrol_officer", "admin"]}><Patrols /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
