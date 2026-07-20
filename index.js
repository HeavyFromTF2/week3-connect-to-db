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

// STAGE 2: Create new tasks in SQLite
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Validação: título obrigatório e não vazio
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Prepara e executa o INSERT parametrizado
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insert.run(title.trim(), 0);

  // Devolve a tarefa criada com o ID gerado pelo SQLite (status 201)
  const newTask = {
    id: Number(result.lastInsertRowid),
    title: title.trim(),
    done: false
  };

  res.status(201).json(newTask);
});

// STAGE 3: Update (PUT /tasks/:id)
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, done } = req.body;

  // 1. Verifica se a tarefa existe no banco
  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!existingTask) {
    return res.status(404).json({ error: 'No task found' });
  }

  // 2. Validação do body
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // 3. Converte done para boolean/número (1 ou 0)
  const isDone = done ? 1 : 0;

  // 4. Executa o UPDATE no SQLite
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title.trim(), isDone, taskId);

  // 5. Retorna a tarefa atualizada
  res.status(200).json({
    id: Number(taskId),
    title: title.trim(),
    done: Boolean(isDone)
  });
});

// STAGE 3: Delete (DELETE /tasks/:id)
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  // 1. Executa o DELETE e guarda o resultado
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

  // 2. Se nenhuma linha foi alterada (changes === 0), a tarefa não existia
  if (result.changes === 0) {
    return res.status(404).json({ error: 'No task found' });
  }

  // 3. Sucesso sem conteúdo (204)
  res.status(204).send();
});

// STAGE 5: Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});