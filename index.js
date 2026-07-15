// Import the Express library
const express = require('express');
// Initialize the Express application
const app = express();

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));

// Define the port where the server will listen for requests
const PORT = 3000;

app.use(express.json());

// In-memory "database"
let tasks = [
  { id: 1, title: "Learn Express basics", done: true },
  { id: 2, title: "Build Stage 2 of CRUD API", done: false },
  { id: 3, title: "Practice git commits", done: false }
];

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

// STAGE 2: Read (List with done filter & Detail with 404 validation)
app.get('/tasks', (req, res) => {
  const { done } = req.query;

  if (done === undefined) {
    return res.json(tasks);
  }

  const isDoneFilter = done === 'true';
  const filteredTasks = tasks.filter(task => task.done === isDoneFilter);
  res.json(filteredTasks);
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }
  
  res.json(task);
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