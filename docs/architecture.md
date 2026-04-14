# Architecture

## Stack Overview
- Backend: Node.js, Express, better-sqlite3
- Database: SQLite (file-backed in production, in-memory for tests)
- Frontend: React, Vite, Tailwind CSS, React Router, Axios

## Layering Model
```
Routes -> Controllers -> Repositories -> SQLite
```

- Routes: `backend/src/routes/*.js` define HTTP endpoints.
- Controllers: `backend/src/controllers/*.js` map requests to repository calls.
- Repositories: `backend/src/repositories/*.js` encapsulate SQL queries.

## Database Schema Summary
Table: `employees`

Columns:
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `full_name` TEXT NOT NULL
- `job_title` TEXT NOT NULL
- `department` TEXT
- `country` TEXT NOT NULL
- `salary` REAL NOT NULL
- `currency` TEXT DEFAULT 'USD'
- `email` TEXT UNIQUE
- `hire_date` TEXT
- `created_at` TEXT DEFAULT (datetime('now'))

Indexes:
- `idx_employees_country` on `country`
- `idx_employees_job_title` on `job_title`

Index rationale:
- Country and job title are common filter dimensions for list and insights queries.

## API Endpoints
| Method | Path | Description | Query Params |
| --- | --- | --- | --- |
| GET | `/api/hello` | Health check | - |
| POST | `/api/employees` | Create employee | - |
| GET | `/api/employees` | List employees (paged) | `page`, `limit`, `search`, `country`, `jobTitle` |
| GET | `/api/employees/countries` | Distinct country list | - |
| GET | `/api/employees/:id` | Fetch employee by id | - |
| PATCH | `/api/employees/:id` | Update employee | - |
| DELETE | `/api/employees/:id` | Delete employee | - |
| GET | `/api/insights/country/:country` | Salary stats by country | - |
| GET | `/api/insights/jobtitle` | Salary stats by job title + country | `jobTitle`, `country` |
| GET | `/api/insights/summary` | Summary stats + ranges | - |

## Frontend Page Structure
- Dashboard: summary cards, SVG charts (salary ranges, top countries)
- Employees: directory table, filters, sorting, add/edit modal, view modal, delete confirm
- Insights: country insights, job title insights, salary distribution bars
