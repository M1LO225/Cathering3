// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Asegúrate de que no corra en el mismo puerto que el backend (3000)
    port: 5173 
  }
});