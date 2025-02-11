require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');  // Import the centralized router
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const port = process.env.PORT || 9115;

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'server.cert'))
};

// Start SSH server
const startSSHServer = () => {
  try {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const sshServerPath = path.join(__dirname, '..', 'cli-client', 'ssh_server.py');
    
    // Check if the SSH server file exists
    if (!fs.existsSync(sshServerPath)) {
      console.log('SSH server script not found. Skipping SSH server start.');
      return;
    }

    const pythonProcess = spawn(pythonCommand, [sshServerPath]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`SSH Server: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`SSH Server Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`SSH Server process exited with code ${code}. SSH functionality may not be available.`);
      } else {
        console.log('SSH Server started successfully');
      }
    });

    pythonProcess.on('error', (err) => {
      console.log(`Failed to start SSH Server: ${err.message}. SSH functionality may not be available.`);
    });
  } catch (error) {
    console.log(`Error starting SSH Server: ${error.message}. SSH functionality may not be available.`);
  }
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