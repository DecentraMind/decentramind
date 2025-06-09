import { type UseQueryOptions, useQueryClient } from '@tanstack/vue-query'
import { useQueuedQuery } from '~/composables/useQueuedQuery'
import { useRequestQueue } from '~/plugins/vue-query'
import { unref } from 'vue'

/**
 * Create a query composable, args for queryFn are used as the last part of the query key
 * @param queryKey base query key
 * @param queryFn 
 * @returns 
 */
export function createQueryComposable<TArgs, TResult>(
  queryKey: string[],
  queryFn: (_: TArgs) => Promise<TResult>
) {
  return <TSelect = TResult>(
    args: TArgs,
    options?: Partial<UseQueryOptions<TResult, Error, TSelect>> & { additionalKeys?: string[] }
  ) => {
    const serializedArgs = args instanceof Object 
      ? args
      : String(args)

    const finalQueryKey = [...unref(queryKey), serializedArgs, ...(options?.additionalKeys || [])] as const

    return useQueuedQuery<TResult, TSelect>(
      finalQueryKey,
      () => queryFn(args),
      {
        enabled: true,
        ...options
      }
    )
  }
}

/**
 * Create a queued fetcher function that always fetches fresh data (bypasses cache)
 * @param baseQueryKey base query key
 * @param queryFn the async function to execute
 * @returns a composable that returns a fetcher function
 */
export function createQueuedFetcher<TParams, TResult>(
  baseQueryKey: string[],
  queryFn: (_params: TParams) => Promise<TResult>
) {
  return function<TData = TResult>(options: Partial<UseQueryOptions<TData, Error>> = {}) {
    const queryClient = useQueryClient()
    const requestQueue = useRequestQueue()
    
    const fetcher = async (params: TParams) => {
      const serializedParams = params instanceof Object 
        ? params
        : String(params)
      
      const queryKey = [...unref(baseQueryKey), serializedParams] as const
      
      // Invalidate the query to ensure fresh fetch
      await queryClient.invalidateQueries({ queryKey })
      
      return await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          return await requestQueue.add(
            async () => {
              const result = await queryFn(params)
              return result as TData
            },
            queryKey
          )
        },
        ...options
      })
    }

    return fetcher
  }
}