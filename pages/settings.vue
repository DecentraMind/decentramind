<script setup lang="ts">
import { aoStore } from '~/stores/aoStore'

const {t} = useI18n()
const { address } = $(aoStore())
const { setCurrentCommunityUuid } = $(communityStore())
const router = useRouter()

definePageMeta({
  ssr: false
})

onMounted(async () => {
  setCurrentCommunityUuid(undefined)
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
  }]
  ]
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
