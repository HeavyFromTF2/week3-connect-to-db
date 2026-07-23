# 🚀 Todo List API - FlyRank Week 3

Task management REST API built for the FlyRank Backend Internship.

---

# 📦 Assignment A2 – SQLite CRUD API

This version stores tasks in a local SQLite database (`tasks.db`) using `better-sqlite3`.

## Run

```bash
npm install
node index.js
```

API: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

## Endpoints

- `GET /`
- `GET /health`
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## SQL Example

```sql
SELECT * FROM tasks WHERE done = 1;
```

## Database

*(Insert SQLite screenshot here)*

## AI Usage

AI was used as a learning and code-review tool to better understand:

- `better-sqlite3`
- Parameterized SQL queries
- SQLite boolean mapping (`0/1` ↔ `true/false`)
- Documentation improvements

---

## ⚔️ AI vs Me (Stage 6)

### What AI did better

- Reusable helper for boolean conversion.
- Better payload validation.

### What AI missed

- No database seeding.
- No `/health`.
- No Swagger.
- No search/filter support.

### Rematch

After improving the prompt to include seeding, Swagger and filtering, the generated solution closely matched my implementation.

---

# 🐳 Assignment A3 – PostgreSQL & Docker

The project was migrated from SQLite to PostgreSQL running in Docker.

## Run

```bash
docker compose up --build
```

API: `http://localhost:3000`

Stop:

```bash
docker compose down
```

Remove database volume:

```bash
docker compose down -v
```

## Features

- PostgreSQL
- Docker Compose
- Persistent Docker volume
- Health checks (`pg_isready`)
- Swagger documentation

## SQL Example

```sql
SELECT * FROM tasks WHERE done = true;
```

## Database

*(Insert PostgreSQL screenshot here)*

## AI Usage

AI was used to:

- Understand Docker Compose
- Configure PostgreSQL
- Debug connection startup issues
- Improve the project documentation
