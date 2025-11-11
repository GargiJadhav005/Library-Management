import { useEffect, useState } from "react";
import {
  getIssues, getBooks, getStudents, issueBook, returnBook,
  type Issue, type Book, type Student,
} from "../api/client";
import "../styles/Panel.css";

export default function IssuePanel() {
  const [issues, setIssues]     = useState<Issue[]>([]);
  const [books, setBooks]       = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "issued" | "returned">("issued");
  const [showForm, setShowForm] = useState(false);
  const [selStudent, setSelStudent] = useState("");
  const [selBook, setSelBook]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  async function load() {
    const params = statusFilter === "all" ? {} : { status: statusFilter };
    const [iss, bks, sts] = await Promise.all([
      getIssues(params),
      getBooks({ available: true }),
      getStudents(),
    ]);
    setIssues(iss);
    setBooks(bks);
    setStudents(sts);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!selStudent || !selBook) return setMsg("Select both a student and a book.");
    setLoading(true);
    try {
      await issueBook(Number(selStudent), Number(selBook));
      setMsg("Book issued successfully.");
      setShowForm(false);
      setSelStudent("");
      setSelBook("");
      load();
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMsg(m ?? "Error issuing book.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(issue: Issue) {
    if (!confirm(`Return "${issue.book_title}" for ${issue.student_name}?`)) return;
    try {
      const result = await returnBook(issue.id);
      setMsg(result.message ?? "Book returned.");
      load();
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMsg(m ?? "Error returning book.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="issued">Currently Issued</option>
          <option value="returned">Returned</option>
          <option value="all">All</option>
        </select>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg(""); }}>
          {showForm ? "Cancel" : "+ Issue Book"}
        </button>
      </div>

      {msg && <div className="panel-msg">{msg}</div>}

      {showForm && (
        <form className="panel-form" onSubmit={handleIssue}>
          <h3>Issue a Book</h3>
          <div className="form-row">
            <select required value={selStudent} onChange={(e) => setSelStudent(e.target.value)}>
              <option value="">— Select Student —</option>
              {students.map((s) => (
                <option key={s.roll} value={s.roll}>
                  {s.name} (Roll {s.roll})
                </option>
              ))}
            </select>
            <select required value={selBook} onChange={(e) => setSelBook(e.target.value)}>
              <option value="">— Select Available Book —</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Issuing…" : "Issue"}
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Book</th>
              <th>Issued</th>
              <th>Returned</th>
              <th>Fine</th>
              <th>Status</th>
              {statusFilter !== "returned" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr><td colSpan={8} className="empty-row">No records found</td></tr>
            )}
            {issues.map((issue) => (
              <tr key={issue.id} className={issue.fine > 0 && issue.status === "issued" ? "row-overdue" : ""}>
                <td className="mono">{issue.id}</td>
                <td>{issue.student_name} <span className="muted">(#{issue.student_roll})</span></td>
                <td>{issue.book_title}</td>
                <td>{issue.issue_date}</td>
                <td>{issue.return_date ?? "—"}</td>
                <td>{issue.fine > 0 ? <span className="fine-badge">₹{issue.fine}</span> : "—"}</td>
                <td>
                  <span className={`badge ${issue.status === "issued" ? "badge-blue" : "badge-gray"}`}>
                    {issue.status}
                  </span>
                </td>
                {statusFilter !== "returned" && (
                  <td className="actions-cell">
                    {issue.status === "issued" && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleReturn(issue)}>
                        Return
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-count">{issues.length} record{issues.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
