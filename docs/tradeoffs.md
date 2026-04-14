# Engineering Tradeoffs

## SQLite over PostgreSQL
The backend uses SQLite via `better-sqlite3` (see `backend/package.json` and `backend/src/db`).
This keeps local setup simple and fast with no external DB dependency.

## Synchronous better-sqlite3 API
Repositories use synchronous queries (`.get()`, `.all()`, `.run()`), which keeps control flow
simple in a small service and avoids async connection pooling overhead.

## Single batched transaction for seeding
`backend/scripts/seed.js` wraps inserts in a single transaction, trading memory for speed.
This meets the performance test for inserting 10,000 rows.

## No ORM
SQL is written directly in repositories. This keeps queries explicit and avoids ORM setup
or runtime overhead for a small schema.

## No chart library
Frontend charts are rendered using SVG and CSS, avoiding extra dependencies while keeping
visuals straightforward and controllable.

## No global state library
Frontend state is kept in local component state. There is no Redux, Zustand, or context
store configured in the repo.

## Backend-only test coverage
Tests are configured under `backend/tests` with Mocha/Chai. No frontend test runner is
configured in `frontend/package.json`. This indicates the current test focus is backend APIs.

## Fixed pagination size
`EmployeeRepository.findAll` defaults to `limit = 20`, and the frontend uses `PAGE_SIZE = 20`.
This keeps paging consistent and predictable across the UI.
