<script setup lang="ts">
import type { NavItem } from "@nuxt/content/dist/runtime/types";

const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const { registInfo } = $(aocommunityStore())

const navigation = inject<Ref<NavItem[]>>("navigation", ref([]));

const links = [
  // {
  //   label: "Discovery",
  //   to: "/discovery",
  // },
  {
    label: "Docs",
    to: "https://decentramind.gitbook.io/decentramind",
  },
  // {
  //   label: "Pricing",
  //   to: "/pricing",
  // },
  {
    label: "Twitter",
    to: "https://twitter.com/decentramindio",
  },
  // {
  //   label: "Blog",
  //   to: "/blog",
  // },
];

const wallet = [
  [{
    label: 'Disconnect',
    click: () => {
      doLogout()
    }
  }]
]


// onMounted(init)

</script>

<template>
  <UHeader :links="links">
    <template #logo>DecentraMind
<!--      <UBadge label="Beta" variant="subtle" class="mb-0.5" />-->
    </template>

<!--    <template #right>-->
<!--      <UPopover v-if="address" :popper="{ placement: 'bottom-end' }">-->
<!--        <UButton color="white" block>-->
<!--          {{ shortAddress(address) }}-->
<!--        </UButton>-->
<!--        <template #panel>-->
<!--          <UButton color="red" @click="doLogout">-->
<!--            Disconnect-->
<!--          </UButton>-->
<!--        </template>-->
<!--      </UPopover>-->
<!--      <UButton v-else color="white" @click="doLogin">-->
<!--        Connect Wallet-->
<!--      </UButton>-->
<!--    </template>-->

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" default-open />
    </template>
  </UHeader>
</template>
