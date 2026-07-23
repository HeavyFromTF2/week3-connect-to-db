// Import Express and core dependencies
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const PORT = 3000;

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


// Load Swagger API specification
const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));

app.use(express.json());

// STAGE 1: Initialize database schema & seed tasks
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    );
  `);

  const res = await pool.query('SELECT COUNT(*) FROM tasks');
  if (parseInt(res.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done) VALUES 
      ('Learn Express basics', true),
      ('Build Stage 2 of CRUD API', false),
      ('Practice git commits', false);
    `);
  }
}

initDb().catch(console.error);

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

// STAGE 2: Read tasks
app.get('/tasks', async (req, res) => {
  try {
    const { done, search } = req.query;
    let query = 'SELECT * FROM tasks';
    let params = [];

    if (search) {
      query += ' WHERE title ILIKE $1';
      params.push(`%${search}%`);
    } else if (done !== undefined) {
      query += ' WHERE done = $1';
      params.push(done === 'true');
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STAGE 2: Read task by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
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