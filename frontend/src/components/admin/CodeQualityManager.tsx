import React, { useState } from 'react'
import { useCodeQuality } from '@/hooks/useCodeQuality'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Save, History, AlertTriangle, CheckCircle, Settings } from 'lucide-react'
import { showToast } from '@/utils/toast'
import type { CodeQualityConfig } from '@/services/configService'

interface CodeQualityManagerProps {
  className?: string
}

export const CodeQualityManager: React.FC<CodeQualityManagerProps> = ({ className }) => {
  const {
    config,
    isLoading,
    error,
    lastUpdated,
    refreshConfig,
    updateConfig,
    validateConfig,
    getConfigHistory,
    rollbackConfig
  } = useCodeQuality()

  const [isEditing, setIsEditing] = useState(false)
  const [editedConfig, setEditedConfig] = useState<Partial<CodeQualityConfig>>({})
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)
  const [configHistory, setConfigHistory] = useState<Array<{ version: string; config: CodeQualityConfig; timestamp: Date; author: string }>>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load configuration history
  const loadHistory = async () => {
    try {
      const history = await getConfigHistory(20)
      setConfigHistory(history)
    } catch (error) {
      showToast.error('Failed to load configuration history')
    }
  }

  // Handle configuration update
  const handleSaveConfig = async () => {
    if (!editedConfig) return

    // Validate configuration first
    const validation = await validateConfig(editedConfig)
    setValidationResult(validation)

    if (!validation.isValid) {
      showToast.error('Configuration validation failed')
      return
    }

    const success = await updateConfig(editedConfig)
    if (success) {
      setIsEditing(false)
      setEditedConfig({})
      setValidationResult(null)
    }
  }

  // Handle rollback
  const handleRollback = async (version: string) => {
    const success = await rollbackConfig(version)
    if (success) {
      setShowHistory(false)
      await loadHistory()
    }
  }

  // Start editing
  const handleStartEdit = () => {
    setEditedConfig(config || {})
    setIsEditing(true)
    setValidationResult(null)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedConfig({})
    setValidationResult(null)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load configuration: {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={refreshConfig}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Code Quality Configuration
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastUpdated.toLocaleString()}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshConfig}
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowHistory(!showHistory)
                if (!showHistory) loadHistory()
              }}
            >
              <History className="h-3 w-3 mr-1" />
              History
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="eslint" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="eslint">ESLint</TabsTrigger>
            <TabsTrigger value="prettier">Prettier</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* ESLint Configuration */}
          <TabsContent value="eslint" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">ESLint Rules</h3>
              {!isEditing ? (
                <Button onClick={handleStartEdit}>Edit Configuration</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveConfig} disabled={!validationResult?.isValid}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {validationResult && !validationResult.isValid && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-96 overflow-y-auto space-y-4">
              {config?.eslint.rules && Object.entries(config.eslint.rules).map(([rule, value]) => (
                <div key={rule} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <code className="text-sm font-mono">{rule}</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Array.isArray(value) ? `${value[0]}: ${JSON.stringify(value[1])}` : String(value)}
                    </p>
                  </div>
                  <Badge variant={value === 'error' ? 'destructive' : value === 'warn' ? 'secondary' : 'outline'}>
                    {String(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Prettier Configuration */}
          <TabsContent value="prettier" className="space-y-4">
            <h3 className="text-lg font-semibold">Prettier Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              {config?.prettier && Object.entries(config.prettier).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  {typeof value === 'boolean' ? (
                    <Input id={key} type="checkbox" checked={value} disabled />
                  ) : typeof value === 'number' ? (
                    <Input id={key} type="number" value={value} disabled />
                  ) : (
                    <Input id={key} value={String(value)} disabled />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TypeScript Configuration */}
          <TabsContent value="typescript" className="space-y-4">
            <h3 className="text-lg font-semibold">TypeScript Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              {config?.typescript && Object.entries(config.typescript).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <Badge variant={value ? 'default' : 'secondary'}>
                    {String(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Testing Configuration */}
          <TabsContent value="testing" className="space-y-4">
            <h3 className="text-lg font-semibold">Testing Coverage Thresholds</h3>
            <div className="space-y-4">
              {config?.testing.coverageThreshold.global && Object.entries(config.testing.coverageThreshold.global).map(([metric, threshold]) => (
                <div key={metric} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium capitalize">{metric}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(threshold, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">{threshold}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Configuration History */}
        {showHistory && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Configuration History</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {configHistory.map((entry, index) => (
                <div key={entry.version} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      By: {entry.author}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRollback(entry.version)}
                    disabled={index === 0} // Can't rollback to current
                  >
                    Rollback
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CodeQualityManager