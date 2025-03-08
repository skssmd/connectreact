import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
server: {
    allowedHosts: [
      'conn-6sq5.onrender.com',  // Add your Render URL here
      'localhost',               // Allow localhost for local development
      '127.0.0.1',               // Add more if needed
    ],
  plugins: [react(), tailwindcss(),],
  
  
})
