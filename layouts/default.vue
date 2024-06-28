<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const appConfig = useAppConfig()
const { isHelpSlideoverOpen } = useDashboard()

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
const footerLinks = $computed(() => {
  return [
    {
      label: t('Task Area'),
      icon: 'i-heroicons-plus',
      to: `/${slug}/tasks`,
    },
    {
      label: 'Invite people',
      icon: 'i-heroicons-plus',
      to: `/${slug}/settings/communityinfo`,
    },
    {
      label: 'Help & Support',
      icon: 'i-heroicons-question-mark-circle',
      click: () => (isHelpSlideoverOpen.value = true),
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

const defaultColors = ref(
  ['green', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet'].map((color) => ({
    label: color,
    chip: color,
    click: () => (appConfig.ui.primary = color),
  }))
)
const colors = computed(() => defaultColors.value.map((color) => ({ ...color, active: appConfig.ui.primary === color.label })))

const communityList1 = [
  { title: 'HelloRWA1', slug: 'hellorwa1', avatar: '/logo.png' },
  { title: 'HelloRWA2', slug: 'hellorwa2', avatar: '/logo.png' },
  { title: 'HelloRWA3', slug: 'hellorwa3', avatar: '/logo.png' },
]

const { userInfo, joincommunityList, communityCreate, getCommunitylist, getInfo } = $(aocommunityStore())

let result = $ref()
const createCommunity = $ref(false)

let communityLoading = $ref(true)

const getCommunity = async () => {

  result = await getCommunitylist()

  communityLoading = false
}

let linkTwitter = $ref(false)
onMounted(async () => {
  console.log("---")
  console.log(joincommunityList)
  try {
    if (Array.isArray(joincommunityList) && joincommunityList.length !== 0) {
      communityLoading = false
    }
    await getInfo()
    if((!userInfo[0].twitter || userInfo[0].twitter == 'N/A') && (!userInfo[0].github || userInfo[0].github == 'N/A')){
      linkTwitter = false
    } else {
      linkTwitter = true
    }
    //await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))

const links2 = [{
  label: 'Docs',
  icon: 'i-heroicons-book-open',
  to: '/getting-started'
}, {
  label: 'Pro',
  icon: 'i-heroicons-square-3-stack-3d',
  to: '/pro'
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch',
  to: '/releases'
}]

const { makecommunityChat } = $(aocommunityStore())

const { postToken } = $(linktwitter())
const test = ()=> {
  const a = makecommunityChat()
  //const a = postToken()

}


</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="100" collapsible>
      <UDashboardSidebar>
        <template #header>
          <NuxtLink :to="`/${slug}/discovery`">
            <div class="w-full flex justify-center items-center">
              <img src="/export.png" class="h-4/5 w-4/5 transition duration-300 ease-in-out transform hover:brightness-75">
            </div>
          </NuxtLink>
        </template>

        <UDivider />

        <NuxtLink v-for="item in joincommunityList" :key="item.uuid" :to="`/${slug}/community/${item.uuid}`">
          <!--<img src="/logo.png" :title="item.name" class="h-full w-full">-->
          <div class="aspect-w-1 aspect-h-1">
            <img
              :src="item.logo"
              :title="item.name"
              class="w-full h-full object-cover rounded-lg transition duration-300 ease-in-out transform hover:brightness-75"
            >
          </div>
        </NuxtLink>
        <UButton v-if="linkTwitter" variant="soft" @click="communityCreate = true">
          <UIcon name="ion:add" class="h-full w-full " />
        </UButton>

        <!--
        <UButton variant="soft" @click="test">
          <UIcon name="ion:add" class="h-full w-full " />
        </UButton>
        -->
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
                <UAvatar alt="Avatar" size="2xl" />
              </template>
            </NuxtLink>
            <template #panel>
              <div class="h-[350px] w-[300px] pt-10 pl-10 pr-10">
                <template v-if="userInfo.length && userInfo[0].avatar !== 'N/A'">
                  <UAvatar :src="userInfo[0].avatar" alt="Avatar" size="2xl" />
                </template>
                <template v-else>
                  <UAvatar src="/community/chatavatar.jpg" alt="Avatar" size="2xl" />
                </template>
                <div>
                  <div v-if="userInfo.length && userInfo[0]" class="text-2xl">{{ userInfo[0].name }}</div>
                </div>
                <UDivider />

                <div class="mt-3">
                  <UIcon name="ei:sc-twitter" />
                  <UIcon name="quill:mail" />
                  <UIcon name="ei:sc-telegram" />
                </div>
              </div>
            </template>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>
    <!--    <UDashboardPanel :width="250" :resizable="{ min: 200, max: 300 }" collapsible>-->
    <!--      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">-->
    <!--        <template #left>-->
    <!--          <TeamsDropdown />-->
    <!--        </template>-->
    <!--      </UDashboardNavbar>-->

    <!--      <UDashboardSidebar>-->
    <!--        <template #header>-->
    <!--          <UDashboardSearchButton />-->
    <!--        </template>-->

    <!--        <UDashboardSidebarLinks :links="links" />-->

    <!--        <UDivider />-->

    <!--        <UDashboardSidebarLinks-->
    <!--          :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
    <!--          @update:links="(colors) => (defaultColors = colors)"-->
    <!--        />-->

    <!--        <div class="flex-1" />-->

    <!--        <UDashboardSidebarLinks :links="footerLinks" />-->

    <!--        <UDivider class="bottom-0 sticky" />-->

    <!--        <template #footer>-->
    <!--          &lt;!&ndash; ~/components/UserDropdown.vue &ndash;&gt;-->
    <!--          <UserDropdown />-->
    <!--        </template>-->
    <!--      </UDashboardSidebar>-->
    <!--    </UDashboardPanel>-->

    <slot />


    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
    <UModal v-model="communityCreate" :ui="{ width: w-full }">
      <UCard>
        <CommunityCreate />
      </UCard>
    </UModal>
  </UDashboardLayout>
</template>
