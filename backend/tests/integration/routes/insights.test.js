const { expect } = require('chai');
const { startServer } = require('../../../server');
const { resetDb } = require('../../../src/db/database');

describe('Insights API', () => {
  let server;
  let baseUrl;

  const seedEmployees = [
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
    },
    {
      full_name: 'Daniel Lee',
      job_title: 'Engineer',
      department: 'Platform',
      country: 'Canada',
      salary: 110000
    },
    {
      full_name: 'Eva Chen',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 150000
    },
    {
      full_name: 'Farah Ali',
      job_title: 'Analyst',
      department: 'Finance',
      country: 'UAE',
      salary: 70000
    }
  ];

  const createEmployee = async (payload) => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response;
  };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    resetDb();
    server = startServer(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;

    for (const employee of seedEmployees) {
      await createEmployee(employee);
    }
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
    resetDb();
  });

  it('GET /api/insights/country/:country returns stats or 404', async () => {
    const response = await fetch(`${baseUrl}/api/insights/country/USA`);
    expect(response.status).to.equal(200);
    const body = await response.json();
    expect(body.country).to.equal('USA');
    expect(body.min).to.equal(120000);
    expect(body.max).to.equal(150000);
    expect(body.count).to.equal(3);
    expect(body.avg).to.be.closeTo(133333.3333, 0.01);

    const missing = await fetch(`${baseUrl}/api/insights/country/Brazil`);
    expect(missing.status).to.equal(404);
  });

  it('GET /api/insights/jobtitle returns stats or 404', async () => {
    const response = await fetch(
      `${baseUrl}/api/insights/jobtitle?country=USA&jobTitle=Engineer`
    );
    expect(response.status).to.equal(200);
    const body = await response.json();
    expect(body.country).to.equal('USA');
    expect(body.jobTitle).to.equal('Engineer');
    expect(body.count).to.equal(2);
    expect(body.avg).to.equal(135000);

    const missing = await fetch(
      `${baseUrl}/api/insights/jobtitle?country=USA&jobTitle=Architect`
    );
    expect(missing.status).to.equal(404);
  });

  it('GET /api/insights/summary returns totals and ranges', async () => {
    const response = await fetch(`${baseUrl}/api/insights/summary`);
    expect(response.status).to.equal(200);
    const body = await response.json();

    expect(body.totalEmployees).to.equal(6);
    expect(body.avgSalary).to.be.closeTo(111666.6667, 0.01);
    expect(body.topCountries).to.be.an('array');
    expect(body.topCountries[0]).to.include({ country: 'USA', count: 3 });

    const ranges = body.salaryRanges.reduce((acc, range) => {
      acc[range.range] = range.count;
      return acc;
    }, {});

    expect(ranges['0-49999']).to.equal(0);
    expect(ranges['50000-99999']).to.equal(2);
    expect(ranges['100000-149999']).to.equal(3);
    expect(ranges['150000+']).to.equal(1);
  });
});
