import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'injectManifest',
      includeAssets: ['urbanpro-favicon.svg', 'apple-touch-icon-180x180.png', 'robots.txt'],
      manifest: {
        name: 'UrbanPro — AI-Powered Local Services Marketplace',
        short_name: 'UrbanPro',
        description: 'Connect with trusted professionals for home services, repairs, and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#7c3aed',
        orientation: 'portrait',
        categories: ['business', 'lifestyle', 'utilities'],
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/urbanpro-favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-socket': ['socket.io-client'],
          'vendor-utils': ['axios', 'date-fns', 'sonner'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  // Reduce processing
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
