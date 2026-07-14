// Import the Express library
const express = require('express');

// Initialize the Express application
const app = express();

// Define the port where the server will listen for requests
const PORT = 3000;

app.use(express.json());


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

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});