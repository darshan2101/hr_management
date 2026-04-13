const express = require('express');
const EmployeeRepository = require('./src/repositories/EmployeeRepository');
const EmployeeController = require('./src/controllers/EmployeeController');
const { createEmployeeRouter } = require('./src/routes/employees');
const InsightsRepository = require('./src/repositories/InsightsRepository');
const InsightsController = require('./src/controllers/InsightsController');
const { createInsightsRouter } = require('./src/routes/insights');
const { getDb } = require('./src/db/database');

const PORT = process.env.PORT || 4000;

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
  });

  const db = getDb();
  const employeeRepository = new EmployeeRepository(db);
  const employeeController = new EmployeeController(employeeRepository);
  const insightsRepository = new InsightsRepository(db);
  const insightsController = new InsightsController(insightsRepository);

  app.use('/api/employees', createEmployeeRouter(employeeController));
  app.use('/api/insights', createInsightsRouter(insightsController));

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }

    if (err && typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
      res.status(400).json({ error: 'Invalid employee data' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

function startServer(port = PORT) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
