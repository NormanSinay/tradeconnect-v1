import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://tradeconnect.gt',
  integrations: [
    react(), // Removed restrictive include - now processes all .tsx/.jsx files
    tailwind({
      applyBaseStyles: false, // We'll apply our own base styles
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'query-vendor': ['@tanstack/react-query'],
            'utils-vendor': ['axios', 'date-fns', 'framer-motion', 'react-hot-toast'],
            'i18n-vendor': ['i18next', 'i18next-browser-languagedetector', 'i18next-http-backend', 'react-i18next'],
            'icons-vendor': ['react-icons/fa', 'react-icons/md', 'lucide-react'],
            // Performance chunks
            'websocket-vendor': ['socket.io-client'],
            'charts-vendor': ['recharts'],
            'forms-vendor': ['react-hook-form', 'zod'],
            'security-vendor': ['isomorphic-dompurify'],
          },
        },
      },
      // Optimize chunks
      chunkSizeWarningLimit: 600,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
      },
      // Enable source maps for production debugging
      sourcemap: false,
      // Optimize CSS
      cssCodeSplit: true,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@radix-ui/react-slot',
        '@radix-ui/react-dialog',
        '@tanstack/react-query',
        'axios',
        'react-router-dom',
        'react-icons',
        'lucide-react',
        'socket.io-client',
        'react-hook-form',
        'zod',
        'isomorphic-dompurify',
      ],
    },
    // Performance optimizations
    esbuild: {
      // Remove console logs in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },
  // Compression
  compressHTML: true,
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});