import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://tradeconnect.gt',
  integrations: [
    react(),
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
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/system', '@emotion/react', '@emotion/styled'],
            'query-vendor': ['@tanstack/react-query'],
            'utils-vendor': ['axios', 'date-fns', 'framer-motion', 'react-hot-toast'],
            'i18n-vendor': ['i18next', 'i18next-browser-languagedetector', 'i18next-http-backend', 'react-i18next'],
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
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@tanstack/react-query',
        'axios',
        'react-router-dom',
      ],
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