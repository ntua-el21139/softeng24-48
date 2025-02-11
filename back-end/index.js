require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');  // Import the centralized router
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 9115;

// Start SSH server
const startSSHServer = () => {
  const sshServerPath = path.join(__dirname, '..', 'cli-client', 'ssh_server.py');
  const pythonProcess = spawn('python3', [sshServerPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`SSH Server: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`SSH Server Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`SSH Server process exited with code ${code}`);
  });
};

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

// Start both servers
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
  startSSHServer();
}); 