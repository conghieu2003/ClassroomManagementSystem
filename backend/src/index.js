require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const dbConfig = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = 5001; // Fixed port for testing

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/auth', authRoutes);

// Test database connection
async function testConnection() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to SQL Server successfully!');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

testConnection();

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 