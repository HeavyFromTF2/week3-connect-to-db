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