class InsightsRepository {
  constructor(db) {
    this.db = db;
  }

  getByCountry(country) {
    const row = this.db.prepare(`
      SELECT
        country,
        MIN(salary) AS min,
        MAX(salary) AS max,
        AVG(salary) AS avg,
        COUNT(*) AS count
      FROM employees
      WHERE country = ?
      GROUP BY country
    `).get(country);

    if (!row) {
      return null;
    }

    return row;
  }

  getByJobTitle(jobTitle, country) {
    const row = this.db.prepare(`
      SELECT
        job_title AS jobTitle,
        country,
        AVG(salary) AS avg,
        COUNT(*) AS count
      FROM employees
      WHERE job_title = ? AND country = ?
      GROUP BY job_title, country
    `).get(jobTitle, country);

    if (!row) {
      return null;
    }

    return row;
  }

  getSummary() {
    const totalEmployees = this.db.prepare(`
      SELECT COUNT(*) AS count
      FROM employees
    `).get().count;

    const avgSalary = this.db.prepare(`
      SELECT AVG(salary) AS avg
      FROM employees
    `).get().avg ?? 0;

    const topCountries = this.db.prepare(`
      SELECT country, COUNT(*) AS count
      FROM employees
      GROUP BY country
      ORDER BY count DESC, country ASC
      LIMIT 3
    `).all();

    const ranges = this.db.prepare(`
      SELECT
        CASE
          WHEN salary < 50000 THEN '0-49999'
          WHEN salary < 100000 THEN '50000-99999'
          WHEN salary < 150000 THEN '100000-149999'
          ELSE '150000+'
        END AS range,
        COUNT(*) AS count
      FROM employees
      GROUP BY range
      ORDER BY
        CASE range
          WHEN '0-49999' THEN 1
          WHEN '50000-99999' THEN 2
          WHEN '100000-149999' THEN 3
          ELSE 4
        END
    `).all();

    const rangeDefaults = [
      { range: '0-49999', count: 0 },
      { range: '50000-99999', count: 0 },
      { range: '100000-149999', count: 0 },
      { range: '150000+', count: 0 }
    ];

    const countsByRange = ranges.reduce((acc, range) => {
      acc[range.range] = range.count;
      return acc;
    }, {});

    const salaryRanges = rangeDefaults.map((range) => ({
      range: range.range,
      count: countsByRange[range.range] ?? 0
    }));

    return {
      totalEmployees,
      avgSalary,
      topCountries,
      salaryRanges
    };
  }
}

module.exports = InsightsRepository;
