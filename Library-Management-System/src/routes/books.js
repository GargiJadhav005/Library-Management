const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET all books (optional ?available=true/false filter)
router.get("/", (req, res) => {
  const { available, search } = req.query;
  let query = "SELECT * FROM books";
  const params = [];
  const conditions = [];

  if (available !== undefined) {
    conditions.push("available = ?");
    params.push(available === "true" ? 1 : 0);
  }
  if (search) {
    conditions.push("(LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR isbn LIKE ?)");
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY title";

  const books = db.prepare(query).all(...params);
  res.json(books);
});

// GET single book
router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// POST add new book
router.post("/", (req, res) => {
  const { title, author, isbn, available = true } = req.body;
  if (!title || !author || !isbn) {
    return res.status(400).json({ error: "title, author, and isbn are required" });
  }
  const existing = db.prepare("SELECT id FROM books WHERE isbn = ?").get(isbn);
  if (existing) return res.status(409).json({ error: "ISBN already exists" });

  const result = db
    .prepare("INSERT INTO books (title, author, isbn, available) VALUES (?, ?, ?, ?)")
    .run(title, author, String(isbn), available ? 1 : 0);

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(book);
});

// PUT update book
router.put("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  const { title, author, isbn, available } = req.body;
  db.prepare(
    "UPDATE books SET title = ?, author = ?, isbn = ?, available = ? WHERE id = ?"
  ).run(
    title    ?? book.title,
    author   ?? book.author,
    isbn     !== undefined ? String(isbn) : book.isbn,
    available !== undefined ? (available ? 1 : 0) : book.available,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE book
router.delete("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  if (!book.available) {
    return res.status(400).json({ error: "Cannot delete a book that is currently issued" });
  }

  db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  res.json({ message: "Book deleted successfully" });
});

module.exports = router;
