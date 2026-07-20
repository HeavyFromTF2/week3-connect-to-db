# Todo List API - FlyRank Week 3 Assignment (SQLite Version)

A task management CRUD API updated to persist data using a local SQLite database for FlyRank Week 3.

## Why SQLite?
SQLite was chosen because it is serverless, zero-configuration, and self-contained in a single file (`tasks.db`). It provides persistent storage so data survives server restarts without the complexity of managing a separate database server.

## Database Storage
The database file `tasks.db` is created automatically at the root of the project upon starting the server.

## How to Run

1. Install dependencies: npm install
2. Start the server: node index.js

The server will run on http://localhost:3000.

Just clone this repo and try it out.

## API Documentation

You can test all endpoints visually using Swagger UI:
* Swagger UI: http://localhost:3000/docs

## Available Endpoints

* GET / - API Info
* GET /health - Health Check
* GET /tasks - List all tasks (supports filtering via `?done=true` or search via `?search=term`)
* GET /tasks/:id - Get a task by ID
* POST /tasks - Create a task
* PUT /tasks/:id - Update a task
* DELETE /tasks/:id - Delete a task

## Testing Search with SQL (LIKE operator)
You can test the search functionality directly in your terminal:

* **Command:** `curl "http://localhost:3000/tasks?search=Learn"`
* **Output:** `[{"id":1,"title":"Learn Express basics","done":true}]`

## Database Screenshot
![DB Browser Screenshot](./db-screenshot.png)

## Example SQL Query
* **Query executed:** `SELECT * FROM tasks WHERE done = 1;`
* **Output/Result:** Returned only the tasks marked as completed (`done = 1`), specifically "Learn Express basics" and "Edit simple task".


## AI vs me (Stage 6 - Rematch)

### Initial Prompt Used:
"Build a simple CRUD task api in node.js using Express and better-sqlite3. Save data in a SQLite file named tasks.db. When starting, automatically create a 'tasks' table with columns: id (integer primary key), title (text), and done (integer/boolean). Implement endpoints: GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, and DELETE /tasks/:id. Use parameterized queries everywhere. Validate empty titles with status 400 and missing IDs with status 404. Convert 0/1 SQLite integers to native JavaScript booleans in JSON responses. Put everything in a single index.js file. Make it as simple as possible."

---

### Execution & Verification Test:
* **Startup:** The AI code started on the first attempt and automatically generated the `tasks.db` file.
* **Database Persistency:** Tasks created via POST survived server restarts without data loss.
* **Seeding Behavior:** Because initial seeding was omitted from the prompt, the database started completely empty (`[]`).

---

### Analysis (3 Core Questions):

1. **What did it do better?**
   * **Clean Data Transformation:** It wrote a concise `toJSON(row)` helper function (`{ ...row, done: !!row.done }`) to convert SQLite `0/1` integers to native booleans. This kept the response formatting DRY across all routes instead of repeating `Boolean()` inline.
   * **Strict Input Validation:** It added explicit type checking (`typeof title !== 'string'`) in POST and PUT payloads to prevent crashes when non-string values are sent.

2. **What did it get wrong or quietly ignore?**
   * **Extra Database Queries:** On `POST` and `PUT`, after executing `INSERT` or `UPDATE`, it performed an additional `SELECT` query just to fetch and return the modified row. In my hand-built version, I constructed the response object directly using `lastInsertRowid` in memory, saving an extra database round-trip.
   * **Missing Features:** Because the prompt asked for the "simplest possible" API, the AI silently omitted database seeding, root `/` metadata, `/health` endpoints, Swagger documentation, and query filtering (`?search=` / `?done=`).

3. **What did the prompt forget to specify (and what did AI decide)?**
   * The prompt forgot to specify initial database seeding, Swagger `/docs` setup, `/health` check endpoints, and SQL query filters (`LIKE`).
   * I did not put in the prompt for the DB to start with 3 initial base tasks
   * The AI silently decided to allow passing the `done` state during `POST` creation (defaulting to `0` if absent), whereas my manual API forces new tasks to start with `done: false`.

---

### The Rematch:
* **Improved Prompt:** "Build a CRUD task API in Node.js using Express and better-sqlite3 using tasks.db. Create the 'tasks' table if missing and seed 3 default tasks ONLY if empty. Implement GET /health, GET /tasks (supporting ?search= with SQL LIKE and ?done= filters), GET /tasks/:id, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id, and Swagger UI documentation at /docs using openapi.json. Use parameterized queries everywhere, 400/404 error handling, and map 0/1 integers to JS booleans."
* **Rematch Result:** By explicitly requesting table seeding, query parameters, and Swagger UI setup at /docs in the updated prompt, the regenerated AI code included all missing features, matching my hand-crafted submission.