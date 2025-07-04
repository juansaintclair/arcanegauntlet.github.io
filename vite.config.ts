import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'assets', dest: 'assets' },
      ],
    }),
  ],
  publicDir: false,
  server: {
    // This is needed to make Vercel dev work with API routes
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
