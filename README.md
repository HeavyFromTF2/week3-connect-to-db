# 🚀 Todo List API - FlyRank Week 3 Assignments

A task management CRUD API built for the FlyRank Internship Backend Track.

---

# 📦 Task 1: Persistent CRUD API (SQLite Version)

A task management CRUD API updated to persist data using a local SQLite database for FlyRank Week 3.

## Why SQLite?

SQLite was chosen because it is serverless, zero-configuration, and self-contained in a single file (`tasks.db`). It provides persistent storage so data survives server restarts without the complexity of managing a separate database server.

## Database Storage

The database file `tasks.db` is created automatically at the root of the project upon starting the server.

## How to Run

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node index.js
```

The server will run at:

```text
http://localhost:3000
```

Just clone this repository and try it out.

## API Documentation

You can test all endpoints visually using Swagger UI.

**Swagger UI**

```text
http://localhost:3000/docs
```

## Available Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | API Info |
| GET | `/health` | Health Check |
| GET | `/tasks` | List all tasks (supports `?done=true` and `?search=term`) |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Testing Search with SQL (`LIKE` Operator)

**Command**

```bash
curl "http://localhost:3000/tasks?search=Learn"
```

**Output**

```json
[
  {
    "id": 1,
    "title": "Learn Express basics",
    "done": true
  }
]
```

## Database Screenshot

<img width="600" height="450" alt="SQLite Database Screenshot" src="https://github.com/user-attachments/assets/0474db6d-be19-4984-851e-9a963ff55904" />

## Example SQL Query

**Query executed**

```sql
SELECT * FROM tasks WHERE done = 1;
```

**Result**

Returned only the tasks marked as completed (`done = 1`), specifically **"Learn Express basics"** and **"Edit simple task"**.

## AI Usage

Continuing from last week, I used AI as an active coach and code-review tool rather than a shortcut.

- **Database & SQL Guidance:** Used AI to understand `better-sqlite3`, parameterized queries (`?`), and how SQLite integers (`0/1`) map to JavaScript booleans.
- **Stage 6 Benchmarking & Code Review:** Used AI to generate an isolated version of the API, allowing me to run `git diff`, analyze structural choices, and evaluate performance trade-offs (e.g., in-memory response construction vs. additional database queries).
- **Documentation:** Used AI to help polish this `README.md`.

---

# ⚔️ AI vs Me (Stage 6 – Rematch)

## Initial Prompt Used

```text
Build a simple CRUD task api in node.js using Express and better-sqlite3. Save data in a SQLite file named tasks.db. When starting, automatically create a 'tasks' table with columns: id (integer primary key), title (text), and done (integer/boolean). Implement endpoints: GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, and DELETE /tasks/:id. Use parameterized queries everywhere. Validate empty titles with status 400 and missing IDs with status 404. Convert 0/1 SQLite integers to native JavaScript booleans in JSON responses. Put everything in a single index.js file. Make it as simple as possible.
```

## Execution & Verification Test

- **Startup:** The AI-generated code started on the first attempt and automatically created the `tasks.db` file.
- **Database Persistence:** Tasks created via `POST` survived server restarts without data loss.
- **Seeding Behavior:** Since the prompt did not mention seeding, the database started completely empty (`[]`).

## Analysis

### 1. What did it do better?

- **Clean Data Transformation:** It created a reusable helper:

```javascript
toJSON(row) {
  return { ...row, done: !!row.done };
}
```

This kept the response formatting DRY instead of repeating `Boolean()` conversions throughout the routes.

- **Strict Input Validation:** It checked `typeof title !== "string"` during `POST` and `PUT`, preventing invalid payloads from causing runtime errors.

### 2. What did it get wrong or quietly ignore?

- **Extra Database Queries:** After every `INSERT` and `UPDATE`, it performed an extra `SELECT` to retrieve the updated row. My implementation instead constructed the response directly using `lastInsertRowid`, avoiding an unnecessary database round-trip.

- **Missing Features:** Because the prompt requested the "simplest possible" API, the AI omitted:
  - Initial database seeding
  - Root (`/`) endpoint
  - `/health`
  - Swagger documentation
  - Query filtering (`?search=` and `?done=`)

### 3. What did the prompt forget to specify (and what did AI decide)?

The original prompt did not specify:

- Initial database seeding
- Swagger documentation (`/docs`)
- `/health`
- SQL filtering using `LIKE`

I also forgot to mention that the database should start with three default tasks.

The AI additionally decided to allow clients to send a `done` value when creating a task, while my implementation always creates new tasks with:

```json
{
  "done": false
}
```

## The Rematch

### Improved Prompt

```text
Build a CRUD task API in Node.js using Express and better-sqlite3 using tasks.db. Create the 'tasks' table if missing and seed 3 default tasks ONLY if empty. Implement GET /health, GET /tasks (supporting ?search= with SQL LIKE and ?done= filters), GET /tasks/:id, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id, and Swagger UI documentation at /docs using openapi.json. Use parameterized queries everywhere, 400/404 error handling, and map 0/1 integers to JS booleans.
```

### Rematch Result

After explicitly requesting database seeding, query parameters, Swagger documentation, and the health endpoint, the regenerated AI implementation included all missing features and closely matched my hand-crafted solution.

---

# 🐳 Task 2: Containerize Your Stack (PostgreSQL & Docker Version)

A task management CRUD API updated to persist data using a PostgreSQL database running in Docker containers for FlyRank Week 3.

## Why PostgreSQL & Docker?

PostgreSQL was chosen to move from lightweight single-file storage (SQLite) to a robust, production-ready Relational Database Management System (RDBMS).

Docker Compose orchestrates both the Node.js API container and the PostgreSQL database container, providing isolated environments and seamless networking.

## Database Storage & Resilience

PostgreSQL data is persisted using a Docker Volume (`taskdata`) mounted at:

```text
/var/lib/postgresql/data
```

This ensures all data survives container restarts, rebuilds, and shutdowns.

To avoid startup race conditions, a health check (`pg_isready`) is configured for the database container.

The API waits until PostgreSQL is ready by using:

```yaml
depends_on:
  db:
    condition: service_healthy
```

## How to Run

Ensure **Docker** and **Docker Desktop** are installed and running.

Build and start the environment:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:3000
```

Stop the containers:

```bash
docker compose down
```

Stop the containers and remove the database volume:

```bash
docker compose down -v
```

## API Documentation

You can test all endpoints visually using Swagger UI.

**Swagger UI**

```text
http://localhost:3000/docs
```

## Available Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | List all tasks (supports `?done=true` and `?search=term`) |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Testing Search with SQL (`ILIKE` Operator)

**Command**

```bash
curl "http://localhost:3000/tasks?search=Learn"
```

**Output**

```json
[
  {
    "id": 1,
    "title": "Learn Express basics",
    "done": true
  }
]
```

## Database Screenshot

> Add your PostgreSQL database screenshot here.

## Example SQL Query

**Query executed**

```sql
SELECT * FROM tasks WHERE done = true;
```

**Result**

Returned only the completed tasks (`done = true`), specifically **"Learn Express basics"**.

## AI Usage

Continuing from last week, I used AI as an active coach and code-review tool rather than a shortcut.

- **PostgreSQL & Containerization Guidance:** Used AI to understand `docker-compose.yml`, persistent Docker volumes, fixed image tags (`postgres:16-alpine`), and health checks using `pg_isready`.
- **Connection Lifecycle Debugging:** Used AI to diagnose startup race conditions (`ECONNREFUSED`) and PostgreSQL volume initialization issues across different major versions.
- **Documentation:** Used AI to help polish this `README.md`.
