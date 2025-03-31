import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { experimental_createPersister } from '@tanstack/query-persist-client-core'
import { inject, type InjectionKey } from 'vue'

class RequestQueue {
  private queue: Array<{fn: () => Promise<any>, queryKey: readonly unknown[]}> = []
  private isProcessing = false
  // TODO if CU can accept higher rate limit, set this request interval to 50 or 0
  private interval = 100

  async add<T>(requestFn: (_?: any) => Promise<T>, queryKey: readonly unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({fn: async () => {
        try {
          const result = await requestFn()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      }, queryKey})
      
      if (!this.isProcessing) {
        this.process()
      }
    })
  }

  private async process() {
    if (this.queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true
    const request = this.queue.shift()!

    try {
      console.log('Processing request:', request.queryKey)
      await request.fn()
    } catch (error) {
      console.error('Request in queue failed:', error)
    }

    // 等待指定间隔后处理下一个请求
    await new Promise(resolve => setTimeout(resolve, this.interval))
    this.process()
  }
}
// 创建注入键
export const RequestQueueKey: InjectionKey<RequestQueue> = Symbol('RequestQueue')
export function useRequestQueue(): RequestQueue {
  const queue = inject(RequestQueueKey)
  if (!queue) {
    throw new Error('No RequestQueue found. Make sure the Vue Query plugin is properly initialized.')
  }
  return queue
}

export default defineNuxtPlugin((nuxtApp) => {
  const persister = import.meta.client ? experimental_createPersister({
    storage: globalThis.window.localStorage,
    maxAge: 1000 * 60 * 60 * 24, // 12 hours
    prefix: 'query'
  }) : undefined

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: 500,
        persister,
      },
    },
  })
  
  const requestQueue = new RequestQueue()
  nuxtApp.vueApp.provide(RequestQueueKey, requestQueue)
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