import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3100,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3100,
    strictPort: true,
  },
});
