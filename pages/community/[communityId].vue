<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { tokenOptions, timeZoneOptions, tokens, type TokenName } from '~/utils/constants'
import type { Community, Task } from '~/types'
import { arUrl, taskBanners, getTaskBannerUrl } from '~/utils/arAssets'
import { createUuid } from '~/utils/util'
import { taskSchema } from '~/utils/schemas'

const { t } = useI18n()
const { createTask, getAllTasks, getAllTaskSubmitInfo } = $(taskStore())
const { setCurrentUuid, exitCommunity, getCommunity, getCommunityList } = $(aoCommunityStore())

const { add: inboxAdd } = $(inboxStore())
const { address } = $(aoStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId) as string

const isSettingModalOpen = $ref(false)

let tasks = $ref<Array<Task & {reward: string}>>([])

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

const chainOptions = [
  { label: 'AO', value: 'AO' }
]

type RangeValue = [Dayjs, Dayjs];
let selectStartTime = $ref<string>()
let selectEndTime = $ref<string>()
const value2 = $ref<RangeValue>()

function handleDateChange(value: string[]) {
  selectStartTime = value[0]
  selectEndTime = value[1]
  // const currentDate = new Date()
  // if(currentDate <= endTime && currentDate >= startTime){
  //     isBegin = 'Y'
  // }else if(currentDate > endTime){
  //     isBegin = 'N'
  // }
  // value 是选择的日期 moment 对象
  console.log('Selected Date:', value)
}
const taskForm = $ref({
  taskLogo: 'banner1',
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: {label: '', value: ''},
  tokenChain: undefined,
  tokenNumber1: undefined,
  tokenType1: {label: '', value: ''},
  tokenChain1: undefined,
  rewardTotal: undefined,
  zone: undefined,
})

const taskData = {
  taskId: '',
  taskLogo: undefined,
  taskName: undefined,
  taskInfo: undefined,
  taskRule: '',
  tokenNumber: 0,
  tokenType: undefined,
  tokenChain: undefined,
  tokenNumber1: 0,
  tokenType1: undefined,
  tokenChain1: undefined,
  rewardTotal: undefined,
  zone: undefined,
  startTime: '',
  endTime: '',
  createTime: 0,
  buildNumber: 0,
  joined: 0,
  ownerId: '',
  communityId: '',
  isBegin: '',
  isCal: 'N',
  isSettle: 'N',
  processId: 'N'
}
const form = $ref()

const { showError } = $(notificationStore())

let isPostingTask = $ref(false)
async function onSubmitTaskForm() {
  isPostingTask = true
  if (!taskForm.taskLogo || !taskForm.taskName || !taskForm.taskInfo || !taskForm.tokenNumber || !taskForm.tokenType || !taskForm.tokenChain || !taskForm.rewardTotal || !taskForm.zone || !selectStartTime || !selectEndTime) {
    isPostingTask = false
    // isOpen = false
    alert('Please complete the quest information.')
    return
  }

  const token = tokens[taskForm.tokenType.value as TokenName]
  if (!token) {
    showError('Bounty 1 token is not valid.')
    return
  }

  let token1
  if (taskForm.tokenType1.value) {
    token1 = tokens[taskForm.tokenType1.value as TokenName]
    if(!token1) {
      showError('Bounty 2 token is not valid.')
      return
    }
  }

  console.log({transData: taskData, state: taskForm})

  // Do something with state
  taskData.taskId = createUuid()
  taskData.taskLogo = taskForm.taskLogo
  taskData.taskName = taskForm.taskName
  taskData.taskInfo = taskForm.taskInfo
  taskData.taskRule = t('taskRule')
  taskData.tokenNumber = (taskForm.tokenNumber && taskForm.tokenType.value) ? Number(taskForm.tokenNumber) * Math.pow(10, token.denomination) : 0
  taskData.tokenType = taskForm.tokenType.value ? taskForm.tokenType.value : 'none'
  taskData.tokenChain = taskForm.tokenChain ? taskForm.tokenChain : 'none'
  taskData.tokenNumber1 = (taskForm.tokenNumber1 && taskForm.tokenType1.value) ? Number(taskForm.tokenNumber1) * Math.pow(10, token1.denomination) : 0
  taskData.tokenType1 = taskForm.tokenType1.value ? taskForm.tokenType1.value : 'none'
  taskData.tokenChain1 = taskForm.tokenChain1 ? taskForm.tokenChain1 : 'none'
  taskData.rewardTotal = taskForm.rewardTotal
  taskData.zone = taskForm.zone
  taskData.startTime = selectStartTime
  taskData.endTime = selectEndTime
  taskData.createTime = Date.now()
  taskData.ownerId = address
  // 根据时间判断 进行中/未开始/已结束
  const currentDate = new Date()
  if (selectEndTime <= currentDate) {
    isPostingTask = false
    showError('Quest end time cannot be earlier than current time.')
    return
  }
  if (selectStartTime <= currentDate) {
    isPostingTask = false
    showError('Quest start time cannot be earlier than current time.')
    return
  }
  if (selectStartTime >= selectEndTime) {
    isPostingTask = false
    showError('Quest end time cannot be earlier than start time.')
    return
  }
  let isBegin = 'NS'
  if (currentDate <= selectEndTime && currentDate >= selectStartTime) {
    isBegin = 'Y'
  } else if (currentDate > selectEndTime) {
    isBegin = 'N'
  }
  taskData.isBegin = isBegin
  taskData.communityId = communityId

  try{
    await createTask(taskData)
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

  tasks = await getAllTasks(String(communityId))
  isPostingTask = false
}

let allTaskSubmitInfo = $ref<Awaited<ReturnType<typeof getAllTaskSubmitInfo>>>([])
async function checkSubmit(allTaskSubmitInfo: Awaited<ReturnType<typeof getAllTaskSubmitInfo>>, taskID: string, address: string) {
  for (const submitInfo of allTaskSubmitInfo) {
    if (submitInfo.address === address) {
      console.log('found address submitted to task', submitInfo.id)
      return true
    }
  }
  return false
}

async function countSubmitOfTask(allTaskSubmitInfo: Awaited<ReturnType<typeof getAllTaskSubmitInfo>>, taskID: string) {
  return allTaskSubmitInfo.filter(submit => submit.taskId === taskID).length
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
  } catch (error) {
    console.error('Error fetching data:', error)
    return
  }
  if(!community) {
    showError('Failed to load community info. Please try again later.')
    return
  }
  console.log('get communityInfo', community.name, community, communityId)

  if(community.communitychatid) {
    await inboxAdd(community.name, community.communitychatid)
  }

  tasks = await getAllTasks(communityId)
  if(!tasks) {
    showError('Failed to load tasks of community. Please try again later.')
    console.error('allTasks undefined', communityId)
  }

  if (community.creater === address) {
    isCommunityOwner = true
  }

  if (!allTaskSubmitInfo) {
    allTaskSubmitInfo = await getAllTaskSubmitInfo()
  }

  for (const t of tasks) {
    t.status = await checkSubmit(allTaskSubmitInfo, t.taskId, address) ? 'Y' : 'N'
    t.buildNumber = await countSubmitOfTask(allTaskSubmitInfo, t.taskId)
  }

  isLoading = false
})

const taskBannersUrl = taskBanners.map(banner => arUrl(banner))
const currentIndex = $ref(0) // 用于存储当前选中的索引
const updateBanner = (index: number) => {
  if (taskBanners[index - 1]) {
    taskForm.taskLogo = taskBanners[index - 1]
  }
}

const alertNotReady = () => {
  alert('Being Cooked')
}
const taskTypes = [
  [{
    label: 'Twitter Space Quest',
    click: () => {
      isCreateTaskModalOpen = true
    }
  }], [{
    label: 'Promotion Quest',
    click: alertNotReady
  }], [{
    label: 'Invitation Quest',
    click: alertNotReady
  }], [{
    label: 'Try Our Product Quest',
    click: alertNotReady
  }], [{
    label: 'Thread Quest',
    click: alertNotReady
  }], [{
    label: 'Twitter Article Quest',
    click: alertNotReady
  }]
]

const exitButton = $ref(false)
const router = useRouter()

let leaveOut = $ref(false)
const quitCommunity = async (communityUuid: string) => {
  leaveOut = true
  try {
    await exitCommunity(communityUuid)
    await getCommunityList()
    console.log('exitCommunity 操作成功')
    leaveOut = false
    router.push('/discovery')
  } catch (error) {
    alert('Exit community failed.')
  } finally {
    leaveOut = false
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

const finalStatus = (isBegin: string) => {
  // console.log('isB = ' + isBegin)
  let res = ''
  if (isBegin === 'NS')
    res = t('Not Start')
  else if (isBegin === 'Y') {
    res = t('Ing')
  } else {
    res = t('End')
  }
  // console.log('res = ' + res)
  return res
}

const formattedTwitterLink = (twitter: string) => {
  // Add https:// prefix if the link doesn't start with http:// or https://
  if (!/^(http|https):\/\//.test(twitter)) {
    return `https://${twitter}`
  }
  return twitter
}

const shortedWebsite = $computed(() => {
  return community?.website.replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
})
</script>
<template>
  <UDashboardLayout :ui="{wrapper: 'w-full static'}">
    <UDashboardPanel :width="420" :resizable="{ min: 0, max: 420 }" collapsible>
      <UDashboardSidebar v-if="community">
        <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
        <div class="pt-6">
          <div class="flex justify-between my-3 items-center">
            <div class="text-3xl">{{ community.name }}</div>
            <div>
              <UButton color="white" variant="solid" :to="`/community/detail/${communityId}`">
                {{ $t('View Details') }}
              </UButton>
            </div>
          </div>

          <UDivider />

          <div v-if="community.website" class="flex justify-between my-3 mt-5 items-center">
            <div>{{ $t('WebsiteOfCommunityDetail') }}</div>

            <UButton variant="link" class="text-right border rounded-lg max-w-[60%] overflow-hidden pl-2 pr-2 text-nowrap" :title="community.website" style="direction: rtl;">
              <a :href="community.website" _target="_blank">{{ shortedWebsite }}</a>
            </UButton>
          </div>

          <div v-if="community.twitter" class="flex justify-between my-3 items-center">
            <div>{{ $t('SocialOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(community.twitter)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton variant="link">
                  <UIcon name="ri:twitter-fill" class="h-full w-full " />
                  Twitter
                </UButton>
              </ULink>
            </div>
          </div>

          <div v-if="community.github" class="flex justify-between my-3 items-center">
            <div>{{ $t('GithubOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(community.github)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton variant="link">
                  <UIcon name="ri:github-line" class="h-full w-full " />
                  Github
                </UButton>
              </ULink>
            </div>
          </div>

          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('TokenOfCommunityDetail') }}</div>
            <div v-if="community.communitytoken && community.communitytoken.length > 0" class="flex space-x-3">
              <div
                v-for="(token, index) in community.communitytoken.slice(0,2)"
                :key="index"
                class="flex justify-center border rounded-lg w-full pl-2 pr-2"
              >
                {{ token.tokenName }}
              </div>
            </div>
          </div>

          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('Trading Support') }}</div>
            <div v-if="community.support && community.support.length > 0" class="flex space-x-3">
              <div
                v-for="(token, index) in community.support.slice(0,2)"
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
          <UButton size="lg" variant="ghost" icon="heroicons:cog-6-tooth" @click="isSettingModalOpen = true" />
        </div>
        <UPopover mode="hover" :popper="{ placement: 'top' }" class="z-[60]">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button class="center-text border rounded-lg w-full h-8">Invite People</Button>
          <template #panel>
            <div class="p-4 w-96">
              <div>Invite URL: </div>
              <div class="flex items-center">
                <p ref="textToCopy" class="break-all mr-2">
                  https://decentramind.club/invite/{{ communityId }}&{{ address }}
                </p>
                <UButton icon="carbon:align-box-bottom-right" variant="ghost" @click="copyText" />
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
            <UTabs :items="tabItems" :ui="{wrapper: 'space-y-0'}" @change="onChange" />
            <UDropdown v-if="community && community.creater == address" :items="taskTypes" :popper="{ placement: 'bottom-start' }" :ui="{wrapper: 'h-8'}">
              <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
            </UDropdown>
          </div>

          <div v-if="!tasks.length && !isLoading" class="absolute h-[calc(100vh-var(--header-height)-40px)] w-2/3 flex justify-center items-center">
            <Card highlight orientation="vertical">
              <div class="flex justify-center items-center text-center whitespace-pre-line">
                <div class="text-xl">
                  {{ isCommunityOwner ? $t('Nothing here,\nclick to start your first public quest.') : 'Nothing here, \nthe quests will coming soon.' }}
                </div>
              </div>
              <div class="flex mt-10 justify-center items-center">
                <div v-if="community && community.creater == address" class="flex justify-center items-center">
                  <UDropdown :items="taskTypes" :popper="{ placement: 'bottom-start' }">
                    <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
                  </UDropdown>
                </div>
              </div>
            </Card>
          </div>

          <div v-if="isLoading" class="absolute top-[calc(var(--header-height)+40px)] right-0 w-full h-[calc(100%-var(--header-height)-40px)] flex justify-center items-center">
            <UIcon name="svg-spinners:blocks-scale" dynamic class="w-16 h-16 opacity-50" />
          </div>

          <div v-if="tasks.length" class="mx-auto w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-10">
              <UBlogPost
                v-for="task in tasks"
                :key="task.taskId"
                :image="getTaskBannerUrl(task.taskLogo)"
                :description="task.taskInfo"
                class="relative"
                :to="`/quest/${task.taskId}`"
                :ui="{
                  wrapper: 'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
                  container: 'group-hover:bg-dot py-4',
                  inner: 'flex-1 px-4 overflow-hidden',
                  image: {
                    wrapper: 'ring-0 rounded-none',
                    base: 'ease-in-out'
                  }
                }"
              >
                <template #title>
                  <div class="flex justify-between">
                    <div>{{ task.taskName }}</div>
                  </div>
                  <div class="flex">
                    <div class="mr-2">
                      <UBadge size="xs" color="black" variant="solid">
                        {{ finalStatus(task.isBegin) }}
                      </UBadge>
                    </div>
                    <div v-if="task.status === 'Y'" class="mr-2">
                      <UBadge color="black" variant="solid">
                        {{ t('task.isjoin') }}
                      </UBadge>
                    </div>
                    <div v-if="task.ownerId === address && task.isSettle === 'N' && task.isBegin === 'N'">
                      <UBadge size="xs" color="black" variant="solid">
                        {{ $t('Unsettled') }}
                      </UBadge>
                    </div>
                  </div>
                </template>

                <template #description>
                  <div class="flex flex-col space-y-2">
                    <div class="h-6 overflow-hidden">
                      {{ task.taskInfo }}
                    </div>
                    <div class="flex justify-between">
                      <div>
                        <div>
                          {{ $t("Bounty") }}:
                        </div>
                      </div>
                      <div>
                        <div>
                          {{ task.reward }}
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-between">
                      <div>
                        <div>
                          {{ $t("builders now") }}:
                        </div>
                      </div>
                      <div>
                        <div>
                          {{ task.buildNumber }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <UButton :to="`/quest/${task.taskId}`" class="relative right-0 mt-2" color="white" variant="outline">
                  {{ $t("View Details") }}
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
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ $t("Start a Public Quest") }}
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreateTaskModalOpen = false" />
            </div>
          </template>
          <UForm ref="form" :schema="taskSchema" :state="taskForm" class="space-y-4 ml-10" @submit="onSubmitTaskForm">
            <UFormGroup name="taskLogo" :label="$t('Banner')">
              <template #label>
                <div class="w-[300px]">
                  {{ $t('Banner') }}
                </div>
              </template>
              <UCarousel
                v-model="currentIndex"
                :items="taskBannersUrl"
                :ui="{
                  item: 'basis-full min-h-36',
                  container: 'rounded-lg',
                  indicators: {
                    wrapper: 'relative bottom-0 mt-4'
                  }
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
                    @click="() => {
                      currentIndex = page; // 更新当前索引
                      updateBanner(page)
                      onClick(page); // 触发页面点击事件
                    }"
                  />
                </template>
              </UCarousel>
            </UFormGroup>

            <UFormGroup name="taskName" :label="$t('Name of Quest')">
              <UInput v-model="taskForm.taskName" placeholder="name" />
            </UFormGroup>

            <UFormGroup name="taskInfo" :label="$t('Task Introduction')">
              <UTextarea v-model="taskForm.taskInfo" />
            </UFormGroup>

            <UFormGroup name="taskRule" :label="$t('Rules of the Quest')">
              <UTextarea v-model="taskForm.taskRule" disabled :placeholder="$t('taskRule')" />
            </UFormGroup>

            <UFormGroup name="textarea" :label="$t('Bounty')">
              <div class="flex justify-between items-center gap-x-1 mb-1">
                <UInput v-model="taskForm.tokenNumber" type="number" placeholder="Amount" :model-modifiers="{number: true}" />

                <UInputMenu v-model="taskForm.tokenType" placeholder="Token" :options="tokenOptions" />

                <UInputMenu v-model="taskForm.tokenChain" placeholder="Chain" :options="chainOptions" />
              </div>
              <div class="flex justify-between items-center gap-x-1">
                <UInput v-model="taskForm.tokenNumber1" type="number" placeholder="Amount" :model-modifiers="{number: true}" />

                <UInputMenu v-model="taskForm.tokenType1" placeholder="Token" :options="tokenOptions" />

                <UInputMenu v-model="taskForm.tokenChain1" placeholder="Chain" :options="chainOptions" />
              </div>
            </UFormGroup>
            <UFormGroup name="rewardTotal" :label="$t('Total Chances')">
              <UInput v-model="taskForm.rewardTotal" type="number" :placeholder="$t('Total Chances')" />
            </UFormGroup>
            <UFormGroup name="textarea" :label="$t('Time')">
              <div class="flex justify-between items-center gap-x-1">
                <USelect v-model="taskForm.zone" :placeholder="$t('Time Zone')" :options="timeZoneOptions" />
                <a-range-picker v-model:value="value2" show-time @change="handleDateChange" />
              </div>
            </UFormGroup>
            <UButton color="white" type="submit" :loading="isPostingTask" :disabled="isPostingTask">
              {{ $t('Post the Quest') }}
            </UButton>
          </UForm>
        </UCard>
      </UModal>

      <UModal v-model="isSettingModalOpen">
        <UCard>
          <CommunityCreate :uuid="communityId" :init-state="community" @close-setting="isSettingModalOpen=false" />
        </UCard>
      </UModal>

      <UModal v-model="exitButton">
        <UCard class="min-w-[300px] flex justify-center">
          <div class="w-full flex justify-center text-2xl">
            Sure to exit
          </div>
          <div v-if="!leaveOut" class="w-full flex space-x-10 mt-6">
            <UButton @click="exitButton = false">
              No
            </UButton>
            <UButton @click="quitCommunity(communityId)">
              Yes
            </UButton>
          </div>
          <div v-else class="h-[80px] flex flex-col items-center justify-center">
            <div>Leave...</div>
            <UIcon name="svg-spinners:12-dots-scale-rotate" />
          </div>
        </UCard>
      </UModal>
    </UDashboardPage>
  </UDashboardLayout>
</template>
