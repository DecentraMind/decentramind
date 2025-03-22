import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
  
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
  nuxtApp.provide('queryClient', queryClient)
}) 