# HR Management

Full-stack HR management tool with a Node/Express backend and a React/Vite frontend.

## Prerequisites
- Node.js 18+
- npm

## Setup
From the repo root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run
Backend (default port 4000):

```bash
cd backend
npm run start
```

Frontend (Vite dev server, default port 5173):

```bash
cd frontend
npm run dev
```

Note: The frontend API client and Vite proxy currently target `http://localhost:3000`.
To use the backend default port (4000), update `frontend/vite.config.js` and
`frontend/src/api/client.js`, or run the backend on port 3000.

## Seed Data
Creates 10,000 employees and resets the table first (idempotent).

```bash
cd backend
npm run seed
```

## Tests
Backend test suite (Mocha/Chai). Last run: 39 tests.

```bash
cd backend
npm run tests
```

## Project Structure
```
backend/
  src/
    controllers/
    db/
    repositories/
    routes/
    utils/
  scripts/
  tests/
frontend/
  src/
    api/
    components/
    pages/
docs/
  architecture.md
  ai-approach.md
  tradeoffs.md
```

## Feature Summary
- Dashboard: summary cards and SVG charts from `/api/insights/summary`.
- Employees: table with filters, sorting, add/edit modal, view modal, delete confirm.
- Insights: country and job-title salary insights plus distribution overview.
