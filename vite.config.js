import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// The app calls the API with relative paths ("/api/courses/"). In the Docker
// image nginx proxies those to the backend; for "npm run dev" the same paths
// are proxied here, so no base-URL switching is needed in the app code.
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8002'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/admin': { target: apiTarget, changeOrigin: true },
      '/static': { target: apiTarget, changeOrigin: true },
    },
  },
})
