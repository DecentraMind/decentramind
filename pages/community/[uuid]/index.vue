<script setup lang="ts">
import { communityRightPages, type PageSymbol } from '~/utils/constants'
import type { Task } from '~/types'
import Chatroom from '~/components/community/Chatroom.vue'
import CommunitySidebar from '~/components/community/CommunitySidebar.vue'
import PublicTasks from '~/components/community/PublicTasks.vue'
import PrivateHome from '~/components/private/PrivateHome.vue'
import { useCommunityQuery } from '~/composables/community/communityQuery'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { notificationStore } from '~/stores/notificationStore'
import { breadcrumbStore } from '~/stores/breadcrumbStore'

definePageMeta({
  ssr: false
})

const { t } = useI18n()
const { setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())
const { showError } = $(notificationStore())
const { setBreadcrumbs } = $(breadcrumbStore())

const route = useRoute()
const router = useRouter()

const uuid = $computed(() => route.params.uuid) as string

const { data: community, isError, error, isLoading } = useCommunityQuery(uuid, {
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
  refetchOnReconnect: 'always',
})
watch(isError, (value) => {
  if (value) {
    showError('Loading community info error.', error.value as Error)
  }
})
watch(() => community.value?.name, (communityName) => {
  if (communityName) {
    setBreadcrumbs([
        {
          label: communityName
        }
      ])
  } else {
    setBreadcrumbs([])
  }
}, { immediate: true })

type TaskVisibleTab = {
  type: Task['visible']
  label: string
  content: string
}

const taskVisibleTabs: TaskVisibleTab[] = [
  {
    type: 'public',
    label: t('Public Quests'),
    content: '',
  },
  {
    type: 'private',
    label: t('Private Quests'),
    content: '',
  },
]

const selectedTaskVisibleType = $computed({
  get() {
    const index = taskVisibleTabs.findIndex(item => item.type === (route.query.visible || 'public'))
    return index === -1 ? 0 : index
  },
  set(value: number) {
    router.replace({ query: { visible: taskVisibleTabs[value].type }, hash: route.hash })
  },
})

const isAdminOrOwner = $computed(() => community.value && address 
  ? community.value.owner === address || community.value.admins.includes(address)
  : false
)

onMounted(async () => {
  if (!address) {
    router.push('/')
  }
  setCurrentCommunityUuid(uuid)
})

const currentRightPage = $computed<PageSymbol>(() => {
  const page = Object.keys(communityRightPages).includes(route.hash) ? route.hash : '#quests'
  return communityRightPages[page as keyof typeof communityRightPages] || communityRightPages['#quests']
})

const showSidebar = ref(false)
</script>
<template>
  <UDashboardPage :ui="{ wrapper: 'w-full static h-[calc(100vh-var(--header-height))]' }">
    <div v-if="isLoading" class="w-full h-full flex justify-center items-center">
      <UIcon
        name="svg-spinners:blocks-scale"
        dynamic
        class="w-16 h-16 opacity-50"
      />
    </div>
    <template v-else>
      <CommunitySidebar
        v-model:is-expanded="showSidebar"
        :community="community"
        :address="address"
      />
      <div class="w-full">
        <div v-if="currentRightPage === communityRightPages['#quests']" class="bg-grid">
          <!-- header buttons -->
          <div class="w-full relative z-20 flex justify-between items-center px-4 py-3 bg-white drop-shadow-sm">
            <!-- expand sidebar button -->
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-chevron-double-right"
              :class="{ 'invisible': showSidebar, 'block lg:hidden': true }"
              @click="showSidebar = true"
            />
            <UTabs
              v-model="selectedTaskVisibleType"
              :items="taskVisibleTabs"
              :ui="{ wrapper: 'space-y-0' }"
            />
            <div id="top-right-button" />
          </div>

          <!-- public tasks list -->
          <PublicTasks
            v-if="community && selectedTaskVisibleType === 0"
            :is-admin-or-owner="isAdminOrOwner"
            :community="community"
          />
          <PrivateHome
            v-if="community && selectedTaskVisibleType === 1"
            :is-admin="isAdminOrOwner"
            :is-owner="community.owner === address"
            :is-applicable="community.isPrivateApplicable"
            :uuid="uuid"
            :joined="!!community.privateUnlockTime"
          />
        </div>

        <Chatroom
          v-if="community && currentRightPage === communityRightPages['#chatroom']"
          :community="community"
          :address="address"
        />
      </div>
    </template>
  </UDashboardPage>
</template>
