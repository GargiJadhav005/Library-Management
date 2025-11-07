import { useNavigate } from "react-router-dom";
import "../styles/RoleSelect.css";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="role-page">
      <div className="role-card">
        <div className="role-logo">📚</div>
        <h1 className="role-title">Library Management</h1>
        <p className="role-subtitle">Choose your role to continue</p>
        <div className="role-buttons">
          <button className="role-btn admin-btn" onClick={() => navigate("/admin")}>
            <span className="role-icon">🛠️</span>
            <span>Admin</span>
          </button>
          <button className="role-btn student-btn" onClick={() => navigate("/student")}>
            <span className="role-icon">🎓</span>
            <span>Student</span>
          </button>
        </div>
      </div>
    </div>
  );
}
