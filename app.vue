<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
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
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage>
        <template #hero>
          test
        </template>
      </NuxtPage>

      <!--
      <div class="flex flex-col h-screen items-center gap-4 justify-center">
        <Text class="text-7xl font-bold">Start your real community journey</Text>
        <Text class="mt-3 mb-6">Try a better way than airdrop to build your community.</Text>
        <NuxtLink to="signup">
          Open to Build
          <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
      </NuxtLink>
      </div>
      -->
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
