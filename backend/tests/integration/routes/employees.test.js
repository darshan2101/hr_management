const { expect } = require('chai');
const { startServer } = require('../../../server');
const { resetDb } = require('../../../src/db/database');

describe('Employees API', () => {
  let server;
  let baseUrl;

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

  it('POST /api/employees returns 201 with created employee', async () => {
    const payload = {
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    };

    const response = await createEmployee(payload);

    expect(response.status).to.equal(201);
    const body = await response.json();
    expect(body).to.include(payload);
    expect(body.id).to.be.a('number');
  });

  it('POST /api/employees returns 400 on missing required fields', async () => {
    const response = await createEmployee({
      job_title: 'Engineer',
      country: 'USA',
      salary: 120000
    });

    expect(response.status).to.equal(400);
  });

  it('GET /api/employees returns paginated results and supports filters', async () => {
    await createEmployee({
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    });
    await createEmployee({
      full_name: 'Bob Smith',
      job_title: 'Manager',
      department: 'Sales',
      country: 'USA',
      salary: 130000
    });
    await createEmployee({
      full_name: 'Carla Gomez',
      job_title: 'Designer',
      department: 'Design',
      country: 'Spain',
      salary: 90000
    });

    const paged = await fetch(`${baseUrl}/api/employees?page=1&limit=2`);
    expect(paged.status).to.equal(200);
    const pagedBody = await paged.json();
    expect(pagedBody.total).to.equal(3);
    expect(pagedBody.data).to.have.lengthOf(2);
    expect(pagedBody.page).to.equal(1);
    expect(pagedBody.limit).to.equal(2);

    const filtered = await fetch(`${baseUrl}/api/employees?country=Spain`);
    const filteredBody = await filtered.json();
    expect(filteredBody.total).to.equal(1);
    expect(filteredBody.data[0].country).to.equal('Spain');

    const searched = await fetch(`${baseUrl}/api/employees?search=Engineer`);
    const searchedBody = await searched.json();
    expect(searchedBody.total).to.equal(1);
    expect(searchedBody.data[0].job_title).to.equal('Engineer');
  });

  it('GET /api/employees/countries returns sorted countries list', async () => {
    await createEmployee({
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    });
    await createEmployee({
      full_name: 'Carla Gomez',
      job_title: 'Designer',
      department: 'Design',
      country: 'Spain',
      salary: 90000
    });
    await createEmployee({
      full_name: 'Brian Taylor',
      job_title: 'Accountant',
      department: 'Finance',
      country: 'USA',
      salary: 85000
    });

    const response = await fetch(`${baseUrl}/api/employees/countries`);

    expect(response.status).to.equal(200);
    const body = await response.json();
    expect(body.countries).to.deep.equal(['Spain', 'USA']);
  });

  it('GET /api/employees/:id returns employee or 404', async () => {
    const created = await (await createEmployee({
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    })).json();

    const found = await fetch(`${baseUrl}/api/employees/${created.id}`);
    expect(found.status).to.equal(200);
    const foundBody = await found.json();
    expect(foundBody.id).to.equal(created.id);

    const missing = await fetch(`${baseUrl}/api/employees/9999`);
    expect(missing.status).to.equal(404);
  });

  it('PATCH /api/employees/:id returns updated employee or 404', async () => {
    const created = await (await createEmployee({
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    })).json();

    const updated = await fetch(`${baseUrl}/api/employees/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: 'Senior Engineer' })
    });

    expect(updated.status).to.equal(200);
    const updatedBody = await updated.json();
    expect(updatedBody.job_title).to.equal('Senior Engineer');

    const missing = await fetch(`${baseUrl}/api/employees/9999`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: 'Senior Engineer' })
    });
    expect(missing.status).to.equal(404);
  });

  it('DELETE /api/employees/:id returns 204 on success or 404', async () => {
    const created = await (await createEmployee({
      full_name: 'Alice Johnson',
      job_title: 'Engineer',
      department: 'R&D',
      country: 'USA',
      salary: 120000
    })).json();

    const removed = await fetch(`${baseUrl}/api/employees/${created.id}`, {
      method: 'DELETE'
    });
    expect(removed.status).to.equal(204);

    const missing = await fetch(`${baseUrl}/api/employees/9999`, {
      method: 'DELETE'
    });
    expect(missing.status).to.equal(404);
  });
});
