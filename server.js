// import express
const express = require('express');
const { Pool } = require('pg');

// create a new express app
const app = express();

// create a new port
const PORT = process.env.PORT || 3000;

// middleware to parse the body of the request JSON
app.use(express.json());

// database connection using pg and Docker variables
const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "api_usuarios",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin123"
});

// test connection
(async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Connected to PostgreSQL database");
    } catch (err) {
        console.error("Database connection error:", err.message);
    }
})();

// GET /users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error retrieving users" });
    }
});

// GET /users/:id
app.get('/users/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error retrieving user" });
    }
});

// POST /users
app.post('/users', async (req, res) => {
    const { name, email } = req.body || {};

    if (!name || !email) {
        return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *",
            [name, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ error: "Email ya registrado" });
        }
        res.status(500).json({ error: "Error creando usuario" });
    }
});

// DELETE /users/:id
app.delete('/users/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Error eliminando usuario" });
    }
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
