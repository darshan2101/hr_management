const { expect } = require('chai');
const { seedEmployees } = require('../../scripts/seed');
const { getDb, resetDb } = require('../../src/db/database');

describe('seedEmployees', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetDb();
  });

  afterEach(() => {
    resetDb();
  });

  it('inserts exactly the requested count', () => {
    const db = getDb();
    seedEmployees(db, 25);
    const count = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;
    expect(count).to.equal(25);
  });

  it('ensures required fields are non-null and salary is positive', () => {
    const db = getDb();
    seedEmployees(db, 50);
    const missing = db.prepare(`
      SELECT COUNT(*) AS count
      FROM employees
      WHERE full_name IS NULL
        OR job_title IS NULL
        OR country IS NULL
        OR salary IS NULL
    `).get().count;
    const nonPositive = db.prepare(`
      SELECT COUNT(*) AS count
      FROM employees
      WHERE salary <= 0
    `).get().count;

    expect(missing).to.equal(0);
    expect(nonPositive).to.equal(0);
  });

  it('is idempotent when run twice', () => {
    const db = getDb();
    seedEmployees(db, 40);
    seedEmployees(db, 40);
    const count = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;
    expect(count).to.equal(40);
  });

  it('seeds 10k rows under 2000ms', () => {
    const db = getDb();
    const result = seedEmployees(db, 10000);
    expect(result.elapsedMs).to.be.below(2000);
  });
});
