const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET all students
router.get("/", (req, res) => {
  const students = db.prepare("SELECT * FROM students ORDER BY roll").all();
  res.json(students);
});

// GET single student by roll
router.get("/:roll", (req, res) => {
  const student = db
    .prepare("SELECT * FROM students WHERE roll = ?")
    .get(req.params.roll);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

// GET issued books for a student (active issues)
router.get("/:roll/issues", (req, res) => {
  const issues = db
    .prepare(
      `SELECT i.id, b.title, b.author, b.isbn, i.issue_date, i.return_date, i.fine, i.status
       FROM issues i
       JOIN books b ON b.id = i.book_id
       WHERE i.student_roll = ?
       ORDER BY i.issue_date DESC`
    )
    .all(req.params.roll);
  res.json(issues);
});

// POST create new student
router.post("/", (req, res) => {
  const { roll, name, balance = 0 } = req.body;
  if (!roll || !name) {
    return res.status(400).json({ error: "roll and name are required" });
  }
  const existing = db.prepare("SELECT roll FROM students WHERE roll = ?").get(roll);
  if (existing) return res.status(409).json({ error: "Roll number already exists" });

  db.prepare("INSERT INTO students (roll, name, balance) VALUES (?, ?, ?)").run(
    roll,
    name,
    balance
  );
  const student = db.prepare("SELECT * FROM students WHERE roll = ?").get(roll);
  res.status(201).json(student);
});

// PUT update student
router.put("/:roll", (req, res) => {
  const { name, balance } = req.body;
  const student = db
    .prepare("SELECT * FROM students WHERE roll = ?")
    .get(req.params.roll);
  if (!student) return res.status(404).json({ error: "Student not found" });

  db.prepare(
    "UPDATE students SET name = ?, balance = ? WHERE roll = ?"
  ).run(
    name ?? student.name,
    balance ?? student.balance,
    req.params.roll
  );
  const updated = db.prepare("SELECT * FROM students WHERE roll = ?").get(req.params.roll);
  res.json(updated);
});

// DELETE student
router.delete("/:roll", (req, res) => {
  const student = db
    .prepare("SELECT * FROM students WHERE roll = ?")
    .get(req.params.roll);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const activeIssues = db
    .prepare("SELECT id FROM issues WHERE student_roll = ? AND status = 'issued'")
    .all(req.params.roll);
  if (activeIssues.length > 0) {
    return res.status(400).json({ error: "Cannot delete student with active book issues" });
  }

  db.prepare("DELETE FROM students WHERE roll = ?").run(req.params.roll);
  res.json({ message: "Student deleted successfully" });
});

module.exports = router;
