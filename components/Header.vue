<script setup lang="ts">
const links = [
  {
    label: 'Docs',
    to: 'https://decentramind.gitbook.io/decentramind',
  },
  {
    label: 'Twitter',
    to: 'https://twitter.com/decentramindio',
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
