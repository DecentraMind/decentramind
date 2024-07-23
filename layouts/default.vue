<script setup lang="ts">
import defaultCommunityLogo from '@/utils/defaultCommunityLogo'
const route = useRoute()
const slug = $computed(() => route.params.slug)

const links = $computed(() => {
  return [
    {
      id: 'home',
      label: 'Home',
      icon: 'i-heroicons-home',
      to: `/${slug}/`,
      tooltip: {
        text: 'Home',
        shortcuts: ['G', 'H'],
      },
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'i-arcticons-x-twitter',
      to: `/${slug}/tasks`,
      badge: '4',
      tooltip: {
        text: 'Inbox',
        shortcuts: ['G', 'I'],
      },
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: 'i-heroicons-inbox',
      to: `/${slug}/inbox`,
      badge: '4',
      tooltip: {
        text: 'Inbox',
        shortcuts: ['G', 'I'],
      },
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'i-heroicons-user-group',
      to: `/${slug}/users`,
      tooltip: {
        text: 'Users',
        shortcuts: ['G', 'U'],
      },
    },
    {
      id: 'community-discovery',
      label: 'Cmmunity-discovery',
      icon: 'i-heroicons-user-group',
      to: `/${slug}/discovery`,
      tooltip: {
        text: 'Community-discovery',
        shortcuts: ['G', 'U'],
      },
    },
  ]
})

const groups = [
  {
    key: 'links',
    label: 'Go to',
    commands: links.map((link) => ({ ...link, shortcuts: link.tooltip?.shortcuts })),
  },
  {
    key: 'code',
    label: 'Code',
    commands: [
      {
        id: 'source',
        label: 'View page source',
        icon: 'i-simple-icons-github',
        click: () => {
          window.open(`https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${route.path === '/' ? '/index' : route.path}.vue`, '_blank')
        },
      },
    ],
  },
]

const { userInfo, joinedCommunities, getBan, getUser } = $(aoCommunityStore())

const isCreateModalOpen = $ref(false)

onMounted(async () => {
  try {
    getBan()
    await getUser()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="96" class="w-24">
      <UDashboardSidebar>
        <template #header>
          <NuxtLink :to="`/${slug}/discovery`">
            <div class="w-full flex justify-center items-center">
              <img src="/export.png" class="h-4/5 w-4/5 transition duration-300 ease-in-out transform hover:brightness-75">
            </div>
          </NuxtLink>
        </template>

        <UDivider />

        <div class="overflow-y-auto h-full" style="-ms-overflow-style: none; scrollbar-width: none;">
          <NuxtLink
            v-for="item in joinedCommunities"
            :key="item.uuid"
            :to="`/${slug}/community/${item.uuid}`"
            class="w-full block mt-2"
          >
            <!--<img src="/logo.png" :title="item.name" class="h-full w-full">-->
            <div class="aspect-w-1 aspect-h-1">
              <img
                :src="item.logo || defaultCommunityLogo"
                :title="item.name"
                class="w-full h-full object-cover rounded-lg transition duration-300 ease-in-out transform hover:brightness-75"
              >
            </div>
          </NuxtLink>

          <UButton class="w-full mt-2" variant="soft" @click="isCreateModalOpen = true">
            <UIcon name="ion:add" class="h-full w-full " />
          </UButton>
        </div>

        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <!-- <UserDropdownMini /> -->
          <UPopover mode="hover" :to="`/${slug}/settings`">
            <NuxtLink :to="`/${slug}/settings`">
              <template v-if="userInfo.length && userInfo[0].avatar !== 'N/A'">
                <UAvatar :src="userInfo[0].avatar" alt="Avatar" size="2xl" />
              </template>
              <template v-else>
                <UAvatar alt=" " size="2xl" />
              </template>
            </NuxtLink>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>

    <UModal v-model="isCreateModalOpen" :ui="{ width: w-full }">
      <UCard>
        <CommunityCreate @close-modal="isCreateModalOpen = false" />
      </UCard>
    </UModal>
  </UDashboardLayout>
</template>
