export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^import\\.meta\\.env$': '<rootDir>/src/__mocks__/importMetaEnv.js',
    '^import\\.meta$': '<rootDir>/src/__mocks__/importMeta.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [
        ['babel-plugin-transform-import-meta', { module: 'ES6' }]
      ]
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }],
        '@babel/preset-react'
      ],
      plugins: [
        ['babel-plugin-transform-import-meta', { module: 'ES6' }]
      ]
    }],
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|react-hot-toast|zustand|framer-motion|@radix-ui|@tanstack|@hookform|crypto-js|@babel|babel-plugin-transform-import-meta|identity-obj-proxy|lucide-react|react-icons|chart.js|react-chartjs-2|class-variance-authority|clsx|tailwind-merge|zod|react-router-dom|tailwindcss-animate|react-hook-form|@hookform|react-hot-toast|react-dom|react|axios|react-router|react-query|@tanstack|react-currency-format)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  globals: {
    'ts-jest': {
      useESM: false,
      diagnostics: false,
    },
  },
};