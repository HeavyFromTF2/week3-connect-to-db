// Import the Express library
const express = require('express');

// Initialize the Express application
const app = express();

// Define the port where the server will listen for requests
const PORT = 3000;

app.use(express.json());


// STAGE 2: In-memory array of tasks (our temporary database)
let tasks = [
  { id: 1, title: "Learn Express basics", done: true },
  { id: 2, title: "Build Stage 2 of CRUD API", done: false },
  { id: 3, title: "Practice git commits", done: false }
];

// STAGE 1: Root endpoint returning API metadata in JSON format
// Instead of plain text, we now return a structured JSON object describing our API
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

// STAGE 1: Health check endpoint
// Real applications use this endpoint to check if the server is healthy and responding
app.get('/health', (req, res) => {
  res.json({
    status: "ok"
  });
});

// STAGE 2: GET /tasks - Retrieve the list of all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// STAGE 2: GET /tasks/:id - Retrieve a single task by its dynamic ID parameter
app.get('/tasks/:id', (req, res) => {
  // Extract the ID from the URL parameter and parse it into an integer
  const taskId = parseInt(req.params.id);
  
  // Search for the task with the matching ID
  const task = tasks.find(t => t.id === taskId);
  
  // If the task does not exist, return a 404 Status Code and error JSON
  if (!task) {
    return res.status(404).json({
      error: `Task ${taskId} not found`
    });
  }
  
  // If found, return the task object with the default 200 Status Code
  res.json(task);
});

// STAGE 3
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

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});