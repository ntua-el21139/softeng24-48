const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', 'cert');

// Create cert directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// Generate self-signed certificate using OpenSSL
const command = `openssl req -x509 -newkey rsa:2048 -keyout ${path.join(certDir, 'key.pem')} -out ${path.join(certDir, 'cert.pem')} -days 365 -nodes -subj "/C=GR/ST=Attica/L=Athens/O=InterToll/CN=localhost"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating certificate: ${error}`);
    return;
  }
  console.log('Self-signed certificate generated successfully!');
}); 