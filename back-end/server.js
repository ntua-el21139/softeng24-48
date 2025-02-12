const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true, // or specify your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ... rest of the existing code ...

module.exports = app; 