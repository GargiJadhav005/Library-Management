const express = require("express");
const router = express.Router();
const db = require("../db/database");

const FINE_PER_DAY = 2; // ₹2 per day after 14-day free period
const FREE_DAYS = 14;

function calcFine(issueDateStr) {
  const issued = new Date(issueDateStr);
  const today = new Date();
  const diffDays = Math.floor((today - issued) / (1000 * 60 * 60 * 24));
  const overdue = diffDays - FREE_DAYS;
  return overdue > 0 ? overdue * FINE_PER_DAY : 0;
}

// GET all issues (with student and book info)
router.get("/", (req, res) => {
  const { status, student_roll } = req.query;
  let query = `
    SELECT i.id, i.student_roll, s.name AS student_name,
           i.book_id, b.title AS book_title, b.isbn,
           i.issue_date, i.return_date, i.fine, i.status
    FROM issues i
    JOIN students s ON s.roll = i.student_roll
    JOIN books b    ON b.id   = i.book_id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }
  if (student_roll) {
    conditions.push("i.student_roll = ?");
    params.push(student_roll);
  }

  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY i.issue_date DESC";

  const issues = db.prepare(query).all(...params);

  // Attach live fine for currently-issued books
  const enriched = issues.map((issue) => ({
    ...issue,
    fine:
      issue.status === "issued"
        ? calcFine(issue.issue_date)
        : issue.fine,
  }));

  res.json(enriched);
});

// GET single issue
router.get("/:id", (req, res) => {
  const issue = db
    .prepare(
      `SELECT i.id, i.student_roll, s.name AS student_name,
              i.book_id, b.title AS book_title, b.isbn,
              i.issue_date, i.return_date, i.fine, i.status
       FROM issues i
       JOIN students s ON s.roll = i.student_roll
       JOIN books b    ON b.id   = i.book_id
       WHERE i.id = ?`
    )
    .get(req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue record not found" });

  if (issue.status === "issued") {
    issue.fine = calcFine(issue.issue_date);
  }
  res.json(issue);
});

// POST issue a book to a student
router.post("/", (req, res) => {
  const { student_roll, book_id } = req.body;
  if (!student_roll || !book_id) {
    return res.status(400).json({ error: "student_roll and book_id are required" });
  }

  const student = db
    .prepare("SELECT * FROM students WHERE roll = ?")
    .get(student_roll);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(book_id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (!book.available) {
    return res.status(400).json({ error: "Book is not available for issue" });
  }

  // Check student doesn't already have this book
  const alreadyIssued = db
    .prepare(
      "SELECT id FROM issues WHERE student_roll = ? AND book_id = ? AND status = 'issued'"
    )
    .get(student_roll, book_id);
  if (alreadyIssued) {
    return res.status(400).json({ error: "Student already has this book issued" });
  }

  const issueBook = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO issues (student_roll, book_id, issue_date, status, fine)
         VALUES (?, ?, date('now'), 'issued', 0)`
      )
      .run(student_roll, book_id);

    db.prepare("UPDATE books SET available = 0 WHERE id = ?").run(book_id);

    return result.lastInsertRowid;
  });

  const newId = issueBook();
  const issue = db
    .prepare(
      `SELECT i.id, i.student_roll, s.name AS student_name,
              i.book_id, b.title AS book_title, b.isbn,
              i.issue_date, i.return_date, i.fine, i.status
       FROM issues i
       JOIN students s ON s.roll = i.student_roll
       JOIN books b    ON b.id   = i.book_id
       WHERE i.id = ?`
    )
    .get(newId);

  res.status(201).json(issue);
});

// POST return a book  (/issues/:id/return)
router.post("/:id/return", (req, res) => {
  const issue = db
    .prepare("SELECT * FROM issues WHERE id = ?")
    .get(req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue record not found" });
  if (issue.status === "returned") {
    return res.status(400).json({ error: "Book already returned" });
  }

  const fine = calcFine(issue.issue_date);

  const returnBook = db.transaction(() => {
    db.prepare(
      `UPDATE issues
       SET status = 'returned', return_date = date('now'), fine = ?
       WHERE id = ?`
    ).run(fine, issue.id);

    db.prepare("UPDATE books SET available = 1 WHERE id = ?").run(issue.book_id);

    // Deduct fine from student balance if fine > 0
    if (fine > 0) {
      db.prepare(
        "UPDATE students SET balance = MAX(0, balance - ?) WHERE roll = ?"
      ).run(fine, issue.student_roll);
    }
  });

  returnBook();

  const updated = db
    .prepare(
      `SELECT i.id, i.student_roll, s.name AS student_name,
              i.book_id, b.title AS book_title, b.isbn,
              i.issue_date, i.return_date, i.fine, i.status
       FROM issues i
       JOIN students s ON s.roll = i.student_roll
       JOIN books b    ON b.id   = i.book_id
       WHERE i.id = ?`
    )
    .get(req.params.id);

  res.json({ ...updated, message: fine > 0 ? `Fine of ₹${fine} deducted` : "Returned with no fine" });
});

// GET fine summary for all overdue issues
router.get("/fines/summary", (req, res) => {
  const overdue = db
    .prepare(
      `SELECT i.id, i.student_roll, s.name AS student_name,
              b.title AS book_title, i.issue_date,
              s.balance
       FROM issues i
       JOIN students s ON s.roll = i.student_roll
       JOIN books b    ON b.id   = i.book_id
       WHERE i.status = 'issued'`
    )
    .all();

  const result = overdue
    .map((r) => ({ ...r, fine: calcFine(r.issue_date) }))
    .filter((r) => r.fine > 0)
    .sort((a, b) => b.fine - a.fine);

  res.json(result);
});

module.exports = router;
