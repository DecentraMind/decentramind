<script setup lang="ts">
import LoginModal from '~/components/users/LoginModal.vue'

const { isLoginModalOpen, address } = $(aoStore())
const router = useRouter()

definePageMeta({
  layout: 'landing',
})

const title = 'DecentraMind'
const description = 'DecentraMind'
const ogImage = '/social-card.png'
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: ogImage,
  twitterImage: ogImage,
  twitterCard: 'summary_large_image'
})

</script>

<template>
  <UMain class="flex flex-col items-center gap-4 justify-center">
    <UColorModeImage src="DMLogo.png" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-2/3 lg:w-[600px] mb-6" />
    <div class="text-xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center">Start your real community journey.</div>
    <div class="mt-3 mb-6 text-sm md:text-lg text-center">Try a better way than airdrop to build your community.</div>
    <UButton size="xl" color="black" @click="address ? router.push('/discovery') : isLoginModalOpen = true">
      Open to Build
      <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
    </UButton>
    <LoginModal @login="router.push('/discovery')" />
  </UMain>
</template>
