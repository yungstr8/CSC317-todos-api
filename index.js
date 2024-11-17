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
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /todos - Add a new to-do item
app.post('/todos', (req, res) => {
    const { task, priority } = req.body;
    const query = 'INSERT INTO todos (task, priority) VALUES (?, ?)';
    db.run(query, [task, priority || 'medium'], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, task, priority: priority || 'medium', completed: 0 });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

