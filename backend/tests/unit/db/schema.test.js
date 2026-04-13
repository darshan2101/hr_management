const { expect } = require('chai');
const Database = require('better-sqlite3');
const { initializeSchema } = require('../../../src/db/schema');

describe('Database Schema', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('initializeSchema', () => {
    it('should create employees table', () => {
      initializeSchema(db);

      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='employees'
      `).get();

      expect(tableExists).to.exist;
      expect(tableExists.name).to.equal('employees');
    });

    it('should have required columns in employees table', () => {
      initializeSchema(db);

      const columns = db.prepare(`
        PRAGMA table_info(employees)
      `).all();

      const columnNames = columns.map(col => col.name);

      expect(columnNames).to.include('id');
      expect(columnNames).to.include('full_name');
      expect(columnNames).to.include('job_title');
      expect(columnNames).to.include('department');
      expect(columnNames).to.include('country');
      expect(columnNames).to.include('salary');
      expect(columnNames).to.include('currency');
      expect(columnNames).to.include('email');
      expect(columnNames).to.include('hire_date');
      expect(columnNames).to.include('created_at');
    });

    it('should enforce NOT NULL constraints on required columns', () => {
      initializeSchema(db);

      const columns = db.prepare(`
        PRAGMA table_info(employees)
      `).all();

      const requiresNotNull = (columnName) => {
        const column = columns.find(col => col.name === columnName);
        return column && column.notnull === 1;
      };

      expect(requiresNotNull('full_name')).to.equal(true);
      expect(requiresNotNull('job_title')).to.equal(true);
      expect(requiresNotNull('country')).to.equal(true);
      expect(requiresNotNull('salary')).to.equal(true);
    });

    it('should have UNIQUE constraint on email', () => {
      initializeSchema(db);

      // Insert first employee
      const insert = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary, email)
        VALUES (?, ?, ?, ?, ?)
      `);

      insert.run('John Doe', 'Engineer', 'USA', 100000, 'john@example.com');

      // Try to insert duplicate email
      expect(() => {
        insert.run('Jane Doe', 'Manager', 'USA', 120000, 'john@example.com');
      }).to.throw();
    });

    it('should have PRIMARY KEY on id with AUTOINCREMENT', () => {
      initializeSchema(db);

      const columns = db.prepare(`
        PRAGMA table_info(employees)
      `).all();

      const idColumn = columns.find(col => col.name === 'id');
      expect(idColumn.pk).to.equal(1);
    });

    it('should have default value USD for currency', () => {
      initializeSchema(db);

      const insert = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `);

      insert.run('John Doe', 'Engineer', 'USA', 100000);

      const result = db.prepare('SELECT * FROM employees').get();
      expect(result.currency).to.equal('USD');
    });

    it('should have created_at default to current_timestamp', () => {
      initializeSchema(db);

      const insert = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `);

      insert.run('John Doe', 'Engineer', 'USA', 100000);

      const result = db.prepare('SELECT * FROM employees').get();
      expect(result.created_at).to.exist;
      expect(result.created_at).not.to.be.null;
    });

    it('should create index on country column', () => {
      initializeSchema(db);

      const indexExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='index' AND name='idx_employees_country'
      `).get();

      expect(indexExists).to.exist;
      expect(indexExists.name).to.equal('idx_employees_country');
    });

    it('should create index on job_title column', () => {
      initializeSchema(db);

      const indexExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='index' AND name='idx_employees_job_title'
      `).get();

      expect(indexExists).to.exist;
      expect(indexExists.name).to.equal('idx_employees_job_title');
    });
  });
});
