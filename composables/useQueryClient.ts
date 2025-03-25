import { useNuxtApp } from '#app'
import type { QueryClient } from '@tanstack/query-core'

export function useQueryClient(): QueryClient {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$queryClient as QueryClient
}