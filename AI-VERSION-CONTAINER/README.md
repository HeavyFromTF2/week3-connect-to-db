# Todo List REST API

A Node.js + Express REST API for a todo list, backed by PostgreSQL, documented with Swagger (OpenAPI 3.0).

## Features

- Full CRUD for tasks: `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`
- Auto-creates the `tasks` table on startup if it doesn't exist
- Seeds 3 initial tasks on startup, only if the table is empty
- All SQL queries use parameterized statements (`$1`, `$2`, ...) to prevent SQL injection
- Interactive Swagger docs at `/api-docs`
- Fully containerized with Docker + Docker Compose (API + PostgreSQL)
- Runs on port **3001**

## Project structure

```
todo-api/
├── config/
│   ├── db.js          # PostgreSQL pool, table creation + seeding
│   └── swagger.js      # Swagger/OpenAPI spec configuration
├── routes/
│   └── tasks.js         # CRUD routes for /api/tasks
├── server.js            # App entry point
├── package.json
├── Dockerfile            # API image
├── compose.yaml          # API + PostgreSQL services
├── .env                  # Environment variables (already filled in)
└── .dockerignore
```

## Quick start (Docker Compose — recommended)

Everything (API + PostgreSQL) runs with a single command. No local Node.js or PostgreSQL installation needed.

```bash
docker compose up --build
```

Then visit:

- API base URL: `http://localhost:3001/api/tasks`
- Swagger UI: `http://localhost:3001/api-docs`
- Health check: `http://localhost:3001/health`

To stop:

```bash
docker compose down
```

To stop and also remove the database volume (full reset, next start will reseed):

```bash
docker compose down -v
```

## Environment variables (`.env`)

The included `.env` file already contains working defaults:

```
PORT=3001

DB_HOST=db
DB_PORT=5432
DB_USER=todo_user
DB_PASSWORD=todo_password
DB_NAME=todo_db

POSTGRES_USER=todo_user
POSTGRES_PASSWORD=todo_password
POSTGRES_DB=todo_db
```

Feel free to change the credentials before running `docker compose up`.

## Running without Docker (optional, for local development)

Requires Node.js 18+ and a running PostgreSQL instance.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Update `.env` so `DB_HOST` points to your local PostgreSQL instance (e.g. `localhost`).
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/tasks`      | List all tasks       |
| GET    | `/api/tasks/:id`  | Get a single task    |
| POST   | `/api/tasks`      | Create a new task     |
| PUT    | `/api/tasks/:id`  | Update a task         |
| DELETE | `/api/tasks/:id`  | Delete a task         |

### Example: create a task

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Read a book", "description": "Finish chapter 5", "completed": false}'
```

### Task object shape

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and coffee",
  "completed": false,
  "created_at": "2026-07-23T10:00:00.000Z",
  "updated_at": "2026-07-23T10:00:00.000Z"
}
```

## Security notes

- All queries use parameterized placeholders (`$1`, `$2`, ...) via the `pg` library, never string concatenation, to prevent SQL injection.
- Input is validated before insert/update (e.g. `title` must be a non-empty string).
