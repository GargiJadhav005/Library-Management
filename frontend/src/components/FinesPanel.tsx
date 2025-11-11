import { useEffect, useState } from "react";
import { getFinesSummary, type FineSummary } from "../api/client";
import "../styles/Panel.css";

export default function FinesPanel() {
  const [fines, setFines]   = useState<FineSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getFinesSummary();
    setFines(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totalFine = fines.reduce((sum, f) => sum + f.fine, 0);

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <span className="toolbar-info">
          Overdue fine rate: <strong>₹2 / day</strong> after 14-day free period
        </span>
        <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
      </div>

      {/* Summary strip */}
      <div className="fines-summary-strip">
        <div className="summary-card">
          <span className="summary-value">{fines.length}</span>
          <span className="summary-label">Overdue Issues</span>
        </div>
        <div className="summary-card red">
          <span className="summary-value">₹{totalFine}</span>
          <span className="summary-label">Total Outstanding Fine</span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Fine (₹)</th>
                <th>Student Balance</th>
              </tr>
            </thead>
            <tbody>
              {fines.length === 0 && (
                <tr><td colSpan={6} className="empty-row">🎉 No overdue fines!</td></tr>
              )}
              {fines.map((f) => (
                <tr key={f.id} className="row-overdue">
                  <td className="mono">{f.id}</td>
                  <td>{f.student_name} <span className="muted">(#{f.student_roll})</span></td>
                  <td>{f.book_title}</td>
                  <td>{f.issue_date}</td>
                  <td><span className="fine-badge">₹{f.fine}</span></td>
                  <td className={f.balance < f.fine ? "text-red" : ""}>₹{f.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
