import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { experimental_createPersister } from '@tanstack/query-persist-client-core'

export default defineNuxtPlugin((nuxtApp) => {
  const persister = import.meta.client ? experimental_createPersister({
    storage: globalThis.window.localStorage,
    maxAge: 1000 * 60 * 60 * 24, // 12 hours
    prefix: 'query'
  }) : undefined
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: 500,
        persister,
      },
    },
  })
  
  /**
   * Use the Vue Query plugin.
   * All query composables(under `composables/community`, `composables/tasks`) will use this query client.
   * 
   * get the queryClient instance in components:
   * const queryClient = useQueryClient()
   */
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })

  /**
   * Provide the query client to the app
   * 
   * @example
   * const { $queryClient } = useNuxtApp()
   */
  nuxtApp.provide('queryClient', queryClient)
})