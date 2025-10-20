import { useState, useEffect, useCallback } from 'react'
import { configService, type CodeQualityConfig, type ESLintConfig, type PrettierConfig } from '@/services/configService'
import { showToast } from '@/utils/toast'

interface CodeQualityState {
  config: CodeQualityConfig | null
  eslint: ESLintConfig | null
  prettier: PrettierConfig | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface CodeQualityHookReturn extends CodeQualityState {
  refreshConfig: () => Promise<void>
  updateConfig: (updates: Partial<CodeQualityConfig>) => Promise<boolean>
  validateConfig: (config: Partial<CodeQualityConfig>) => Promise<{ isValid: boolean; errors: string[] }>
  getConfigHistory: (limit?: number) => Promise<Array<{ version: string; config: CodeQualityConfig; timestamp: Date; author: string }>>
  rollbackConfig: (version: string) => Promise<boolean>
}

export const useCodeQuality = (): CodeQualityHookReturn => {
  const [state, setState] = useState<CodeQualityState>({
    config: null,
    eslint: null,
    prettier: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  // Load configuration from backend
  const loadConfig = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [config, eslint, prettier] = await Promise.all([
        configService.getCodeQualityConfig(),
        configService.getESLintConfig(),
        configService.getPrettierConfig()
      ])

      setState({
        config,
        eslint,
        prettier,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load configuration'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      showToast.error(`Error loading code quality config: ${errorMessage}`)
    }
  }, [])

  // Refresh configuration
  const refreshConfig = useCallback(async () => {
    configService.clearCache()
    await loadConfig()
  }, [loadConfig])

  // Update configuration
  const updateConfig = useCallback(async (updates: Partial<CodeQualityConfig>): Promise<boolean> => {
    try {
      await configService.updateCodeQualityConfig(updates)
      showToast.success('Configuration updated successfully')
      await refreshConfig()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration'
      showToast.error(`Error updating config: ${errorMessage}`)
      return false
    }
  }, [refreshConfig])

  // Validate configuration
  const validateConfig = useCallback(async (config: Partial<CodeQualityConfig>) => {
    try {
      return await configService.validateConfig(config)
    } catch (error) {
      console.error('Configuration validation error:', error)
      return { isValid: false, errors: ['Validation service unavailable'] }
    }
  }, [])

  // Get configuration history
  const getConfigHistory = useCallback(async (limit = 10) => {
    try {
      return await configService.getConfigHistory(limit)
    } catch (error) {
      console.error('Failed to load config history:', error)
      return []
    }
  }, [])

  // Rollback configuration
  const rollbackConfig = useCallback(async (version: string): Promise<boolean> => {
    try {
      await configService.rollbackConfig(version)
      showToast.success('Configuration rolled back successfully')
      await refreshConfig()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rollback configuration'
      showToast.error(`Error rolling back config: ${errorMessage}`)
      return false
    }
  }, [refreshConfig])

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    ...state,
    refreshConfig,
    updateConfig,
    validateConfig,
    getConfigHistory,
    rollbackConfig
  }
}

// Hook for ESLint configuration specifically
export const useESLintConfig = () => {
  const { eslint, isLoading, error, refreshConfig } = useCodeQuality()

  return {
    config: eslint,
    isLoading,
    error,
    refreshConfig
  }
}

// Hook for Prettier configuration specifically
export const usePrettierConfig = () => {
  const { prettier, isLoading, error, refreshConfig } = useCodeQuality()

  return {
    config: prettier,
    isLoading,
    error,
    refreshConfig
  }
}

// Hook for TypeScript configuration
export const useTypeScriptConfig = () => {
  const { config, isLoading, error, refreshConfig } = useCodeQuality()

  return {
    config: config?.typescript || null,
    isLoading,
    error,
    refreshConfig
  }
}

// Hook for testing configuration
export const useTestingConfig = () => {
  const { config, isLoading, error, refreshConfig } = useCodeQuality()

  return {
    config: config?.testing || null,
    isLoading,
    error,
    refreshConfig
  }
}