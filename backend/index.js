require('dotenv').config();
global.crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error');

const app = express();

// Request Timeout Middleware (15s)
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    console.error(`[${new Date().toISOString()}] Request Timeout: ${req.method} ${req.url}`);
    res.status(408).send('Request Timeout');
  });
  next();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/movies', require('./routes/movieRoutes'));

app.get('/', (req, res) => {
  res.send('Movie Search API is running...');
});

// Error Handling Middleware
app.use(errorHandler);

// Database Connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
