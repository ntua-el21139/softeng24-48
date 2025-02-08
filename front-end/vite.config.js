import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
  }
});
