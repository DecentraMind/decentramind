<script setup lang="ts">
const { checkIsActiveWallet, addSwitchListener } = $(aoStore())
let { address } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen } = $(aoStore())

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
})
</script>

<template>
  <div>
    <Header />
    <slot />
  </div>
</template>