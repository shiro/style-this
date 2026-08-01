import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import styleThisVitePlugin from '@style-this/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    styleThisVitePlugin({ filter: /.*\.tsx/ })
  ],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
})
