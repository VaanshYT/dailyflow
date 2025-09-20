const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Catch-all request logger middleware (near top)
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.originalUrl}`);
  next();
});

// CORS middleware - allow requests from frontend
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leetcode', require('./routes/leetcodeProxy')); // Your LeetCode route
app.use('/api/tasks', taskRoutes); // Vansh’s Tasks route

// Basic root route
app.get('/', (req, res) => {
  res.json({ message: 'DailyFlow Backend API is running!' });
});

// Error handling middleware (last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
