import { readonly, onUnmounted } from 'vue'

export function useClock(interval: number) {
  let now = $ref<number>(Date.now())

  const intervalID = setInterval(() => {
    now = Date.now()
  }, interval)

  // Clean up the interval when the component is unmounted
  onUnmounted(() => {
    clearInterval(intervalID)
  })

  return $$(
    readonly(now)
  )
}
