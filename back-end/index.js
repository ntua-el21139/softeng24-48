require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');  // Import the centralized router

const app = express();
const port = process.env.PORT || 9115;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Use the centralized router for all API routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 