require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');  // Import the centralized router
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');

const app = express();
const port = process.env.PORT || 9115;

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'server.cert'))
};

// Start SSH server
const startSSHServer = () => {
  const sshServerPath = path.join(__dirname, '..', 'cli-client', 'ssh_server.py');
  // Use python3 for macOS/Linux, python for Windows
  const pythonCommand = os.platform() === 'win32' ? 'python' : 'python3';
  const pythonProcess = spawn(pythonCommand, [sshServerPath]);

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

// Create HTTPS server
const server = https.createServer(sslOptions, app);

// Start server
server.listen(port, () => {
  console.log(`HTTPS Server is running on port ${port}`);
  startSSHServer();
}); 