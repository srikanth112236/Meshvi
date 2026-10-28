import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget =
    env.VITE_BACKEND_URL ||
    (env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : '') ||
    'http://localhost:3500';

  return {
    plugins: [react()],
    server: {
      port: 3100,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3100,
      strictPort: true,
    },
  };
});
