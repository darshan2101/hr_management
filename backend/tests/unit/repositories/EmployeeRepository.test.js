const { expect } = require('chai');
const Database = require('better-sqlite3');
const { initializeSchema } = require('../../../src/db/schema');
const EmployeeRepository = require('../../../src/repositories/EmployeeRepository');

describe('EmployeeRepository', () => {
  let db;
  let repo;

  const seedEmployees = (records) => records.map((record) => repo.create(record));

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    repo = new EmployeeRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('create', () => {
    it('returns created employee with id', () => {
      const created = repo.create({
        full_name: 'Alice Johnson',
        job_title: 'Engineer',
        department: 'R&D',
        country: 'USA',
        salary: 120000,
        currency: 'USD',
        email: 'alice@example.com',
        hire_date: '2024-01-15'
      });

      expect(created).to.include({
        full_name: 'Alice Johnson',
        job_title: 'Engineer',
        department: 'R&D',
        country: 'USA',
        salary: 120000,
        currency: 'USD',
        email: 'alice@example.com',
        hire_date: '2024-01-15'
      });
      expect(created.id).to.be.a('number');
    });

    it('rejects missing required fields', () => {
      expect(() => {
        repo.create({
          job_title: 'Engineer',
          country: 'USA',
          salary: 120000
        });
      }).to.throw();
    });
  });

  describe('findAll', () => {
    it('returns paginated results', () => {
      seedEmployees([
        {
          full_name: 'Alice Johnson',
          job_title: 'Engineer',
          department: 'R&D',
          country: 'USA',
          salary: 120000
        },
        {
          full_name: 'Bob Smith',
          job_title: 'Manager',
          department: 'Sales',
          country: 'USA',
          salary: 130000
        },
        {
          full_name: 'Carla Gomez',
          job_title: 'Designer',
          department: 'Design',
          country: 'Spain',
          salary: 90000
        }
      ]);

      const result = repo.findAll({ page: 1, limit: 2 });

      expect(result.total).to.equal(3);
      expect(result.data).to.have.lengthOf(2);
      expect(result.page).to.equal(1);
      expect(result.limit).to.equal(2);
    });

    it('filters by country', () => {
      seedEmployees([
        {
          full_name: 'Alice Johnson',
          job_title: 'Engineer',
          department: 'R&D',
          country: 'USA',
          salary: 120000
        },
        {
          full_name: 'Carla Gomez',
          job_title: 'Designer',
          department: 'Design',
          country: 'Spain',
          salary: 90000
        }
      ]);

      const result = repo.findAll({ page: 1, limit: 10, country: 'Spain' });

      expect(result.total).to.equal(1);
      expect(result.data[0].country).to.equal('Spain');
    });

    it('filters by search on full_name and job_title', () => {
      seedEmployees([
        {
          full_name: 'Alice Johnson',
          job_title: 'Engineer',
          department: 'R&D',
          country: 'USA',
          salary: 120000
        },
        {
          full_name: 'Brian Taylor',
          job_title: 'Accountant',
          department: 'Finance',
          country: 'UK',
          salary: 85000
        }
      ]);

      const byName = repo.findAll({ page: 1, limit: 10, search: 'Alice' });
      const byTitle = repo.findAll({ page: 1, limit: 10, search: 'Engineer' });

      expect(byName.total).to.equal(1);
      expect(byName.data[0].full_name).to.equal('Alice Johnson');
      expect(byTitle.total).to.equal(1);
      expect(byTitle.data[0].job_title).to.equal('Engineer');
    });
  });

  describe('findById', () => {
    it('returns employee by id', () => {
      const created = repo.create({
        full_name: 'Alice Johnson',
        job_title: 'Engineer',
        department: 'R&D',
        country: 'USA',
        salary: 120000
      });

      const found = repo.findById(created.id);

      expect(found).to.include({ id: created.id, full_name: 'Alice Johnson' });
    });

    it('returns null when employee not found', () => {
      const found = repo.findById(999);

      expect(found).to.equal(null);
    });
  });

  describe('update', () => {
    it('returns updated employee', () => {
      const created = repo.create({
        full_name: 'Alice Johnson',
        job_title: 'Engineer',
        department: 'R&D',
        country: 'USA',
        salary: 120000
      });

      const updated = repo.update(created.id, { job_title: 'Senior Engineer', salary: 140000 });

      expect(updated).to.include({
        id: created.id,
        job_title: 'Senior Engineer',
        salary: 140000
      });
    });

    it('returns null for missing id', () => {
      const updated = repo.update(999, { job_title: 'Senior Engineer' });

      expect(updated).to.equal(null);
    });
  });

  describe('delete', () => {
    it('returns true on success', () => {
      const created = repo.create({
        full_name: 'Alice Johnson',
        job_title: 'Engineer',
        department: 'R&D',
        country: 'USA',
        salary: 120000
      });

      const result = repo.delete(created.id);

      expect(result).to.equal(true);
    });

    it('returns false if not found', () => {
      const result = repo.delete(999);

      expect(result).to.equal(false);
    });
  });
});
