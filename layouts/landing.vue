<script setup lang="ts">
import LoginModal from '~/components/users/LoginModal.vue'
const router = useRouter()
</script>

<template>
  <div>
    <Header />
    <slot />
    <LoginModal @login="router.push('/discovery')" />
  </div>
</template>