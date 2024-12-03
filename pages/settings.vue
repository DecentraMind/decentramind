<script setup lang="ts">
const {t} = useI18n()
const { address } = $(aoStore())
const router = useRouter()

onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }
})

const links = [[{
    label: t('setting.person'),
    icon: 'i-heroicons-user-circle',
    to: '/settings',
    exact: true
  }, {
    label: t('setting.community'),
    icon: 'i-heroicons-user-group',
    to: '/settings/community'
  }, {
    label: t('setting.task'),
    icon: 'heroicons:trophy',
    to: '/settings/quest'
  }, {
    label: t('setting.invite'),
    icon: 'i-heroicons-bell',
    to: '/settings/my-invite'
  }]/*, [{
    label: 'Documentation',
    icon: 'i-heroicons-book-open',
    to: 'https://ui.nuxt.com/pro',
    target: '_blank'
  }, {
    label: 'Buy now',
    icon: 'i-heroicons-credit-card',
    to: 'https://ui.nuxt.com/pro/purchase',
    target: '_blank'
  }]
  */
  ]
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="`${t('setting.title')}`" />

      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
