<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { timezones, tokens, tokenChains } from '~/utils/constants'
import type { Community, Task, TaskForm } from '~/types'
import { arUrl, taskBanners, gateways } from '~/utils/arAssets'
import { getLocalTimezone } from '~/utils/util'
import { taskSchema } from '~/utils/schemas'

const { t } = useI18n()
const { createTask, getTasksByCommunityUuid } = $(taskStore())
const { setCurrentUuid, exitCommunity, getCommunity, getCommunityList } = $(
  aoCommunityStore(),
)
const { add: inboxAdd } = $(inboxStore())
const { address } = $(aoStore())

const route = useRoute()

const communityId = $computed(() => route.params.communityId) as string

const isSettingModalOpen = $ref(false)

let tasks = $ref<Array<Task & { reward: string }>>([])

const tabItems = [
  {
    label: t('Public Quests'),
    content: '',
  },
  {
    label: t('Private Quests'),
    content: '',
  },
]
let isCreateTaskModalOpen = $ref(false)

function onChange(index: number) {
  const item = tabItems[index]
  // console.log(item)
  if (item.label === 'Private Quests') {
    alert('Being Cooked!')
  }
}

type RangeValue = [Dayjs, Dayjs]

const value2 = $ref<RangeValue>()

function handleDateChange(
  value: [string, string] | [Dayjs, Dayjs],
  dateString: [string, string],
) {
  taskForm.startTime = new Date(value[0].toString()).getTime()
  taskForm.endTime = new Date(value[1].toString()).getTime()
  console.log(
    'Selected Date:',
    { dateString, value },
    taskForm.startTime,
    taskForm.endTime,
  )
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
const form = $ref()

const { showError } = $(notificationStore())

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

    showError('Failed to create task. ' + message || '')
    console.error('create task error', e)
    isPostingTask = false
  }

  tasks = await getTasksByCommunityUuid(communityId)
  isPostingTask = false
}

console.log('get community info of ', communityId)
let community = $ref<Community>()

let isCommunityOwner = $ref(false)

let isLoading = $ref(true)
onMounted(async () => {
  if (!address) {
    router.push('/')
  }
  setCurrentUuid(communityId)

  try {
    community = await getCommunity(communityId)
    if (!community) {
      throw new Error('Failed to load community info. Please try again later.')
    }
    console.log('get communityInfo', community.name, community, communityId)

    taskForm.communityUuid = community.uuid

    if (community.communitychatid) {
      await inboxAdd(community.name, community.communitychatid)
    }

    tasks = await getTasksByCommunityUuid(communityId)

    if (community.owner === address) {
      isCommunityOwner = true
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('', error as Error)
  } finally {
    isLoading = false
  }
})

async function reload() {
  isLoading = true
  community = await getCommunity(communityId)
  isLoading = false
}

const taskBannersUrl = taskBanners.map(banner => arUrl(banner))
const currentBannerIndex = $ref(0)
const updateBanner = (index: number) => {
  if (taskBanners[index - 1]) {
    taskForm.banner = taskBanners[index - 1]
  }
}

const alertNotReady = () => {
  alert('Being Cooked')
}
const taskTypes = [
  [
    {
      label: 'Twitter Space Quest',
      click: () => {
        isCreateTaskModalOpen = true
      },
    },
  ],
  [
    {
      label: 'Promotion Quest',
      click: alertNotReady,
    },
  ],
  [
    {
      label: 'Invitation Quest',
      click: alertNotReady,
    },
  ],
  [
    {
      label: 'Try Our Product Quest',
      click: alertNotReady,
    },
  ],
  [
    {
      label: 'Thread Quest',
      click: alertNotReady,
    },
  ],
  [
    {
      label: 'Twitter Article Quest',
      click: alertNotReady,
    },
  ],
]

const exitButton = $ref(false)
const router = useRouter()

let isExiting = $ref(false)
const quitCommunity = async (communityUuid: string) => {
  isExiting = true
  try {
    await exitCommunity(communityUuid)
    await getCommunityList()
    isExiting = false
    router.push('/discovery')
  } catch (error) {
    showError('Exit community failed.', error)
  } finally {
    isExiting = false
  }
}

const textToCopy = $ref<HTMLParagraphElement>()

const copyText = async () => {
  try {
    if (!textToCopy) return
    // 使用 navigator.clipboard.writeText 复制文本
    await navigator.clipboard.writeText(textToCopy.innerText)
    // 复制成功后设置一段时间后隐藏提示信息
  } catch (err) {
    console.error('复制失败: ', err)
  }
}

const formattedTwitterLink = (twitter: string) => {
  // Add https:// prefix if the link doesn't start with http:// or https://
  if (!/^(http|https):\/\//.test(twitter)) {
    return `https://${twitter}`
  }
  return twitter
}

const shortedWebsite = $computed(() => {
  return community?.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
})
</script>
<template>
  <UDashboardLayout :ui="{ wrapper: 'w-full static' }">
    <UDashboardPanel :width="420" :resizable="{ min: 0, max: 420 }" collapsible>
      <UDashboardSidebar v-if="community">
        <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
        <div class="pt-6">
          <div class="flex justify-between my-3 items-center">
            <div class="text-3xl">{{ community.name }}</div>
            <div>
              <UButton
                color="white"
                variant="solid"
                :to="`/community/detail/${communityId}`"
              >
                {{ $t('View Details') }}
              </UButton>
            </div>
          </div>

          <UDivider />

          <div
            v-if="community.website"
            class="flex justify-between my-3 mt-5 items-center"
          >
            <div>{{ $t('WebsiteOfCommunityDetail') }}</div>

            <UButton
              variant="link"
              class="text-right border rounded-lg max-w-[60%] overflow-hidden pl-2 pr-2 text-nowrap"
              :title="community.website"
              style="direction: rtl"
            >
              <a :href="community.website" _target="_blank">{{
                shortedWebsite
              }}</a>
            </UButton>
          </div>

          <div
            v-if="community.twitter"
            class="flex justify-between my-3 items-center"
          >
            <div>{{ $t('SocialOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(community.twitter)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton variant="link">
                  <UIcon name="ri:twitter-line" class="h-5 w-5" />
                  Twitter
                </UButton>
              </ULink>
            </div>
          </div>

          <div
            v-if="community.github"
            class="flex justify-between my-3 items-center"
          >
            <div>{{ $t('GithubOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(community.github)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton variant="link">
                  <UIcon name="ri:github-line" class="h-5 w-5" />
                  Github
                </UButton>
              </ULink>
            </div>
          </div>

          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('TokenOfCommunityDetail') }}</div>
            <div
              v-if="
                community.communitytoken && community.communitytoken.length > 0
              "
              class="flex space-x-3"
            >
              <div
                v-for="(token, index) in community.communitytoken.slice(0, 2)"
                :key="index"
                class="flex justify-center border rounded-lg w-full pl-2 pr-2"
              >
                {{ token.tokenName }}
              </div>
            </div>
          </div>

          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('Trading Support') }}</div>
            <div
              v-if="community.support && community.support.length > 0"
              class="flex space-x-3"
            >
              <div
                v-for="(token, index) in community.support.slice(0, 2)"
                :key="index"
                class="flex justify-center border rounded-lg w-full pl-2 pr-2"
              >
                {{ token }}
              </div>
            </div>
          </div>

          <div class="flex justify-between my-3 pr-3 items-center">
            <div>{{ $t('BuilderNumberOfCommunityDetail') }}</div>
            <div>{{ community.buildnum }}</div>
          </div>

          <div v-if="community.creater !== address" class="flex">
            <UButton
              color="white"
              variant="solid"
              class="ml-auto mt-10"
              @click="exitButton = true"
            >
              {{ $t('Quit') }}
              <UIcon name="bi:arrow-left-circle" />
            </UButton>
          </div>
        </div>

        <UDivider />

        <!--      <UDashboardSidebarLinks :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
        <!--        @update:links="(colors) => (defaultColors = colors)" />-->

        <div class="flex-1" />
        <div v-if="community.creater == address" class="text-right">
          <UButton
            size="lg"
            variant="ghost"
            icon="heroicons:cog-6-tooth"
            @click="isSettingModalOpen = true"
          />
        </div>
        <UPopover mode="hover" :popper="{ placement: 'top' }" class="z-[60]">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button class="center-text border rounded-lg w-full h-8">Invite People</Button>
          <template #panel>
            <div class="p-4 w-96">
              <div>Invite URL:</div>
              <div class="flex items-center">
                <p ref="textToCopy" class="break-all mr-2">
                  https://decentramind.club/invite/{{ communityId }}&{{
                    address
                  }}
                </p>
                <UButton
                  icon="carbon:align-box-bottom-right"
                  variant="ghost"
                  @click="copyText"
                />
              </div>
            </div>
          </template>
        </UPopover>
        <NuxtLink :to="`/community/${community.uuid}`">
          <Button class="center-text border rounded-lg bg-black text-white w-full h-8">Quests Home</Button>
        </NuxtLink>
        <NuxtLink :to="`/chat/${community.communitychatid}`">
          <Button class="center-text border rounded-lg w-full h-8">Chatroom</Button>
        </NuxtLink>
        <!--<UDashboardSidebarLinks :links="footerLinks" />-->

        <UDivider class="bottom-0 sticky" />
        <!--
        <template #footer>
          <UserDropdown />
        </template>
        -->
      </UDashboardSidebar>
    </UDashboardPanel>

    <UDashboardPage>
      <UPage class="bg-grid overflow-y-auto h-full w-full">
        <div class="relative flex flex-col mx-10 pt-10 items-center h-screen">
          <div class="flex w-full justify-between items-center mb-6">
            <UTabs
              :items="tabItems"
              :ui="{ wrapper: 'space-y-0' }"
              @change="onChange"
            />
            <UDropdown
              v-if="community && community.creater == address"
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
                      ? $t(
                        'Nothing here,\nclick to start your first public quest.',
                      )
                      : 'Nothing here, \nthe quests will coming soon.'
                  }}
                </div>
              </div>
              <div class="flex mt-10 justify-center items-center">
                <div
                  v-if="community && community.creater == address"
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
                    <div class="flex justify-between text-sm">
                      <div>
                        <div>{{ $t('Bounty') }}</div>
                      </div>
                      <div>
                        <div>
                          {{ task.reward }}
                        </div>
                      </div>
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
      </UPage>

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
            ref="form"
            :schema="taskSchema"
            :state="taskForm"
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
                  v-model:value="value2"
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

      <UModal
        v-model="isSettingModalOpen"
        :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }"
      >
        <CommunityCreate
          :is-setting-mode="true"
          :init-state="community"
          @created="reload()"
          @close-modal="isSettingModalOpen = false"
        />
      </UModal>

      <UModal v-model="exitButton">
        <UCard class="min-w-[300px] flex justify-center">
          <div class="w-full flex justify-center text-2xl">Sure to Exit?</div>
          <div v-if="!isExiting" class="w-full flex space-x-10 mt-6">
            <UButton @click="exitButton = false"> No </UButton>
            <UButton @click="quitCommunity(communityId)"> Yes </UButton>
          </div>
          <div
            v-else
            class="h-[80px] flex flex-col items-center justify-center"
          >
            <div>Leave...</div>
            <UIcon name="svg-spinners:12-dots-scale-rotate" />
          </div>
        </UCard>
      </UModal>
    </UDashboardPage>
  </UDashboardLayout>
</template>
