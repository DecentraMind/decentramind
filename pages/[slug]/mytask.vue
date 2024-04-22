<script setup lang="ts">

const route = useRoute()
const slug = $computed(() => route.params.slug)

const links = [[{
    label: '我的钱包',
    icon: 'i-heroicons-user-circle',
    to: `/${slug}/mytask`,
    exact: true
  }, {
    label: '任务管理',
    icon: 'eos-icons:abstract-instance-outlined',
    to: `/${slug}/mytask/task`
  }]]
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Settings" />

      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
