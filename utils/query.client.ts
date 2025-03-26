import { type UseQueryOptions } from '@tanstack/vue-query'
import { useQueuedQuery } from '~/composables/useQueuedQuery'
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
  return (
    args: TArgs,
    options?: Partial<UseQueryOptions<TResult>> & { additionalKeys?: string[] }
  ) => {
    const serializedArgs = args instanceof Object 
    ? args
    : String(args)

    // Create a plain array with spread operator
    const finalQueryKey = [...unref(queryKey), serializedArgs, ...(options?.additionalKeys || [])] as const

    return useQueuedQuery(
      finalQueryKey,
      () => queryFn(args),
      {
        enabled: true,
        ...options
      }
    )
  }
}