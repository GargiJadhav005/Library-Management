import { useEffect, useState, useCallback } from "react";
import { getBooks, createBook, updateBook, deleteBook, type Book } from "../api/client";
import "../styles/Panel.css";

const EMPTY: Omit<Book, "id"> = { title: "", author: "", isbn: "", available: 1 };

export default function BooksPanel() {
  const [books, setBooks]       = useState<Book[]>([]);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"all" | "available" | "issued">("all");
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  const load = useCallback(async () => {
    const params: { available?: boolean; search?: string } = {};
    if (filter === "available") params.available = true;
    if (filter === "issued")    params.available = false;
    if (search.trim())          params.search = search.trim();
    const data = await getBooks(params);
    setBooks(data);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(b: Book) {
    setForm({ title: b.title, author: b.author, isbn: b.isbn, available: b.available });
    setEditId(b.id);
    setShowForm(true);
    setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateBook(editId, form);
        setMsg("Book updated.");
      } else {
        await createBook(form);
        setMsg("Book added.");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMsg(msg ?? "Error saving book.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(b: Book) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBook(b.id);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(msg ?? "Cannot delete book.");
    }
  }

  return (
    <div className="panel">
      {/* Toolbar */}
      <div className="panel-toolbar">
        <input
          className="search-input"
          placeholder="Search title, author, ISBN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
      </div>

      {msg && <div className="panel-msg">{msg}</div>}

      {/* Add / Edit form */}
      {showForm && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Edit Book" : "Add Book"}</h3>
          <div className="form-row">
            <input required placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input required placeholder="Author" value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div className="form-row">
            <input required placeholder="ISBN" value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            <select value={form.available}
              onChange={(e) => setForm({ ...form, available: Number(e.target.value) })}>
              <option value={1}>Available</option>
              <option value={0}>Not Available</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : editId ? "Update" : "Add"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No books found</td></tr>
            )}
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td className="mono">{b.isbn}</td>
                <td>
                  <span className={`badge ${b.available ? "badge-green" : "badge-red"}`}>
                    {b.available ? "Available" : "Issued"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-count">{books.length} book{books.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
