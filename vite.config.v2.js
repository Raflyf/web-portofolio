import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// v2 — clean rebuild root. Reuses root deps/env, own outDir.
// /api proxied to the v1 dev server so no middleware is duplicated.
export default defineConfig({
  root: path.resolve(__dirname, 'v2'),
  envDir: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@v2': path.resolve(__dirname, './v2/src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:5173',
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-v2'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
  },
})
