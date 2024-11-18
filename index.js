// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Create an Express app and set up the port
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Connect to SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// Register routes with logging
console.log('Registering route: GET /todos');
// GET /todos - Retrieve all to-do items, with optional filtering by completion status
app.get('/todos', (req, res) => {
  let query = 'SELECT * FROM todos';
  const params = [];

  if (req.query.completed) {
    query += ' WHERE completed = ?';
    params.push(req.query.completed === 'true' ? 1 : 0);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

console.log('Registering route: POST /todos');
// POST /todos - Add a new to-do item
app.post('/todos', (req, res) => {
  const newTodo = {
    task: req.body.task,
    completed: 0,
    priority: req.body.priority || 'medium', // Default to 'medium' if not provided
  };

  const query = 'INSERT INTO todos (task, completed, priority) VALUES (?, ?, ?)';
  const params = [newTodo.task, newTodo.completed, newTodo.priority];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, ...newTodo });
  });
});

console.log('Registering route: PUT /todos/complete-all');
// PUT /todos/complete-all - Mark all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
  console.log('PUT /todos/complete-all endpoint hit');
  
  const query = 'UPDATE todos SET completed = 1';
  
  db.run(query, function (err) {
    if (err) {
      console.error('Error running update query:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Successfully updated ${this.changes} rows`);
    res.json({ message: 'All todos marked as completed' });
  });
});

console.log('Registering route: PUT /test');
// PUT /test - Test PUT endpoint to verify PUT method works
app.put('/test', (req, res) => {
  console.log('PUT /test endpoint hit');
  res.json({ message: 'Test PUT request received' });
});

console.log('Registering route: DELETE /todos/:id');
// DELETE /todos/:id - Delete a to-do item by ID
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM todos WHERE id = ?';

  db.run(query, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'To-do item not found' });
      return;
    }
    res.status(200).json({ message: 'To-do item deleted successfully' });
  });
});

// Start the server
console.log('Starting server...');
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
