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
const taskTypes = [
  [
    {
      label: 'Twitter Space Quest',
      click: () => {
        isCreateTaskModalOpen = true
      },
    },
    {
      label: 'Promotion Quest',
      click: alertNotReady,
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
      click: alertNotReady,
    },
    {
      label: 'Twitter Article Quest',
      click: alertNotReady,
    },
  ]
]

const taskVisibleTabs = [
  {
    label: t('Public Quests'),
    content: '',
  },
  {
    label: t('Private Quests'),
    content: '',
  },
]

function onTaskVisibleTabChange(index: number) {
  const item = taskVisibleTabs[index]
  if (item.label === 'Private Quests') {
    showMessage('Being Cooked!')
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
    <UDashboardPage>
      <UPage v-if="currentRightPage === communityRightPages['#quests']" class="bg-grid overflow-y-auto h-full w-full">
        <div class="relative flex flex-col mx-10 pt-10 items-center h-screen">
          <div class="flex w-full justify-between items-center mb-6">
            <UTabs
              :items="taskVisibleTabs"
              :ui="{ wrapper: 'space-y-0' }"
              @change="onTaskVisibleTabChange"
            />
            <UDropdown
              v-if="community && isAdminOrOwner"
              :items="taskTypes"
              :popper="{ placement: 'bottom-start' }"
              :ui="{ wrapper: 'h-8' }"
            >
              <UButton
                color="white"
                :label="$t('Start a Public Quest')"
                trailing-icon="i-heroicons-chevron-down-20-solid"
              />
            </UDropdown>
          </div>

          <div
            v-if="!tasks.length && !isLoading"
            class="absolute h-[calc(100vh-var(--header-height)-40px)] w-2/3 flex justify-center items-center"
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
            class="absolute top-[calc(var(--header-height)+40px)] right-0 w-full h-[calc(100%-var(--header-height)-40px)] flex justify-center items-center"
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
                    wrapper: 'ring-0 rounded-none',
                    base: 'ease-in-out object-fill',
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
                <!-- <UButton
                  :to="`/quest/${task.processID}`"
                  class="absolute bottom-2 right-2 mt-2 ring-gray-200 hover:ring-gray-400"
                  color="white"
                  variant="outline"
                >
                  {{ $t('View Details') }}
                </UButton> -->
              </UBlogPost>
            </div>
          </div>
        </div>

        <UModal v-model="isCreateTaskModalOpen">
          <UCard :ui="{ base: 'sm:min-w-[36rem] sm:max-w-full' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  {{ $t('Start a Public Quest') }}
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
              @created="onTaskCreated"
            />
          </UCard>
        </UModal>
      </UPage>

      <Chatroom
        v-if="community && currentRightPage === communityRightPages['#chatroom']"
        :community="community"
        :address="address"
      />
    </UDashboardPage>
  </UDashboardLayout>
</template>
