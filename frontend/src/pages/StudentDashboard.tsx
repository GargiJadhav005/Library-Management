import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudent, getStudentIssues, type Student, type Issue } from "../api/client";
import "../styles/StudentDashboard.css";

export default function StudentDashboard() {
  const [rollInput, setRollInput] = useState("");
  const [student, setStudent]     = useState<Student | null>(null);
  const [issues, setIssues]       = useState<Issue[]>([]);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  async function handleSearch() {
    const roll = parseInt(rollInput, 10);
    if (!roll) return setError("Enter a valid roll number");
    setLoading(true);
    setError("");
    try {
      const [s, iss] = await Promise.all([getStudent(roll), getStudentIssues(roll)]);
      setStudent(s);
      setIssues(iss);
    } catch {
      setStudent(null);
      setIssues([]);
      setError("Student not found. Check the roll number.");
    } finally {
      setLoading(false);
    }
  }

  const activeIssues   = issues.filter((i) => i.status === "issued");
  const returnedIssues = issues.filter((i) => i.status === "returned");
  const totalFine      = activeIssues.reduce((sum, i) => sum + i.fine, 0);

  return (
    <div className="student-page">
      <button className="back-btn" onClick={() => navigate("/")}>⬅ Back</button>

      <div className="student-hero">
        <span className="hero-icon">🎓</span>
        <h1>Student Portal</h1>
        <p>Enter your roll number to view your library account</p>
      </div>

      <div className="search-bar">
        <input
          type="number"
          placeholder="Roll number (e.g. 75)"
          value={rollInput}
          onChange={(e) => setRollInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <div className="student-error">{error}</div>}

      {student && (
        <div className="student-results">
          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-avatar">{student.name[0].toUpperCase()}</div>
            <div className="profile-info">
              <h2>{student.name}</h2>
              <span className="profile-roll">Roll #{student.roll}</span>
            </div>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">₹{student.balance}</span>
                <span className="stat-label">Balance</span>
              </div>
              <div className="stat">
                <span className="stat-value">{activeIssues.length}</span>
                <span className="stat-label">Books Issued</span>
              </div>
              {totalFine > 0 && (
                <div className="stat fine-stat">
                  <span className="stat-value">₹{totalFine}</span>
                  <span className="stat-label">Total Fine</span>
                </div>
              )}
            </div>
          </div>

          {/* Currently issued */}
          {activeIssues.length > 0 && (
            <section className="issues-section">
              <h3>📖 Currently Issued</h3>
              <div className="issue-list">
                {activeIssues.map((issue) => (
                  <div key={issue.id} className={`issue-card ${issue.fine > 0 ? "overdue" : ""}`}>
                    <div className="issue-book">
                      <strong>{issue.book_title}</strong>
                      <span className="issue-isbn">ISBN: {issue.isbn}</span>
                    </div>
                    <div className="issue-meta">
                      <span>Issued: {issue.issue_date}</span>
                      {issue.fine > 0 ? (
                        <span className="fine-badge">Fine: ₹{issue.fine}</span>
                      ) : (
                        <span className="ok-badge">No fine</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* History */}
          {returnedIssues.length > 0 && (
            <section className="issues-section">
              <h3>🕐 Borrow History</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Issued</th>
                    <th>Returned</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {returnedIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td>{issue.book_title}</td>
                      <td>{issue.issue_date}</td>
                      <td>{issue.return_date ?? "—"}</td>
                      <td>{issue.fine > 0 ? `₹${issue.fine}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {issues.length === 0 && (
            <p className="no-issues">No borrowing history found.</p>
          )}
        </div>
      )}
    </div>
  );
}
