<script setup lang="ts">
import LoginModal from '~/components/users/LoginModal.vue'
</script>

<template>
  <div>
    <Header />
    <slot />
    <LoginModal />
  </div>
</template>
