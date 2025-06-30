import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
  },
  preview: {
    port: 3001,
    host: true,
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'yeouskin.onrender.com',
      '.onrender.com'
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
}); 