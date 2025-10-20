import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://tradeconnect.gt',
  integrations: [
    react({
      include: ['**/ClientApp.tsx', '**/ContactPage.tsx', '**/ReportIssuePage.tsx', '**/Footer.tsx'],
    }),
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
        '@radix-ui/react-slot',
        '@radix-ui/react-dialog',
        '@tanstack/react-query',
        'axios',
        'react-router-dom',
        'react-icons',
        'lucide-react',
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