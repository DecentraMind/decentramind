<script setup lang="ts">

const route = useRoute()
const slug = $computed(() => route.params.slug)

const links = [[{
    label: '个人信息设置',
    icon: 'i-heroicons-user-circle',
    to: `/${slug}/settings`,
    exact: true
  }, {
    label: '社区信息设置',
    icon: 'i-heroicons-user-group',
    to: `/${slug}/settings/members`
  }, {
    label: '任务信息设置',
    icon: 'i-heroicons-bell',
    to: `/${slug}/settings/notifications`
  }, {
    label: '我的邀请',
    icon: 'i-heroicons-bell',
    to: `/${slug}/settings/myinvite`
  }], [{
    label: 'Documentation',
    icon: 'i-heroicons-book-open',
    to: 'https://ui.nuxt.com/pro',
    target: '_blank'
  }, {
    label: 'Buy now',
    icon: 'i-heroicons-credit-card',
    to: 'https://ui.nuxt.com/pro/purchase',
    target: '_blank'
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
