import { useQuery } from '@tanstack/vue-query'
import { useRequestQueue } from '~/plugins/vue-query'

export function useQueuedQuery<TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options = {}
) {
  const requestQueue = useRequestQueue()
  
  return useQuery({
    queryKey,
    queryFn: () => requestQueue.add(queryFn, queryKey),
    ...options
  })
}