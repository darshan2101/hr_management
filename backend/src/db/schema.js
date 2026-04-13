function initializeSchema(db) {
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
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create index on country
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country)
  `);

  // Create index on job_title
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title)
  `);
}

module.exports = {
  initializeSchema
};
