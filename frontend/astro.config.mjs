import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://tradeconnect.gt',
  integrations: [
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      global: 'globalThis',
    },
  },
  output: 'server',
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          utils: ['axios', '@tanstack/react-query', 'react-router-dom'],
        },
      },
    },
  },
  image: {
    domains: ['localhost', 'tradeconnect.gt', 'api.tradeconnect.gt'],
  },
});