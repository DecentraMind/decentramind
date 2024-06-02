<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const { registInfo } = $(aocommunityStore())

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

const title = 'DecentralMind'
const description = 'DecentralMind'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image'
})

const router = useRouter()

const community = async() => {
  await doLogin()
  await registInfo()
  if (address) {
    console.log("---------ggggggggg")
    router.push('/signup')
  }
}
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
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