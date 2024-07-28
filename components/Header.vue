<script setup lang="ts">
const links = [
  {
    label: 'Docs',
    to: 'https://decentramind.gitbook.io/decentramind',
    target: '_blank'
  },
  {
    label: 'Twitter',
    to: 'https://twitter.com/decentramindio',
    target: '_blank'
  },
]
</script>

<template>
  <UHeader
    :links="links"
    :ui="{
      panel: {
        body: 'px-4 sm:px-6 pt-3 pb-6'
      },
    }"
  >
    <template #logo>DecentraMind</template>

    <template #center>
      <div />
    </template>

    <template #right>
      <UHeaderLinks
        :links="links"
        :ui="{
          wrapper: 'lg:flex gap-12 hidden mr-4',
          base: 'font-normal text-xl h-16',
          externalIcon: {
            name: 'i-heroicons-arrow-up-right-20-solid',
            base: 'w-3 h-3 absolute top-3 -right-3.5 text-gray-400 dark:text-gray-500'
          }
        }"
      />
    </template>

    <template #panel>
      <UHeaderLinks
        :links="links"
        :ui="{
          wrapper: 'block flex-col',
          base: 'font-normal text-xl h-16'
        }"
      />
      <!-- <UNavigationTree :links="mapContentNavigation(navigation)" /> -->
    </template>
  </UHeader>
</template>
