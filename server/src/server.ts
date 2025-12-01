import express, { Request, Response, NextFunction } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const app = express();
const port = 3001;
const SECRET_KEY = 'your_secret_key_here'; // In production, use environment variable

app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.resolve(__dirname, '../discussion.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        parent_id INTEGER,
        operation TEXT,
        operand REAL,
        result REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
}

// Middleware for Authentication
interface AuthRequest extends Request {
    user?: { id: number; username: string };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Endpoints
app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';

    db.run(sql, [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).json({ error: "Username already exists" });
        }
        res.json({ message: "User registered successfully" });
    });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row: any) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, row.password_hash);
        if (!validPassword) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: row.id, username: row.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: row.username });
    });
});

// Discussion Endpoints

// Get all posts (Public)
app.get('/api/posts', (req: Request, res: Response) => {
    const sql = `
        SELECT posts.*, users.username 
        FROM posts 
        LEFT JOIN users ON posts.user_id = users.id 
        ORDER BY created_at ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "success", data: rows });
    });
});

// Create a new discussion (Protected)
app.post('/api/posts', authenticateToken, (req: AuthRequest, res: Response) => {
    const { value } = req.body;
    const userId = req.user?.id;

    if (value === undefined || value === null) {
        return res.status(400).json({ error: "Value is required" });
    }

    const sql = 'INSERT INTO posts (user_id, parent_id, operation, operand, result) VALUES (?, ?, ?, ?, ?)';
    const params = [userId, null, null, null, value];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "success",
            data: {
                id: this.lastID,
                user_id: userId,
                parent_id: null,
                operation: null,
                operand: null,
                result: value,
                username: req.user?.username
            }
        });
    });
});

// Reply to a post (Protected)
app.post('/api/posts/:id/reply', authenticateToken, (req: AuthRequest, res: Response) => {
    const parentId = req.params.id;
    const { operation, operand } = req.body;
    const userId = req.user?.id;

    if (!operation || operand === undefined || operand === null) {
        return res.status(400).json({ error: "Operation and operand are required" });
    }

    db.get('SELECT result FROM posts WHERE id = ?', [parentId], (err, row: any) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Parent post not found" });

        let result;
        const parentResult = row.result;
        const numOperand = parseFloat(operand);

        switch (operation) {
            case '+': result = parentResult + numOperand; break;
            case '-': result = parentResult - numOperand; break;
            case '*': result = parentResult * numOperand; break;
            case '/':
                if (numOperand === 0) return res.status(400).json({ error: "Division by zero" });
                result = parentResult / numOperand;
                break;
            default: return res.status(400).json({ error: "Invalid operation" });
        }

        const sql = 'INSERT INTO posts (user_id, parent_id, operation, operand, result) VALUES (?, ?, ?, ?, ?)';
        const params = [userId, parentId, operation, numOperand, result];

        db.run(sql, params, function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({
                message: "success",
                data: {
                    id: this.lastID,
                    user_id: userId,
                    parent_id: parentId,
                    operation: operation,
                    operand: numOperand,
                    result: result,
                    username: req.user?.username
                }
            });
        });
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
