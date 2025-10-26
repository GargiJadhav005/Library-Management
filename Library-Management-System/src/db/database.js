const initSqlJs = require("sql.js");
const fs        = require("fs");
const path      = require("path");

const DB_PATH = path.join(__dirname, "../../library.db");

let db;  // sql.js Database instance

/**
 * Persist the in-memory database back to disk.
 * Called after every write operation.
 */
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Thin wrapper that makes sql.js behave like better-sqlite3
 * for the simple synchronous API used by the routes.
 */
function makeStatement(sql) {
  return {
    /** Returns first row or undefined */
    get(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    /** Returns all rows */
    all(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    /** Runs a write statement, returns { lastInsertRowid, changes } */
    run(...params) {
      db.run(sql, params);
      persist();
      return {
        lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0],
        changes: db.getRowsModified(),
      };
    },
  };
}

/**
 * Initialise the database synchronously.
 * sql.js init is async, so we expose a `ready` promise that the server awaits.
 */
const ready = (async () => {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      roll     INTEGER PRIMARY KEY,
      name     TEXT    NOT NULL,
      balance  REAL    NOT NULL DEFAULT 0
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT    NOT NULL,
      author    TEXT    NOT NULL,
      isbn      TEXT    NOT NULL UNIQUE,
      available INTEGER NOT NULL DEFAULT 1
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      student_roll INTEGER NOT NULL,
      book_id      INTEGER NOT NULL,
      issue_date   TEXT    NOT NULL,
      return_date  TEXT,
      fine         REAL    NOT NULL DEFAULT 0,
      status       TEXT    NOT NULL DEFAULT 'issued',
      FOREIGN KEY (student_roll) REFERENCES students(roll),
      FOREIGN KEY (book_id)      REFERENCES books(id)
    );
  `);

  persist(); // save freshly-created schema
})();

/**
 * Exported interface — mirrors the better-sqlite3 API used in routes.
 */
module.exports = {
  /** Access the ready promise (await in server.js before starting) */
  get ready() { return ready; },

  prepare(sql) { return makeStatement(sql); },

  /** Execute multiple statements (used for transactions) */
  exec(sql) { db.run(sql); persist(); },

  /**
   * transaction(fn) — wraps fn in a BEGIN/COMMIT block.
   * Returns a function that, when called, runs the transaction and returns fn's result.
   */
  transaction(fn) {
    return function (...args) {
      db.run("BEGIN;");
      try {
        const result = fn(...args);
        db.run("COMMIT;");
        persist();
        return result;
      } catch (e) {
        db.run("ROLLBACK;");
        throw e;
      }
    };
  },
};
