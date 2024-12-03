<script setup lang="ts">
import { communityRightPages, type PageSymbol } from '~/utils/constants'
import type { Community, Task } from '~/types/index'
import { arUrl } from '~/utils/arAssets'
import { provide } from 'vue'
import Chatroom from '~/components/community/Chatroom.vue'
import CommunitySidebar from '~/components/community/CommunitySidebar.vue'
import TaskStatus from '~/components/task/TaskStatus.vue'
import { useTaskStore } from '~/stores/taskStore'
import TaskForm from '~/components/task/TaskForm.vue'

const { t } = useI18n()
const taskStore = useTaskStore()
const { getTasksByCommunityUuid } = taskStore
const { setCurrentCommunityUuid, getLocalCommunity } = $(communityStore())
const { add: inboxAdd } = $(inboxStore())
const { address } = $(aoStore())
const { showError, showMessage } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const uuid = $computed(() => route.params.uuid) as string

let tasks = $ref<Task[]>([])

function alertNotReady() {
  showMessage('Being Cooked')
}

let createTaskType = $ref<Task['type']>('space')

const taskTypes = [
  [
    {
      label: 'Twitter Space Quest',
      click: () => {
        createTaskType = 'space'
        isCreateTaskModalOpen = true
      },
    },
    {
      label: 'Promotion Quest',
      click: () => {
        createTaskType = 'promotion'
        isCreateTaskModalOpen = true
      },
    },
    {
      label: 'Invitation Quest',
      click: alertNotReady,
    },
    {
      label: 'Try Our Product Quest',
      click: alertNotReady,
    },
    {
      label: 'Be a Bird For Us',
      click: () => {
        createTaskType = 'bird'
        isCreateTaskModalOpen = true
      },
    },
    {
      label: 'Good Read Quest',
      click: () => {
        createTaskType = 'article'
        isCreateTaskModalOpen = true
      },
    },
  ]
]

const taskVisibleTabs: {
  type: Task['visible']
  label: string
  content: string
}[] = [
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
    showMessage('Being Cooked!')
    setTimeout(() => {
      selectedTaskVisibleType = 0
    }, 500)
  }
}

let isCreateTaskModalOpen = $ref(false)

async function onTaskCreated() {
  isCreateTaskModalOpen = false
  tasks = await getTasksByCommunityUuid(uuid)
  console.log('tasks loaded:', tasks)
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

    tasks = await getTasksByCommunityUuid(uuid)
    console.log('tasks loaded:', tasks)
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Loading data error.', error as Error)
  } finally {
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
</script>
<template>
  <UDashboardLayout :ui="{ wrapper: 'w-full static' }">
    <CommunitySidebar
      :community="community"
      :address="address"
    />
    <div class="w-full h-screen">
      <div v-if="currentRightPage === communityRightPages['#quests']" class="bg-grid">
        <!-- header buttons -->
        <div class="w-full relative flex justify-between items-center px-4 py-3 z-10 bg-white drop-shadow-sm">
          <UTabs
            v-model="selectedTaskVisibleType"
            :items="taskVisibleTabs"
            :ui="{ wrapper: 'space-y-0' }"
            @change="onTaskVisibleTypeChange"
          />
          <UDropdown
            v-if="community && isAdminOrOwner"
            :items="taskTypes"
            :popper="{ placement: 'bottom-end' }"
            :ui="{ wrapper: 'h-8' }"
          >
            <UButton
              color="white"
              :label="$t('Start a Public Quest')"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            />
          </UDropdown>
        </div>

        <!-- tasks list -->
        <div class="relative flex flex-col px-3 pt-6 pb-10 items-center h-[calc(100vh-var(--header-height))] overflow-y-auto scroll-gutter">
          <!-- No tasks -->
          <div
            v-if="!tasks.length && !isLoading"
            class="h-[calc(100vh-var(--header-height)-40px)] w-2/3 flex justify-center items-center"
          >
            <UCard>
              <div
                class="flex-center text-center whitespace-pre-line"
              >
                <div class="text-xl">
                  {{
                    isAdminOrOwner
                      ? $t('No quest.')
                      : 'Nothing here, \nquests will coming soon.'
                  }}
                </div>
              </div>
              <div
                v-if="community && isAdminOrOwner"
                class="flex-center mt-10"
              >
                <UDropdown
                  :items="taskTypes"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    color="white"
                    :label="$t('Start a Public Quest')"
                    trailing-icon="i-heroicons-chevron-down-20-solid"
                  />
                </UDropdown>
              </div>
            </UCard>
          </div>

          <div
            v-if="isLoading"
            class="absolute top-0 right-0 w-full h-full flex justify-center items-center"
          >
            <UIcon
              name="svg-spinners:blocks-scale"
              dynamic
              class="w-16 h-16 opacity-50"
            />
          </div>

          <div v-if="tasks.length" class="mx-auto w-full">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-4 xl:gap-10"
            >
              <UBlogPost
                v-for="task in tasks"
                :key="task.processID"
                :image="arUrl(task.banner)"
                :description="task.intro"
                class="relative"
                :to="`/quest/${task.processID}`"
                :ui="{
                  wrapper:
                    'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
                  container: 'group-hover:bg-dot py-4',
                  inner: 'flex-1 px-4 overflow-hidden',
                  image: {
                    wrapper: 'ring-0 rounded-none aspect-[800/501]',
                    base: 'ease-in-out',
                  },
                }"
              >
                <template #title>
                  <div class="text-left mb-1">
                    {{ task.name }}
                  </div>
                  <TaskStatus :task="task" :address="address" />
                </template>

                <template #description>
                  <div class="flex flex-col space-y-2">
                    <div class="flex justify-between text-sm">
                      <div>
                        <div>{{ $t('builders now') }}</div>
                      </div>
                      <div>
                        <div>
                          {{ task.submittersCount }}
                        </div>
                      </div>
                    </div>

                    <div class="flex justify-between text-sm gap-x-2">
                      <div>
                        <div>{{ $t('Bounty') }}</div>
                      </div>
                      <div class="text-right" v-html="calcRewardHtml(task.bounties).join('<br>+')" />
                    </div>
                  </div>
                </template>
              </UBlogPost>
            </div>
          </div>
        </div>
      </div>

      <Chatroom
        v-if="community && currentRightPage === communityRightPages['#chatroom']"
        :community="community"
        :address="address"
      />
    </div>

    <UModal v-model="isCreateTaskModalOpen">
      <UCard :ui="{ base: 'sm:min-w-[36rem] sm:max-w-full' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{ $t(`task.start.${createTaskType}`) }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isCreateTaskModalOpen = false"
            />
          </div>
        </template>
        <TaskForm
          v-if="community"
          :community="community"
          :task-type="createTaskType"
          @created="onTaskCreated"
        />
      </UCard>
    </UModal>
  </UDashboardLayout>
</template>
