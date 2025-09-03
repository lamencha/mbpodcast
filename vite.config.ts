import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as any
  ],
  server: {
    port: 5173,
    open: true // Auto-open browser
  },
  build: {
    // Optimize bundle splitting and compression
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
          // Group components by feature
          if (id.includes('/components/')) {
            if (id.includes('IPod') || id.includes('ReplicantDatabase')) {
              return 'lazy-components';
            }
            return 'ui-components';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild', // Use esbuild for faster minification
    // Disable source maps for smaller builds
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 800,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: './postcss.config.cjs',
    transformer: 'postcss'
  }
})
