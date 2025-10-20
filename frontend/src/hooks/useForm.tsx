import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useEffect } from 'react'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'

// Generic hook for forms with Zod validation
export function useForm<T extends z.ZodSchema>(
  schema: T,
  options?: UseFormProps<z.infer<T>>
): UseFormReturn<z.infer<T>> {
  return useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    ...options,
  })
}

// Hook for handling form submission with loading states
export function useFormSubmission<T extends z.ZodSchema>(
  schema: T,
  onSubmit: (data: z.infer<T>) => Promise<void> | void,
  options?: UseFormProps<z.infer<T>>
) {
  const form = useForm(schema, options)

  const handleSubmit = useCallback(
    async (data: z.infer<T>) => {
      try {
        await onSubmit(data)
      } catch (error) {
        console.error('Form submission error:', error)
        // Error handling is done in the onSubmit function
      }
    },
    [onSubmit]
  )

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}

// Hook for async form validation
export function useAsyncValidation<T extends z.ZodSchema>(
  schema: T,
  asyncValidator?: (data: z.infer<T>) => Promise<boolean>
) {
  const validateAsync = useCallback(
    async (data: z.infer<T>): Promise<boolean> => {
      try {
        // First validate with Zod
        schema.parse(data)

        // Then run custom async validation if provided
        if (asyncValidator) {
          return await asyncValidator(data)
        }

        return true
      } catch (error) {
        return false
      }
    },
    [schema, asyncValidator]
  )

  return { validateAsync }
}

// Hook for form state management with persistence
export function usePersistentForm<T extends z.ZodSchema>(
  schema: T,
  storageKey: string,
  options?: UseFormProps<z.infer<T>>
) {
  // Load initial values from localStorage
  const loadPersistedData = useCallback((): Partial<z.infer<T>> | undefined => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : undefined
    } catch (error) {
      console.warn('Failed to load persisted form data:', error)
      return undefined
    }
  }, [storageKey])

  // Save form data to localStorage
  const savePersistedData = useCallback(
    (data: Partial<z.infer<T>>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        console.warn('Failed to save persisted form data:', error)
      }
    },
    [storageKey]
  )

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to clear persisted form data:', error)
    }
  }, [storageKey])

  const form = useForm(schema, {
    ...options,
    defaultValues: loadPersistedData() as any,
  })

  // Auto-save on form changes
  const watchedValues = form.watch()
  useEffect(() => {
    if (form.formState.isDirty) {
      savePersistedData(watchedValues)
    }
  }, [watchedValues, form.formState.isDirty, savePersistedData])

  return {
    ...form,
    clearPersistedData,
  }
}

// Type helpers
export type FormData<T extends z.ZodSchema> = z.infer<T>
export type FormReturn<T extends z.ZodSchema> = UseFormReturn<z.infer<T>>