import '@testing-library/jest-dom';

// Mock de import.meta para Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3000/api/v1',
        DEV: true,
        PROD: false,
      },
    },
  },
  writable: false,
  configurable: false,
});