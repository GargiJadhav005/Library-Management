import { useEffect, useState } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent, type Student } from "../api/client";
import "../styles/Panel.css";

const EMPTY = { roll: "" as unknown as number, name: "", balance: 0 };

export default function StudentsPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");
  const [form, setForm]         = useState(EMPTY);
  const [editRoll, setEditRoll] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  async function load() {
    const data = await getStudents();
    setStudents(data);
  }

  useEffect(() => { load(); }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.roll).includes(search)
  );

  function openAdd() {
    setForm(EMPTY);
    setEditRoll(null);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(s: Student) {
    setForm({ roll: s.roll, name: s.name, balance: s.balance });
    setEditRoll(s.roll);
    setShowForm(true);
    setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editRoll) {
        await updateStudent(editRoll, { name: form.name, balance: form.balance });
        setMsg("Student updated.");
      } else {
        await createStudent({ roll: form.roll, name: form.name, balance: form.balance });
        setMsg("Student added.");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMsg(m ?? "Error saving student.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(s: Student) {
    if (!confirm(`Delete student "${s.name}" (Roll ${s.roll})?`)) return;
    try {
      await deleteStudent(s.roll);
      load();
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(m ?? "Cannot delete student.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <input
          className="search-input"
          placeholder="Search by name or roll…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>

      {msg && <div className="panel-msg">{msg}</div>}

      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <h3>{editRoll ? "Edit Student" : "Add Student"}</h3>
          <div className="form-row">
            <input
              required
              type="number"
              placeholder="Roll number"
              value={form.roll || ""}
              disabled={!!editRoll}
              onChange={(e) => setForm({ ...form, roll: Number(e.target.value) })}
            />
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="Balance (₹)"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : editRoll ? "Update" : "Add"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="empty-row">No students found</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.roll}>
                <td className="mono">{s.roll}</td>
                <td>{s.name}</td>
                <td>₹{s.balance}</td>
                <td className="actions-cell">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-count">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
