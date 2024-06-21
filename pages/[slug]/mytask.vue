<script setup lang="ts">

const route = useRoute()
const slug = $computed(() => route.params.slug)

const {t} = useI18n()

const links = [[
  // {
  //   label: t('wallet'),
  //   icon: 'i-heroicons-user-circle',
  //   to: `/${slug}/mytask`,
  //   exact: true
  // },
  {
    label: t('task'),
    icon: 'eos-icons:abstract-instance-outlined',
    // to: `/${slug}/dashboard/task`
  }]]
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="`${t('wallet.Dashboard')}`" />

      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
