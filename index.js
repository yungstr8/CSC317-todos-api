const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// GET /todos - Retrieve all to-do items
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving todos:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /todos - Add a new to-do item
app.post('/todos', (req, res) => {
    const newTodo = {
        task: req.body.task,
        completed: 0,
        priority: req.body.priority || 'medium', // Default to 'medium' if not provided
    };
    const query = `INSERT INTO todos (task, completed, priority) VALUES (?, ?, ?)`;
    const params = [newTodo.task, newTodo.completed, newTodo.priority];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Error adding new todo:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...newTodo });
    });
});

// PUT /todos/complete-all - Mark all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
    console.log('PUT /todos/complete-all endpoint hit'); // Log for debugging
    const query = `UPDATE todos SET completed = 1`;

    db.run(query, function (err) {
        if (err) {
            console.error('Error running update query:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('No todos were updated.');
            res.status(404).json({ message: 'No todos found to update.' });
            return;
        }
        console.log(`Successfully updated ${this.changes} rows`);
        res.json({ message: "All todos marked as completed" });
    });
});

// DELETE /todos/:id - Delete a to-do item by ID
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM todos WHERE id = ?`;

    db.run(query, id, function (err) {
        if (err) {
            console.error('Error deleting todo:', err.message);
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
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
