const Database = require('better-sqlite3');
const path = require('path');

let db = null;

function getDb() {
  if (!db) {
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'hr.db');
    db = new Database(dbPath);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  // Create employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      department TEXT,
      country TEXT NOT NULL,
      salary REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      email TEXT UNIQUE,
      hire_date TEXT,
      created_at TEXT DEFAULT current_timestamp
    )
  `);

  // Create indexes on country and job_title
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title)
  `);
}

module.exports = {
  getDb
};
