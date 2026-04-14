class EmployeeRepository {
  constructor(db) {
    this.db = db;
  }

  create(data) {
    const statement = this.db.prepare(`
      INSERT INTO employees (
        full_name,
        job_title,
        department,
        country,
        salary,
        currency,
        email,
        hire_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
      data.full_name,
      data.job_title,
      data.department ?? null,
      data.country,
      data.salary,
      data.currency ?? null,
      data.email ?? null,
      data.hire_date ?? null
    );

    return this.findById(result.lastInsertRowid);
  }

  findAll({ page = 1, limit = 20, search, country, jobTitle } = {}) {
    const filters = [];
    const params = [];

    if (country) {
      filters.push('country = ?');
      params.push(country);
    }

    if (jobTitle) {
      filters.push('job_title = ?');
      params.push(jobTitle);
    }

    if (search) {
      filters.push('(full_name LIKE ? OR job_title LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const data = this.db.prepare(`
      SELECT *
      FROM employees
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = this.db.prepare(`
      SELECT COUNT(*) AS count
      FROM employees
      ${whereClause}
    `).get(...params).count;

    return { data, total, page, limit };
  }

  findById(id) {
    const statement = this.db.prepare(`
      SELECT *
      FROM employees
      WHERE id = ?
    `);

    return statement.get(id) || null;
  }

  getDistinctCountries() {
    const rows = this.db.prepare(`
      SELECT DISTINCT country
      FROM employees
      ORDER BY country ASC
    `).all();

    return rows.map((row) => row.country);
  }

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const updates = [];
    const params = [];
    const fields = [
      'full_name',
      'job_title',
      'department',
      'country',
      'salary',
      'currency',
      'email',
      'hire_date'
    ];

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    });

    if (updates.length === 0) {
      return existing;
    }

    params.push(id);

    this.db.prepare(`
      UPDATE employees
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);

    return this.findById(id);
  }

  delete(id) {
    const result = this.db.prepare(`
      DELETE FROM employees
      WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }
}

module.exports = EmployeeRepository;
