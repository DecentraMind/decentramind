<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { timezones, tokens, tokenChains, communityRightPages, type PageSymbol } from '~/utils/constants'
import type { Community, Task, TaskForm } from '~/types/index'
import { arUrl, taskBanners, gateways } from '~/utils/arAssets'
import { getLocalTimezone, taskSchema } from '~/utils'
import { provide } from 'vue'
import Chatroom from '~/components/community/Chatroom.vue'
import CommunitySidebar from '~/components/community/CommunitySidebar.vue'
import TaskStatus from '~/components/task/TaskStatus.vue'

const { t } = useI18n()
const { createTask, getTasksByCommunityUuid } = $(taskStore())
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
      label: 'Thread Quest',
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

type RangeValue = [Dayjs, Dayjs]
const taskDateRange = $ref<RangeValue>()

function handleDateChange(
  value: [string, string] | [Dayjs, Dayjs],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: [string, string],
) {
  taskForm.startTime = new Date(value[0].toString()).getTime()
  taskForm.endTime = new Date(value[1].toString()).getTime()
}

const taskForm = $ref<TaskForm>({
  processID: '',
  type: 'space',
  visible: 'public',
  banner: taskBanners[0],
  name: '',
  intro: '',
  rule: t('taskRule'),
  bounties: [
    {
      tokenName: '',
      amount: '' as unknown as number,
      tokenProcessID: '',
      chain: '',
    },
    {
      tokenName: '',
      amount: '' as unknown as number,
      tokenProcessID: '',
      chain: '',
    },
  ],
  totalChances: 0,
  timezone: getLocalTimezone(),
  startTime: undefined as unknown as number,
  endTime: undefined as unknown as number,
  communityUuid: '',
})

let isPostingTask = $ref(false)
async function onSubmitTaskForm() {
  isPostingTask = true

  try {
    if (!address) {
      throw new Error('Please connect wallet first.')
    }
    console.log({ taskForm })

    await createTask(taskForm)
    isCreateTaskModalOpen = false
  } catch (e) {
    const message = e instanceof Error ? e.message : e

    if (e instanceof Error) {
      const message = e instanceof Error ? e.message : e

      if (message.includes('Insufficient Balance')) {
        showError('Balance Error!')
        isPostingTask = false
        return
      }
    }

    // TODO show progress of task creation
    // TODO return bounty if creation failed in the middle

    showError('Failed to create task. ' + message || '')
    console.error('create task error', e)
    isPostingTask = false
  }

  tasks = await getTasksByCommunityUuid(uuid)
  isPostingTask = false
}

console.log('get community info of ', uuid)
let community = $ref<Community>()

const isCommunityOwner = $computed(() => community && address ? community.owner === address : false)

const taskBannersUrl = taskBanners.map(banner => arUrl(banner))
const currentBannerIndex = $ref(0)
const updateBanner = (index: number) => {
  if (taskBanners[index - 1]) {
    taskForm.banner = taskBanners[index - 1]
  }
}

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

    taskForm.communityUuid = community.uuid

    if (community.communitychatid) {
      await inboxAdd(community.name, community.communitychatid)
    }

    tasks = await getTasksByCommunityUuid(uuid)
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

let currentRightPage = $ref<PageSymbol>(communityRightPages['#quests'])
watch(() => route.hash, newHash => {
  const page = Object.keys(communityRightPages).includes(newHash) ? newHash : '#quests'
  currentRightPage = communityRightPages[page as keyof typeof communityRightPages] || communityRightPages['#quests']
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
              v-if="community && isCommunityOwner"
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
            <Card highlight orientation="vertical">
              <div
                class="flex justify-center items-center text-center whitespace-pre-line"
              >
                <div class="text-xl">
                  {{
                    isCommunityOwner
                      ? $t('No quest.')
                      : 'Nothing here, \nquests will coming soon.'
                  }}
                </div>
              </div>
              <div class="flex mt-10 justify-center items-center">
                <div
                  v-if="community && isCommunityOwner"
                  class="flex justify-center items-center"
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
              </div>
            </Card>
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
                    <!-- <div class="h-6 overflow-hidden">
                      {{ task.intro }}
                    </div> -->
                    <div class="flex justify-between text-sm gap-x-2">
                      <div>
                        <div>{{ $t('Bounty') }}</div>
                      </div>
                      <div class="text-right" v-html="calcRewardHtml(task.bounties).join('<br> + ')" />
                    </div>
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
                  </div>
                </template>
                <UButton
                  :to="`/quest/${task.processID}`"
                  class="relative right-0 mt-2"
                  color="white"
                  variant="outline"
                >
                  {{ $t('View Details') }}
                </UButton>
              </UBlogPost>
            </div>
          </div>
        </div>

        <UModal v-model="isCreateTaskModalOpen">
          <UCard>
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
            <UForm
              :state="taskForm"
              :schema="taskSchema"
              class="space-y-6 flex flex-col justify-center"
              :validate="validateTaskForm"
              @submit="onSubmitTaskForm"
            >
              <UFormGroup name="banner" :label="$t('Banner')">
                <template #label>
                  <div class="w-[300px]">
                    {{ $t('Banner') }}
                  </div>
                </template>
                <UCarousel
                  v-model="currentBannerIndex"
                  :items="taskBannersUrl"
                  :ui="{
                    item: 'basis-full min-h-36',
                    container: 'rounded-lg',
                    indicators: {
                      wrapper: 'relative bottom-0 mt-4',
                    },
                  }"
                  indicators
                  class="w-64 mx-auto"
                >
                  <template #default="{ item }">
                    <img :src="item" class="w-full" draggable="false">
                  </template>

                  <template #indicator="{ onClick, page, active }">
                    <UButton
                      :label="String(page)"
                      :variant="active ? 'solid' : 'outline'"
                      size="2xs"
                      class="rounded-full min-w-6 justify-center"
                      @click="
                        () => {
                          currentBannerIndex = page // 更新当前索引
                          updateBanner(page)
                          onClick(page) // 触发页面点击事件
                        }
                      "
                    />
                  </template>
                </UCarousel>
              </UFormGroup>

              <UFormGroup name="name" :label="$t('Name of Quest')">
                <UInput v-model.trim="taskForm.name" placeholder="name" />
              </UFormGroup>

              <UFormGroup name="intro" :label="$t('Task Introduction')">
                <UTextarea v-model.trim="taskForm.intro" />
              </UFormGroup>

              <UFormGroup name="rule" :label="$t('Rules of the Quest')">
                <UTextarea
                  v-model.trim="taskForm.rule"
                  disabled
                  :placeholder="$t('taskRule')"
                />
              </UFormGroup>

              <div>
                <UFormGroup
                  v-for="(formGroup, index) in taskForm.bounties"
                  :key="index"
                  v-model="taskForm.bounties[index]"
                  :name="`bounties[${index}]`"
                  :label="index === 0 ? $t('Bounty') : ''"
                  :ui="{ error: 'hidden' }"
                >
                  <div class="flex justify-between items-center gap-x-1 mb-1">
                    <UInput
                      v-model.number="formGroup.amount"
                      :name="`bounties[${index}].amount`"
                      type="number"
                      placeholder="Amount"
                      :model-modifiers="{ number: true }"
                      :ui="{ base: 'w-24' }"
                    />

                    <USelectMenu
                      v-model="formGroup.tokenName"
                      :name="`bounties[${index}].tokenProcessID`"
                      placeholder="Token"
                      :options="tokenNames"
                      :ui="{ wrapper: 'w-full' }"
                      @change="
                        (name:string) => {
                          formGroup.tokenProcessID = tokens[name].processID
                          formGroup.chain = tokenChains[0]
                        }
                      "
                    >
                      <template #option="{ option: name }">
                        <img
                          :src="
                            arUrl(
                              tokens[name].logo || defaultTokenLogo,
                              gateways.ario,
                            )
                          "
                          :alt="`logo of ${tokens[name].label}`"
                          class="w-8 h-8 rounded-full border border-gray-200"
                        >
                        <span class="truncate">{{ tokens[name].label }}</span>
                      </template>
                    </USelectMenu>

                    <USelectMenu
                      v-model="formGroup.chain"
                      :name="`bounties[${index}].chain`"
                      placeholder="Chain"
                      :options="tokenChains"
                      :ui="{ wrapper: 'w-full' }"
                    />
                  </div>
                </UFormGroup>
              </div>

              <UFormGroup name="totalChances" :label="$t('Total Chances')">
                <UInput
                  v-model.number="taskForm.totalChances"
                  type="number"
                  :placeholder="$t('Total Chances')"
                />
              </UFormGroup>

              <UFormGroup name="time" :label="$t('Time')">
                <div class="flex justify-between items-center gap-x-1">
                  <USelect
                    v-model="taskForm.timezone"
                    :placeholder="$t('Time Zone')"
                    :options="timezones"
                    :ui="{
                      variant: {
                        outline:
                          'ring-gray-300 dark:ring-primary-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
                      },
                    }"
                  />
                  <a-range-picker
                    v-model:value="taskDateRange"
                    show-time
                    @change="handleDateChange"
                  />
                </div>
              </UFormGroup>

              <UButton
                color="primary"
                type="submit"
                :loading="isPostingTask"
                :disabled="isPostingTask"
                class="self-center !mt-8"
              >
                {{ $t('Post the Quest') }}
              </UButton>
            </UForm>
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
