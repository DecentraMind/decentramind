<script setup lang="ts">
const { doLogout } = $(aoStore())

const links = [
  // {
  //   label: "Discovery",
  //   to: "/discovery",
  // },
  {
    label: 'Docs',
    to: 'https://decentramind.gitbook.io/decentramind',
  },
  // {
  //   label: "Pricing",
  //   to: "/pricing",
  // },
  {
    label: 'Twitter',
    to: 'https://twitter.com/decentramindio',
  },
  // {
  //   label: "Blog",
  //   to: "/blog",
  // },
]



// onMounted(init)

</script>

<template>
  <UHeader :links="links">
    <template #logo>DecentraMind</template>
  </UHeader>
</template>
