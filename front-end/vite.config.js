import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from 'fs';

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
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:9115',
        secure: false,
        changeOrigin: true
      }
    }
  },
});
