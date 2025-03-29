<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { notificationStore } from '~/stores/notificationStore'

const { showError } = $(notificationStore())

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-unused-vars, @typescript-eslint/no-unused-vars
interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}
// fix "JSON.stringify() doesn't know how to serialize a BigInt"
BigInt.prototype.toJSON = function () {
  return this.toString()
}

onErrorCaptured((error, instance, info) => {
  console.error('Global error handler:', error, info)
  showError('Application Error: ', error)
  // return false to avoid 'TypeError: Cannot destructure property 'type' of 'vnode' as it is null' and page freezing
  return false
})

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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
