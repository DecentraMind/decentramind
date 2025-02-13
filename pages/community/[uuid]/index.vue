<script setup lang="ts">
import { communityRightPages, type PageSymbol } from '~/utils/constants'
import type { Community, Task } from '~/types/index'
import { provide } from 'vue'
import Chatroom from '~/components/community/Chatroom.vue'
import CommunitySidebar from '~/components/community/CommunitySidebar.vue'
import PublicTasks from '~/components/community/PublicTasks.vue'
import PrivateHome from '~/components/private/PrivateHome.vue'

definePageMeta({
  ssr: false
})

const { t } = useI18n()
const { setCurrentCommunityUuid, getLocalCommunity } = $(communityStore())
const { add: inboxAdd } = $(inboxStore())
const { address } = $(aoStore())
const { showError, showMessage } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const uuid = $computed(() => route.params.uuid) as string

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

const runtimeConfig = useRuntimeConfig()
let selectedTaskVisibleType = $computed({
  get() {
    const index = taskVisibleTabs.findIndex(item => item.type === (route.query.visible || 'public'))
    console.log('get selectedTaskVisibleType', route.query.visible, index)
    return index === -1 ? 0 : index
  },
  set(value: number) {
    router.replace({ query: { visible: taskVisibleTabs[value].type }, hash: route.hash })
  },
})
const onTaskVisibleTypeChange = (value: number) => {
  // prevent user to select private quests
  if (value !== 0) {
    if (runtimeConfig.public.debug) {
      return
    }
    showMessage('Being Cooked!')
    setTimeout(() => {
      selectedTaskVisibleType = 0
    }, 500)
  }
}


console.log('get community info of ', uuid)
let community = $ref<Community>()

const isAdminOrOwner = $computed(() => community && address ? community.owner === address || community.admins.includes(address) : false)

let isLoading = $ref(true)
onMounted(async () => {
  if (!address) {
    router.push('/')
  }
  setCurrentCommunityUuid(uuid)

  try {
    community = await getLocalCommunity(uuid)
    if (!community) {
      throw new Error('Failed to load community info. Please try again later.')
    }
    console.log('get communityInfo:', community.name, community, uuid)


    if (community.communitychatid) {
      await inboxAdd(community.name, community.communitychatid)
    }

  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Loading data error.', error as Error)
  } finally {
    console.log('finally isLoading:', isLoading)
    isLoading = false
  }
})

const reloadCommunity = async () => {
  console.log('reloading community', uuid)
  community = await getLocalCommunity(uuid)
}
provide('reloadCommunity', reloadCommunity)

const currentRightPage = $computed<PageSymbol>(() => {
  const page = Object.keys(communityRightPages).includes(route.hash) ? route.hash : '#quests'
  return communityRightPages[page as keyof typeof communityRightPages] || communityRightPages['#quests']
})

const showSidebar = ref(false)
</script>
<template>
  <UDashboardPage :ui="{ wrapper: 'w-full static' }">
    <CommunitySidebar
      v-model:is-expanded="showSidebar"
      :community="community"
      :address="address"
    />
    <div class="w-full h-screen">
      <div v-if="currentRightPage === communityRightPages['#quests']" class="bg-grid">
        <!-- header buttons -->
        <div class="w-full relative flex justify-between items-center px-4 py-3 z-10 bg-white drop-shadow-sm">
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
            @change="onTaskVisibleTypeChange"
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
          v-if="community && selectedTaskVisibleType === 1 && runtimeConfig.public.debug"
          :is-admin="isAdminOrOwner"
          :uuid="uuid"
        />
      </div>

      <Chatroom
        v-if="community && currentRightPage === communityRightPages['#chatroom']"
        :community="community"
        :address="address"
      />
    </div>
  </UDashboardPage>
</template>
