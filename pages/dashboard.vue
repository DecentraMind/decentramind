<script setup lang="ts">
const {t} = useI18n()

const links = [[
  {
    label: t('myQuest'),
    icon: 'heroicons:trophy',
    to: '/dashboard/quests'
  }]]
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow class="h-screen">
      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto sticky top-0 z-10 backdrop-blur-lg">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
