const { expect } = require('chai');
const Database = require('better-sqlite3');
const { initializeSchema } = require('../../../src/db/schema');
const InsightsRepository = require('../../../src/repositories/InsightsRepository');

describe('InsightsRepository', () => {
  let db;
  let repo;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    repo = new InsightsRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  const seedEmployees = () => {
    const insert = db.prepare(`
      INSERT INTO employees (full_name, job_title, department, country, salary)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run('Alice Johnson', 'Engineer', 'R&D', 'USA', 120000);
    insert.run('Bob Smith', 'Manager', 'Sales', 'USA', 130000);
    insert.run('Carla Gomez', 'Designer', 'Design', 'Spain', 90000);
    insert.run('Daniel Lee', 'Engineer', 'Platform', 'Canada', 110000);
    insert.run('Eva Chen', 'Engineer', 'R&D', 'USA', 150000);
    insert.run('Farah Ali', 'Analyst', 'Finance', 'UAE', 70000);
  };

  it('getSummary returns totals, averages, and ranges', () => {
    seedEmployees();

    const summary = repo.getSummary();

    expect(summary.totalEmployees).to.equal(6);
    expect(summary.avgSalary).to.be.closeTo(111666.6667, 0.01);
    expect(summary.topCountries[0]).to.include({ country: 'USA', count: 3 });
    expect(summary.salaryRanges).to.be.an('array');
  });

  it('getSummary includes min/max salaries and distinct counts', () => {
    seedEmployees();

    const summary = repo.getSummary();

    expect(summary.maxSalary).to.equal(150000);
    expect(summary.minSalary).to.equal(70000);
    expect(summary.totalCountries).to.equal(4);
    expect(summary.totalJobTitles).to.equal(4);
  });
});
