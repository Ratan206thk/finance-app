import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/finance-app/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
