import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
//
// The app calls the API with relative paths ("/api/courses/"). In the Docker
// image nginx proxies those to the backend; for "npm run dev" the same paths
// are proxied here, so no base-URL switching is needed in the app code.
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8002'

export default defineConfig({
  plugins: [react()],
  build: {
    // Multi-page build: without these, only index.html is bundled and the
    // TPIQ-56 My Learning and TPIQ-57 course content pages never reach dist/.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        courseContent: resolve(import.meta.dirname, 'course-content.html'),
        myLearning: resolve(import.meta.dirname, 'src/pages/index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/admin': { target: apiTarget, changeOrigin: true },
      '/static': { target: apiTarget, changeOrigin: true },
    },
  },
})
