<script setup lang="ts">
import LoginModal from '~/components/users/LoginModal.vue'
const router = useRouter()
const { checkIsActiveWallet, addSwitchListener } = $(aoStore())
let { address } = $(aoStore())
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
    <LoginModal @login="router.push('/discovery')" />
  </div>
</template>