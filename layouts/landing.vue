<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

const { checkIsActiveWallet, addSwitchListener } = $(aoStore())
let { address } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen } = $(aoStore())

const queryClient = useQueryClient()
onMounted(async () => {
  if (address) {
    if (!await checkIsActiveWallet()) {
      console.log('not active wallet')
      address = ''
      isLoginModalOpen = true
      return
    }
    addSwitchListener()
  }
  queryClient.prefetchQuery({
    queryKey: address ? ['community', 'communities', address] : ['community', 'communities'],
  })
})
</script>

<template>
  <div>
    <Header />
    <slot />
  </div>
</template>