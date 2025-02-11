const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', 'cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Check if certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('SSL certificates not found. Generating new self-signed certificates...');
  
  // Create cert directory if it doesn't exist
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  // Generate self-signed certificate using OpenSSL
  const command = `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=GR/ST=Attica/L=Athens/O=InterToll/CN=localhost"`;

  try {
    execSync(command);
    console.log('Self-signed certificates generated successfully!');
  } catch (error) {
    console.error('Error generating certificates:', error.message);
    process.exit(1);
  }
} else {
  console.log('SSL certificates found, proceeding with server start...');
} 