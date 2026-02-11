import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Reduce CPU usage
    hmr: {
      overlay: false, // Disable error overlay to reduce rendering
    },
    watch: {
      // Reduce file watching load
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  build: {
    // Faster builds
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
  },
  // Reduce processing
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
