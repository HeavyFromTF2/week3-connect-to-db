// Import Express and core dependencies
const express = require('express');
const Database = require('better-sqlite3');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const PORT = 3000;

// STAGE 0: Initialize SQLite database instance
const db = new Database('tasks.db');

// Load Swagger API specification
const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));

app.use(express.json());

// STAGE 0: Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// STAGE 0: Seed default tasks if database is empty
const count = db.prepare('SELECT COUNT(*) AS total FROM tasks').get().total;
if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run("Learn Express basics", 1);
  insert.run("Build Stage 2 of CRUD API", 0);
  insert.run("Practice git commits", 0);
}

// GET / - API Info
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

// GET /health - Health Check
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// STAGE 1 + EXTRA: Read tasks (supports ?search and ?done filters)
app.get('/tasks', (req, res) => {
  const { done, search } = req.query;
  let rows;

  if (search) {
    rows = db.prepare('SELECT * FROM tasks WHERE title LIKE ?').all(`%${search}%`);
  } else if (done !== undefined) {
    const isDoneVal = done === 'true' ? 1 : 0;
    rows = db.prepare('SELECT * FROM tasks WHERE done = ?').all(isDoneVal);
  } else {
    rows = db.prepare('SELECT * FROM tasks').all();
  }

  const tasks = rows.map(task => ({
    ...task,
    done: Boolean(task.done)
  }));

  res.json(tasks);
});

// STAGE 1: Read task by ID
app.get('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  res.json({
    ...task,
    done: Boolean(task.done)
  });
});

// STAGE 2: Create task
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insert.run(title.trim(), 0);

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    title: title.trim(),
    done: false
  });
});

// STAGE 3: Update task
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, done } = req.body;

  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!existingTask) {
    return res.status(404).json({ error: 'No task found' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const isDone = done ? 1 : 0;
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title.trim(), isDone, taskId);

  res.status(200).json({
    id: Number(taskId),
    title: title.trim(),
    done: Boolean(isDone)
  });
});

// STAGE 3: Delete task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'No task found' });
  }

  res.status(204).send();
});

// STAGE 5: Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});