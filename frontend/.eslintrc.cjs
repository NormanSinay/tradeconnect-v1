const { configService } = require('./src/services/configService')

module.exports = async function() {
  try {
    // Load configuration from backend
    const config = await configService.getESLintConfig()

    return {
      ...config,
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...config.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      settings: {
        ...config.settings,
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        ...config.rules,
        // Additional frontend-specific rules
        'react/prop-types': 'off', // Using TypeScript for prop validation
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
          },
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      },
      overrides: [
        {
          files: ['*.astro'],
          extends: ['plugin:astro/recommended'],
          parser: 'astro-eslint-parser',
          parserOptions: {
            parser: '@typescript-eslint/parser',
            extraFileExtensions: ['.astro'],
          },
          rules: {
            'astro/no-set-html-directive': 'error',
            'astro/no-unused-css-selector': 'warn',
          },
        },
        {
          files: ['*.ts', '*.tsx'],
          rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
          },
        },
        {
          files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
          extends: ['plugin:testing-library/react', 'plugin:jest-dom/recommended'],
          rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'testing-library/await-async-query': 'error',
            'testing-library/no-await-sync-query': 'error',
          },
        },
      ],
    }
  } catch (error) {
    console.error('Failed to load ESLint config from backend, using defaults:', error)

    // Fallback configuration
    return {
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
      plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          typescript: {},
        },
      },
      rules: {
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
          },
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      },
    }
  }
}