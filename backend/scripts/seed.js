const fs = require('fs');
const path = require('path');
const { getDb, resetDb } = require('../src/db/database');

const FIRST_NAMES_PATH = path.join(__dirname, 'first_names.txt');
const LAST_NAMES_PATH = path.join(__dirname, 'last_names.txt');

const COUNTRIES = [
  'USA',
  'Canada',
  'UK',
  'Germany',
  'France',
  'Spain',
  'India',
  'Singapore',
  'UAE',
  'Australia'
];

const JOB_TITLES = [
  { title: 'Engineer', min: 90000, max: 160000 },
  { title: 'Senior Engineer', min: 120000, max: 190000 },
  { title: 'Staff Engineer', min: 150000, max: 230000 },
  { title: 'Manager', min: 110000, max: 180000 },
  { title: 'Director', min: 160000, max: 260000 },
  { title: 'Designer', min: 70000, max: 130000 },
  { title: 'Product Manager', min: 105000, max: 185000 },
  { title: 'Analyst', min: 60000, max: 110000 },
  { title: 'HR Specialist', min: 55000, max: 95000 },
  { title: 'Accountant', min: 65000, max: 120000 },
  { title: 'Sales Lead', min: 80000, max: 150000 },
  { title: 'Support Engineer', min: 60000, max: 105000 }
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Finance',
  'HR',
  'Sales',
  'Support',
  'Operations',
  'Marketing'
];

function readNames(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[randomInt(0, list.length - 1)];
}

function seedEmployees(db, count) {
  const firstNames = readNames(FIRST_NAMES_PATH);
  const lastNames = readNames(LAST_NAMES_PATH);

  const start = Date.now();

  db.exec('DELETE FROM employees;');
  db.exec("DELETE FROM sqlite_sequence WHERE name='employees';");

  const insert = db.prepare(`
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

  const transaction = db.transaction((total) => {
    for (let i = 0; i < total; i += 1) {
      const firstName = pickRandom(firstNames);
      const lastName = pickRandom(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const job = pickRandom(JOB_TITLES);
      const country = pickRandom(COUNTRIES);
      const department = pickRandom(DEPARTMENTS);
      const salary = randomInt(job.min, job.max);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`;
      const hireYear = randomInt(2015, 2024);
      const hireMonth = String(randomInt(1, 12)).padStart(2, '0');
      const hireDay = String(randomInt(1, 28)).padStart(2, '0');
      const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

      insert.run(
        fullName,
        job.title,
        department,
        country,
        salary,
        'USD',
        email,
        hireDate
      );
    }
  });

  transaction(count);

  const elapsedMs = Date.now() - start;

  return { count, elapsedMs };
}

if (require.main === module) {
  const count = Number(process.argv[2]) || 10000;
  const db = getDb();
  const result = seedEmployees(db, count);
  const rowCount = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;
  console.log(`Seeded ${rowCount} employees in ${result.elapsedMs} ms.`);
}

module.exports = { seedEmployees };
