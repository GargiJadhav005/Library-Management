import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BooksPanel from "../components/BooksPanel";
import StudentsPanel from "../components/StudentsPanel";
import IssuePanel from "../components/IssuePanel";
import FinesPanel from "../components/FinesPanel";
import "../styles/AdminDashboard.css";

type Tab = "books" | "students" | "issues" | "fines";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "books",    label: "Books",    icon: "📖" },
  { id: "students", label: "Students", icon: "🎓" },
  { id: "issues",   label: "Issues",   icon: "🔄" },
  { id: "fines",    label: "Fines",    icon: "💰" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("books");
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">📚</span>
          <span className="sidebar-title">Library</span>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <button className="nav-item logout-btn" onClick={() => navigate("/")}>
          <span className="nav-icon">⬅️</span>
          <span>Back</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2>{TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}</h2>
          <span className="admin-badge">Admin</span>
        </header>
        <div className="admin-content">
          {tab === "books"    && <BooksPanel />}
          {tab === "students" && <StudentsPanel />}
          {tab === "issues"   && <IssuePanel />}
          {tab === "fines"    && <FinesPanel />}
        </div>
      </main>
    </div>
  );
}
