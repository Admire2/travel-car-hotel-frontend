import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 40001, // frontend dev server
    proxy: {
      '/api': {
        target: 'http://localhost:40002', // backend API
        changeOrigin: true,
        secure: false
      }
    }
  }
});
