import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: 500,
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