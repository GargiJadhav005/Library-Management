const express = require("express");
const cors    = require("cors");
const db      = require("./db/database");
const seed    = require("./db/seed");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ── Boot: wait for sql.js to initialise, then seed, then start ───────────────
db.ready.then(async () => {
  await seed();

  // Mount routes AFTER db is ready
  const studentsRouter = require("./routes/students");
  const booksRouter    = require("./routes/books");
  const issuesRouter   = require("./routes/issues");

  app.use("/api/students", studentsRouter);
  app.use("/api/books",    booksRouter);
  app.use("/api/issues",   issuesRouter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, () => {
    console.log(`Library Management API running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialise database:", err);
  process.exit(1);
});
