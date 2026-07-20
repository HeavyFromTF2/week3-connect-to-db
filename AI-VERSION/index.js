const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Helper: convert SQLite row (0/1 done) to JSON-friendly object (boolean done)
function toJSON(row) {
  return { id: row.id, title: row.title, done: !!row.done };
}

// GET /tasks - list all tasks
app.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  res.json(rows.map(toJSON));
});

// GET /tasks/:id - get a single task
app.get('/tasks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(toJSON(row));
});

// POST /tasks - create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  const done = req.body.done ? 1 : 0;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title.trim(), done);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(toJSON(row));
});

// PUT /tasks/:id - update an existing task
app.put('/tasks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const title = req.body.title !== undefined ? req.body.title : existing.title;
  const done = req.body.done !== undefined ? (req.body.done ? 1 : 0) : existing.done;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title.trim(), done, req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(toJSON(row));
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Task API running on http://localhost:${PORT}`);
});
