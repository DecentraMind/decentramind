import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function createQueryComposable<TArgs, TResult>(
  queryKey: string[],
  queryFn: (_: TArgs) => Promise<TResult>
) {
  return (args: TArgs, options?: Partial<UseQueryOptions<TResult>> & { additionalKeys?: string[] }) => {
    const serializedArgs = args instanceof Object 
    ? JSON.stringify(args) 
    : String(args)
    return useQuery<TResult>({
      queryKey: [...queryKey, serializedArgs, ...(options?.additionalKeys || [])],
      queryFn: () => queryFn(args),
      enabled: true,
      ...options
    })
  }
}