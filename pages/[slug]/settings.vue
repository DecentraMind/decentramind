<script setup lang="ts">

const route = useRoute()
const slug = $computed(() => route.params.slug)

const {t} = useI18n()

const links = [[{
    label: t('setting.person'),
    icon: 'i-heroicons-user-circle',
    to: `/${slug}/settings`,
    exact: true
  }, {
    label: t('setting.community'),
    icon: 'i-heroicons-user-group',
    to: `/${slug}/settings/communityinfo`
  }, {
    label: t('setting.task'),
    icon: 'eos-icons:abstract-instance-outlined',
    to: `/${slug}/settings/taskinfo`
  }, {
    label: t('setting.invite'),
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
