import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from 'fs';
import os from 'os';

// Function to get local IP address
function getLocalIP() {
  const networks = os.networkInterfaces();
  for (const name of Object.keys(networks)) {
    for (const net of networks[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        return net.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no IP found
}

const localIP = getLocalIP();

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the output directory from 'dist' to 'build'
  // Comment this out if that isn't relevant for your project
  build: {
    outDir: "build"
  },
  plugins: [react()],
  resolve: {
    alias: {
      'lib': path.resolve(__dirname, './src/lib'),
      'components': path.resolve(__dirname, './src/components')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
    proxy: {
      '/api': {
        target: `https://${localIP}:9115`,
        secure: false,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      }
    }
  },
});
