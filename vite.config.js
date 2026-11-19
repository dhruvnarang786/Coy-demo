import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.COY_API_TARGET || 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feed': apiTarget,
      '/swipe': apiTarget,
      '/matches': apiTarget,
    },
  },
});
