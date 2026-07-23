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

// STAGE 3: Create task
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;

    // 1. Validação: título obrigatório e não vazio
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 2. Inserir no Postgres e retornar a nova linha criada
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title.trim(), false]
    );

    // 3. Responder com status 201 (Created) e o objeto da tarefa criada
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STAGE 3: Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, done } = req.body;

    // 1. Validação: o título é obrigatório
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 2. Garantir que 'done' é um boleano (se não for enviado, assume false)
    const isDone = Boolean(done);

    // 3. Atualizar no Postgres e retornar a linha modificada
    const result = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [title.trim(), isDone, id]
    );

    // 4. Se a query não afetou nenhuma linha, o ID não existe
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 5. Retornar a tarefa atualizada
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STAGE 3: Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Eliminar do Postgres usando a cláusula RETURNING
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    // 2. Se nenhuma linha foi devolvida, o ID não existia
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 3. Sucesso sem conteúdo a retornar (Status 204)
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STAGE 5: Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});