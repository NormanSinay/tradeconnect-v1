import { api } from './api'
import type { ApiResponse } from '@/types'

// Configuration types
export interface ESLintConfig {
  rules: Record<string, any>
  extends: string[]
  parserOptions: Record<string, any>
  env: Record<string, boolean>
  plugins: string[]
  settings: Record<string, any>
}

export interface PrettierConfig {
  printWidth: number
  tabWidth: number
  useTabs: boolean
  semi: boolean
  singleQuote: boolean
  quoteProps: 'as-needed' | 'consistent' | 'preserve'
  trailingComma: 'none' | 'es5' | 'all'
  bracketSpacing: boolean
  bracketSameLine: boolean
  arrowParens: 'avoid' | 'always'
  endOfLine: 'auto' | 'lf' | 'crlf' | 'cr'
}

export interface CodeQualityConfig {
  eslint: ESLintConfig
  prettier: PrettierConfig
  typescript: {
    strict: boolean
    noImplicitAny: boolean
    strictNullChecks: boolean
    noUnusedLocals: boolean
    noUnusedParameters: boolean
  }
  testing: {
    coverageThreshold: {
      global: {
        branches: number
        functions: number
        lines: number
        statements: number
      }
    }
  }
}

class ConfigService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Get code quality configuration from backend
  async getCodeQualityConfig(): Promise<CodeQualityConfig> {
    const cacheKey = 'codeQualityConfig'

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const response = await api.get<CodeQualityConfig>('/config/code-quality')
      const config = response.data.data

      if (!config) {
        throw new Error('Invalid configuration received')
      }

      // Cache the result
      this.cache.set(cacheKey, { data: config, timestamp: Date.now() })

      return config
    } catch (error) {
      console.error('Failed to load code quality config:', error)
      // Return default configuration if backend is unavailable
      return this.getDefaultCodeQualityConfig()
    }
  }

  // Get ESLint configuration
  async getESLintConfig(): Promise<ESLintConfig> {
    const fullConfig = await this.getCodeQualityConfig()
    return fullConfig.eslint
  }

  // Get Prettier configuration
  async getPrettierConfig(): Promise<PrettierConfig> {
    const fullConfig = await this.getCodeQualityConfig()
    return fullConfig.prettier
  }

  // Get TypeScript configuration
  async getTypeScriptConfig(): Promise<CodeQualityConfig['typescript']> {
    const fullConfig = await this.getCodeQualityConfig()
    return fullConfig.typescript
  }

  // Get testing configuration
  async getTestingConfig(): Promise<CodeQualityConfig['testing']> {
    const fullConfig = await this.getCodeQualityConfig()
    return fullConfig.testing
  }

  // Update configuration (admin only)
  async updateCodeQualityConfig(config: Partial<CodeQualityConfig>): Promise<void> {
    try {
      await api.put('/config/code-quality', config)
      // Clear cache to force reload
      this.cache.delete('codeQualityConfig')
    } catch (error) {
      console.error('Failed to update code quality config:', error)
      throw error
    }
  }

  // Validate configuration
  async validateConfig(config: Partial<CodeQualityConfig>): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await api.post('/config/validate', config)
      return response.data.data as { isValid: boolean; errors: string[] }
    } catch (error) {
      console.error('Failed to validate config:', error)
      return { isValid: false, errors: ['Validation service unavailable'] }
    }
  }

  // Get configuration history
  async getConfigHistory(limit = 10): Promise<Array<{ version: string; config: CodeQualityConfig; timestamp: Date; author: string }>> {
    try {
      const response = await api.get(`/config/history?limit=${limit}`)
      return response.data.data as Array<{ version: string; config: CodeQualityConfig; timestamp: Date; author: string }>
    } catch (error) {
      console.error('Failed to load config history:', error)
      return []
    }
  }

  // Rollback to previous configuration
  async rollbackConfig(version: string): Promise<void> {
    try {
      await api.post('/config/rollback', { version })
      this.cache.delete('codeQualityConfig')
    } catch (error) {
      console.error('Failed to rollback config:', error)
      throw error
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Default configuration as fallback
  private getDefaultCodeQualityConfig(): CodeQualityConfig {
    return {
      eslint: {
        rules: {
          'no-console': 'warn',
          'no-debugger': 'warn',
          'no-unused-vars': 'error',
          'prefer-const': 'error',
          'no-var': 'error',
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/explicit-function-return-type': 'off',
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn'
        },
        extends: [
          'eslint:recommended',
          '@typescript-eslint/recommended',
          'plugin:react/recommended',
          'plugin:react-hooks/recommended',
          'plugin:import/recommended',
          'plugin:import/typescript'
        ],
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          }
        },
        env: {
          browser: true,
          es2021: true,
          node: true
        },
        plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
        settings: {
          react: {
            version: 'detect'
          },
          'import/resolver': {
            typescript: {}
          }
        }
      },
      prettier: {
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'es5',
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'avoid',
        endOfLine: 'lf'
      },
      typescript: {
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noUnusedLocals: true,
        noUnusedParameters: true
      },
      testing: {
        coverageThreshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    }
  }
}

// Create singleton instance
export const configService = new ConfigService()

// Export the class for testing
export { ConfigService }