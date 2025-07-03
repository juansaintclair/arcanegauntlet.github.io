import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is needed to make Vercel dev work with API routes
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
