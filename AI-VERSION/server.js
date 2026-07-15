/**
 * Simple Todo List API - single file
 * Express + in-memory storage + Swagger UI
 *
 * Run:
 *   npm install
 *   npm start
 *
 * Then open:
 *   http://localhost:3000/api-docs   -> Swagger UI
 */

const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ----------------------- In-memory data store -----------------------
let todos = [
  { id: 1, title: 'Learn Express', done: false },
  { id: 2, title: 'Build a Todo API', done: false }
];
let nextId = 3;

// ----------------------- Swagger setup -----------------------
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'A simple CRUD API for managing a todo list'
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      schemas: {
        Todo: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Buy milk' },
            done: { type: 'boolean', example: false }
          }
        },
        TodoInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Buy milk' },
            done: { type: 'boolean', example: false }
          }
        }
      }
    }
  },
  apis: [__filename] // read JSDoc annotations from this same file
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Missing title
 */
app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { title, done } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required and must be a string' });
  }
  const todo = { id: nextId++, title, done: Boolean(done) };
  todos.push(todo);
  res.status(201).json(todo);
});

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     summary: Get a todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *   put:
 *     summary: Update a todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *   delete:
 *     summary: Delete a todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted, no content
 *       404:
 *         description: Todo not found
 */
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  const { title, done } = req.body || {};
  if (title !== undefined) {
    if (typeof title !== 'string' || !title) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    todo.title = title;
  }
  if (done !== undefined) todo.done = Boolean(done);

  res.json(todo);
});

app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  res.status(204).send();
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`Todo API running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
