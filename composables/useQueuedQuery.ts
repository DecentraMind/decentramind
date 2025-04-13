import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { useRequestQueue } from '~/plugins/vue-query'

export function useQueuedQuery<TData, TSelect = TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options: Partial<UseQueryOptions<TData, Error, TSelect>> = {}
) {
  const requestQueue = useRequestQueue()
  
  return useQuery<TData, Error, TSelect>({
    queryKey,
    queryFn: () => requestQueue.add(queryFn, queryKey),
    ...options
  })
}