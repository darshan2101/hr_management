const { expect } = require('chai');
const { startServer } = require('../server');

let server;
let baseUrl;

before(async () => {
  server = startServer(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

describe('Server API', () => {
  it('GET /api/hello returns the expected JSON response', async () => {
    const response = await fetch(`${baseUrl}/api/hello`);

    expect(response.status).to.equal(200);
    expect(response.headers.get('content-type')).to.equal('application/json; charset=utf-8');
    expect(await response.json()).to.deep.equal({ message: 'Hello, World!' });
  });

  it('unknown routes return 404', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);

    expect(response.status).to.equal(404);
  });
});
