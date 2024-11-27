const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Performance Management API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An internal server error occurred',
            details: process.env.NODE_ENV === 'development' ? [err.message] : []
        }
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
            details: [`${req.method} ${req.url} not found`]
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
    // Close server & exit process
    process.exit(1);
});
