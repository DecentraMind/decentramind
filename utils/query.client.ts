import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

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

    return useQuery<TResult, Error, TSelect>({
      queryKey: [...queryKey, serializedArgs, ...(options?.additionalKeys || [])],
      queryFn: () => queryFn(args),
      enabled: true,
      ...options
    })
  }
}