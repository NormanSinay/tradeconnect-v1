import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

// Optimized React Query hooks for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

/**
 * Hook personalizado para queries optimizadas con React Query
 * Incluye configuración predeterminada para mejor rendimiento y UX
 * SSR-safe para integración con Astro
 */
export const useOptimizedQuery = <TData = unknown, TError = unknown>(
  key: string[],
  queryFn: () => Promise<TData>,
  options: Partial<UseQueryOptions<TData, TError>> = {}
) => {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: (failureCount, error) => {
      // No reintentar en errores 4xx (cliente)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // SSR-safe: disable for server-side rendering
    enabled: typeof window !== 'undefined' && (options.enabled ?? true),
    ...options,
  });
};

/**
 * Hook personalizado para mutations optimizadas
 * Incluye configuración predeterminada para mejor UX
 */
export const useOptimizedMutation = <TData = unknown, TError = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: Partial<UseMutationOptions<TData, TError, TVariables>> = {}
) => {
  return useMutation({
    mutationFn,
    retry: false, // No reintentar mutations por defecto
    ...options,
  });
};

/**
 * Hook para prefetching inteligente de datos (SSR-safe)
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    <TData = unknown>(key: string[], queryFn: () => Promise<TData>) => {
      // Only prefetch on client-side
      if (typeof window === 'undefined') return;

      queryClient.prefetchQuery({
        queryKey: key,
        queryFn,
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchInfiniteQuery = useCallback(
    <TData = unknown>(key: string[], queryFn: (pageParam: any) => Promise<TData>) => {
      // Only prefetch on client-side
      if (typeof window === 'undefined') return;

      queryClient.prefetchInfiniteQuery({
        queryKey: key,
        queryFn: ({ pageParam = 1 }) => queryFn(pageParam),
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return { prefetchQuery, prefetchInfiniteQuery };
};

/**
 * Hook para invalidación optimizada de queries relacionadas
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateRelated = useCallback(
    (patterns: string[]) => {
      patterns.forEach((pattern) => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.some((key) =>
              typeof key === 'string' && key.includes(pattern)
            ),
        });
      });
    },
    [queryClient]
  );

  const invalidateExact = useCallback(
    (queryKeys: string[][]) => {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    [queryClient]
  );

  return { invalidateRelated, invalidateExact };
};

/**
 * Hook para gestión optimizada de cache
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  const setQueryData = useCallback(
    <TData = unknown>(key: string[], data: TData) => {
      queryClient.setQueryData(key, data);
    },
    [queryClient]
  );

  const getQueryData = useCallback(
    <TData = unknown>(key: string[]): TData | undefined => {
      return queryClient.getQueryData(key);
    },
    [queryClient]
  );

  const updateQueryData = useCallback(
    <TData = unknown>(
      key: string[],
      updater: (oldData: TData | undefined) => TData
    ) => {
      queryClient.setQueryData(key, updater);
    },
    [queryClient]
  );

  const removeQueryData = useCallback(
    (key: string[]) => {
      queryClient.removeQueries({ queryKey: key });
    },
    [queryClient]
  );

  return {
    setQueryData,
    getQueryData,
    updateQueryData,
    removeQueryData,
  };
};