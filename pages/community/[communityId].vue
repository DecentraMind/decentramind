<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

import { z } from 'zod'
import type { Dayjs } from 'dayjs'
import { tokenOptions, timeZoneOptions } from '~/utils/constants'
import type { Task } from '~/types'

const { t } = useI18n()
const { denomination, createTask, getAllTasks, getAllTaskSubmitInfo } = $(taskStore())
const { getLocalCommunity, setCurrentUuid, exitCommunity, getCommunityList } = $(aoCommunityStore())

const { add: inboxAdd } = $(inboxStore())
const { address } = $(aoStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId) as string

const isSettingModalOpen = $ref(false)

let tasks = $ref<Array<Task & {reward: string}>>([])

let postQuestLoading = $ref(false)
const items = [
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
  const item = items[index]
  // console.log(item)
  if (item.label === 'Private Quests') {
    alert('Being Cooked!')
  }
}

const schema = z.object({
  taskName: z.string().min(2).max(10),
  taskInfo: z.string().min(3).max(30),
  rewardTotal: z.string()
    .min(1, { message: 'Must be more than 0' }) // This ensures the string is not empty
    .refine((value: string) => {
      const num = parseInt(value, 10)
      return !isNaN(num) && num > 0
    }, { message: 'Must be a valid number more than 0' })
    .refine((value: string) => {
      const regex = /^\d+$/
      return regex.test(value)
    }, { message: 'Must be a valid integer' })
  /*
  Allreward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

type Schema = z.infer<typeof schema>

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
const state = $ref({
  taskLogo: 'banner1',
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  tokenNumber1: undefined,
  tokenType1: undefined,
  tokenChain1: undefined,
  rewardTotal: undefined,
  zone: undefined,
})


const transData = {
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
function uuid() {
  const str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return str.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const { showError } = $(notificationStore())

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postQuestLoading = true
  if (!state.taskLogo || !state.taskName || !state.taskInfo || !state.tokenNumber || !state.tokenType || !state.tokenChain || !state.rewardTotal || !state.zone || !selectStartTime || !selectEndTime) {
    postQuestLoading = false
    // isOpen = false
    alert('Please complete the quest information.')
    return
  }
  // Do something with state
  transData.taskId = uuid()
  transData.taskLogo = state.taskLogo
  transData.taskName = state.taskName
  transData.taskInfo = state.taskInfo
  transData.taskRule = t('taskRule')
  transData.tokenNumber = state.tokenNumber ? Number(state.tokenNumber) * denomination[state.tokenType.value] : 0
  transData.tokenType = state.tokenType ? state.tokenType.value : 'none'
  transData.tokenChain = state.tokenChain ? state.tokenChain.value : 'none'
  transData.tokenNumber1 = state.tokenNumber1 ? Number(state.tokenNumber1) * denomination[state.tokenType1.value] : 0
  transData.tokenType1 = state.tokenType1 ? state.tokenType1.value : 'none'
  transData.tokenChain1 = state.tokenChain1 ? state.tokenChain1.value : 'none'
  transData.rewardTotal = state.rewardTotal
  transData.zone = state.zone
  transData.startTime = selectStartTime
  transData.endTime = selectEndTime
  transData.createTime = Date.now()
  transData.ownerId = address
  // 根据时间判断 进行中/未开始/已结束
  const currentDate = new Date()
  if (selectEndTime <= currentDate) {
    postQuestLoading = false
    alert('Quest end time cannot be earlier than current time.')
    return
  }
  if (selectStartTime <= currentDate) {
    postQuestLoading = false
    alert('Quest start time cannot be earlier than current time.')
    return
  }
  if (selectStartTime >= selectEndTime) {
    postQuestLoading = false
    alert('Quest end time cannot be earlier than start time.')
    return
  }
  let isBegin = 'NS'
  if (currentDate <= selectEndTime && currentDate >= selectStartTime) {
    isBegin = 'Y'
  } else if (currentDate > selectEndTime) {
    isBegin = 'N'
  }
  transData.isBegin = isBegin
  transData.communityId = String(communityId)

  try{
    await createTask(transData)
    isCreateTaskModalOpen = false
  } catch (e) {
    showError('Failed to create task.' + ((e as unknown as Error).message || ''))
    console.error('create task error', e)
  }

  tasks = await getAllTasks(String(communityId))
  postQuestLoading = false
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
let community = $ref<Awaited<ReturnType<typeof getLocalCommunity>>>()

let isCommunityOwner = $ref(false)

onMounted(async () => {
  setCurrentUuid(communityId)

  try {
    community = await getLocalCommunity(communityId)
    console.log('get communityInfo', community, communityId)
  } catch (error) {
    console.error('Error fetching data:', error)
    return
  }
  if(!community) return

  if(community.communitychatid) {
    await inboxAdd(community.name, community.communitychatid)
  }

  tasks = await getAllTasks(communityId)
  if(!tasks) {
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
})

const banners = [
  '/task/banner1.jpg',
  '/task/banner2.jpg',
  '/task/banner3.jpg',
  '/task/banner4.jpg',
  '/task/banner5.jpg'
]
const currentIndex = $ref(0) // 用于存储当前选中的索引
const updateBanner = (index: number) => {
  if (index === 1) {
    state.taskLogo = 'banner1'
  } else if (index === 2) {
    state.taskLogo = 'banner2'
  } else if (index === 3) {
    state.taskLogo = 'banner3'
  } else if (index === 4) {
    state.taskLogo = 'banner4'
  } else if (index === 5) {
    state.taskLogo = 'banner5'
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

const textToCopy = $ref('')

const copyText = async () => {
  try {
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

</script>
<template>
  <UDashboardLayout :ui="{wrapper: 'w-full static'}">
    <UDashboardPanel :width="420" :resizable="{ min: 0, max: 420 }" collapsible>
      <UDashboardSidebar v-if="community">
        <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
        <!--<div v-for="Info in communityInfo" :key="Info.uuid">-->
        <div class="pt-8">
          <div class="flex justify-between  my-3 items-center">
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
            <div>
              <div class="flex justify-center border rounded-lg w-full pl-2 pr-2">
                {{ community.website }}
              </div>
            </div>
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

          <div class="flex justify-between my-3 mt-10 items-center">
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
        <div v-if="community.creater == address" class="flex">
          <UButton class="ml-auto" variant="ghost" icon="quill:cog-alt" @click="isSettingModalOpen = true" />
        </div>
        <UPopover mode="hover" :popper="{ placement: 'top' }" class="z-[60]">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button class="center-text border rounded-lg w-full">Invite people</Button>
          <template #panel>
            <div class="p-4 ">
              <div>Invite URL: </div>
              <div class="flex items-center">
                <p ref="textToCopy">
                  decentramind.club/invite/{{ communityId }}&{{ address }}
                </p>
                <UButton icon="carbon:align-box-bottom-right" variant="ghost" @click="copyText" />
              </div>
            </div>
          </template>
        </UPopover>
        <NuxtLink :to="`/community/${community.uuid}`">
          <Button class="center-text border rounded-lg bg-black text-white w-full">Quests Home</Button>
        </NuxtLink>
        <NuxtLink :to="`/chat/${community.communitychatid}`">
          <Button class="center-text border rounded-lg w-full">Chatroom</Button>
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
      <UPage class="overflow-y-auto h-full w-full">
        <div v-if="community" class=" flex flex-col mx-10 pt-10 items-center h-full">
          <div class="flex w-full justify-between mb-4">
            <div>
              <UTabs :items="items" @change="onChange" />
            </div>
            <div class="flex">
              <div>
                <!-- <UButton color="white" label="teest" trailing-icon="i-heroicons-chevron-down-20-solid" @click="testAO"/> -->
                <UDropdown :items="taskTypes" v-if="community.creater == address" :popper="{ placement: 'bottom-start' }" >
                  <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
                </UDropdown>
              </div>
            </div>
          </div>
          <div v-if="!tasks.length" class="h-full w-full flex justify-center items-center">
            <div v-if="!tasks.length" class="w-2/3">
              <Card highlight orientation="vertical">
                <div class="flex justify-center items-center text-center whitespace-pre-line">
                  <div class="text-xl">
                    {{ isCommunityOwner ? $t('Nothing here,\nclick to start your first public quest.') : 'Nothing here, \nthe quests will coming soon.' }}
                  </div>
                </div>
                <div class="flex mt-10 justify-center items-center">
                  <div v-if="community.creater == address" class="flex justify-center items-center" >
                    <UDropdown :items="taskTypes" :popper="{ placement: 'bottom-start' }">
                      <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
                    </UDropdown>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div v-if="tasks.length" class="mx-auto w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-10">
              <UBlogPost
                v-for="task in tasks"
                :key="task.taskId"
                :image="`/task/${task.taskLogo}.jpg`"
                :description="task.taskInfo"
                class="relative"
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
          <UForm ref="form" :schema="schema" :state="state" class="space-y-4 ml-10" @submit="onSubmit">
            <UFormGroup name="taskLogo" :label="$t('Banner')">
              <template #label>
                <div class="w-[300px]">
                  {{ $t('Banner') }}
                </div>
              </template>
              <UCarousel
                v-model="currentIndex"
                :items="banners"
                :ui="{
                  item: 'basis-full',
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
              <UInput v-model="state.taskName" placeholder="name" />
            </UFormGroup>

            <UFormGroup name="taskInfo" :label="$t('Task Introduction')">
              <UTextarea v-model="state.taskInfo" />
            </UFormGroup>

            <UFormGroup name="taskRule" :label="$t('Rules of the Quest')">
              <UTextarea v-model="state.taskRule" disabled :placeholder="$t('taskRule')" />
            </UFormGroup>

            <UFormGroup name="textarea" :label="$t('Bounty')">
              <div class="flex justify-between items-center">
                <UInput v-model="state.tokenNumber" placeholder="Amount" />

                <UInputMenu v-model="state.tokenType" placeholder="Token" :options="tokenOptions" />

                <UInputMenu v-model="state.tokenChain" placeholder="Chain" :options="chainOptions" />
              </div>
              <div class="flex justify-between items-center">
                <UInput v-model="state.tokenNumber1" placeholder="Amount" />

                <UInputMenu v-model="state.tokenType1" placeholder="Token" :options="tokenOptions" />

                <UInputMenu v-model="state.tokenChain1" placeholder="Chain" :options="chainOptions" />
              </div>
            </UFormGroup>
            <UFormGroup name="rewardTotal" :label="$t('Total Chances')">
              <UInput v-model="state.rewardTotal" :placeholder="$t('Total Chances')" />
            </UFormGroup>
            <UFormGroup name="textarea" :label="$t('Time')">
              <div class="flex justify-between items-center">
                <USelect v-model="state.zone" :placeholder="$t('Time Zone')" :options="timeZoneOptions" />
                <a-range-picker v-model:value="value2" show-time @change="handleDateChange" />
              </div>
            </UFormGroup>
            <UButton color="white" type="submit" :disabled="postQuestLoading">
              {{ $t('Post the Quest') }}
            </UButton>
          </UForm>
        </UCard>
      </UModal>

      <UModal v-model="isSettingModalOpen" :ui="{ width: w-full }">
        <UCard>
          <CommunitySetting @close-setting="isSettingModalOpen=false" />
        </UCard>
      </UModal>

      <UModal v-model="exitButton" :ui="{ width: w-full }">
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
