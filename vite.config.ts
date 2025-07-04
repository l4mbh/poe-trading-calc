import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/poe-ninja-api': {
        target: 'https://poe.ninja/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poe-ninja-api/, ''),
        secure: true,
      },
    },
  },
});
