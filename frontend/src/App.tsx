import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelect      from "./pages/RoleSelect";
import AdminDashboard  from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<RoleSelect />} />
      <Route path="/admin"   element={<AdminDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  );
}
