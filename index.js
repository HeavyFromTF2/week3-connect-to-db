// Import the Express library
const express = require('express');
// Initialize the Express application
const app = express();

const Database = require('better-sqlite3');

// Abre (ou cria, se não existir) o arquivo tasks.db
const db = new Database('tasks.db');

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));

// Define the port where the server will listen for requests
const PORT = 3000;

app.use(express.json());

// Criar a tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Contar quantas tarefas existem na tabela
const count = db.prepare('SELECT COUNT(*) AS total FROM tasks').get().total;

// Fazer seed apenas se o total for 0
if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run("Learn Express basics", 1);
  insert.run("Build Stage 2 of CRUD API", 0);
  insert.run("Practice git commits", 0);
}

// STAGE 1: Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// STAGE 1 (Read): GET /tasks (com suporte a filtro ?done=true/false)
app.get('/tasks', (req, res) => {
  const { done } = req.query;
  let rows;

  if (done !== undefined) {
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

// STAGE 1 (Read): GET /tasks/:id
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

// STAGE 3: Create (with dynamic ID generation and title validation)
app.post('/tasks', (req,res) => {
  const { title } = req.body;
  if( !title || title.trim() === ""){
    return res.status(400).json({error: "Title is required"});
  }

  const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id: newTaskId,
    title: title,
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// STAGE 4: Update & Delete Endpoints
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "No task found" });
  }

  const { title, done } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  task.title = title;
  task.done = done;
  res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "No task found" });
  }

  tasks = tasks.filter(t => t.id !== taskId);
  res.status(204).send()
});

// STAGE 5: Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});