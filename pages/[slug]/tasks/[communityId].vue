<script setup lang="ts">
import { sub, format, isSameDay, type Duration } from 'date-fns'
import type { FormSubmitEvent } from '#ui/types'
import {taskStore} from '../../../stores/taskStore';
import {aocommunityStore} from '../../../stores/aocommunityStore';

import { z } from 'zod'

const { t } = useI18n()
const { testTransfer, createTask, getAllTasks, respArray, joinTask } = $(taskStore())
const { getLocalcommunityInfo, setCurrentuuid } = $(aocommunityStore())
const { add } = $(inboxStore())
const { address } = $(aoStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId)

let communitySetting = $ref(false)
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
let isOpen = $ref(false)
function openModal() {
  isOpen = true
}
function onChange(index) {
  const item = items[index]

  alert(`${item.label} was clicked!This quest template is being prepared!`)
}

const schema = z.object({
  taskName: z.string().min(2).max(10),
  taskInfo: z.string().min(3).max(30),
  rewardTotal: z.string()
    .min(1, { message: 'Must be more than 0' }) // This ensures the string is not empty
    .refine((value: string) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0;
    }, { message: 'Must be a valid number more than 0' })
    .refine((value: string) => {
      const regex = /^\d+$/;
      return regex.test(value);
    }, { message: 'Must be a valid integer' })
  /*
  Allreward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

type Schema = z.infer<typeof schema>

const tokenOptions = [
  { label: 'FIZI', value: 'FIZI' },
  { label: 'LINUX', value: 'LINUX' },
  { label: 'AR', value: 'AR' },
  { label: 'AOCRED', value: 'AOCRED' },
  { label: 'Bark', value: 'Bark' },
  { label: 'TRUNK', value: 'TRUNK' },
  { label: 'AR.IO EXP', value: 'AR.IO EXP' },
  { label: '0rbit Points', value: '0rbit Points' },
  { label: 'Earth', value: 'Earth' },
  { label: 'Fire', value: 'Fire' },
  { label: 'Air', value: 'Air' },
  { label: 'Lava', value: 'Lava' }
]
const chainOptions = [
  { label: 'AO', value: 'AO' }
]
const timeZoneOptions = [
  { label: 'GMT-11:00', value: 'GMT-11:00' },
  { label: 'GMT-10:00', value: 'GMT-10:00' },
  { label: 'GMT-9:00', value: 'GMT-9:00' },
  { label: 'GMT-8:00', value: 'GMT-8:00' },
  { label: 'GMT-7:00', value: 'GMT-7:00' },
  { label: 'GMT-6:00', value: 'GMT-6:00' },
  { label: 'GMT-5:00', value: 'GMT-5:00' },
  { label: 'GMT-4:00', value: 'GMT-4:00' },
  { label: 'GMT-3:00', value: 'GMT-3:00' },
  { label: 'GMT-2:00', value: 'GMT-2:00' },
  { label: 'GMT-1:00', value: 'GMT-1:00' },
  { label: 'GMT+0:00', value: 'GMT+0:00' },
  { label: 'GMT+1:00', value: 'GMT+1:00' },
  { label: 'GMT+2:00', value: 'GMT+2:00' },
  { label: 'GMT+3:00', value: 'GMT+3:00' },
  { label: 'GMT+4:00', value: 'GMT+4:00' },
  { label: 'GMT+5:00', value: 'GMT+5:00' },
  { label: 'GMT+6:00', value: 'GMT+6:00' },
  { label: 'GMT+7:00', value: 'GMT+7:00' },
  { label: 'GMT+8:00', value: 'GMT+8:00' },
  { label: 'GMT+9:00', value: 'GMT+9:00' },
  { label: 'GMT+10:00', value: 'GMT+10:00' },
  { label: 'GMT+11:00', value: 'GMT+11:00' },
  { label: 'GMT+12:00', value: 'GMT+12:00' },
  { label: 'GMT+13:00', value: 'GMT+13:00' },
  { label: 'GMT+14:00', value: 'GMT+14:00' },
]
const selected = ref({ start: sub(new Date(), { days: 14 }), end: new Date() })
function isRangeSelected(duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}
function selectRange(duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
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
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  tokenNumber1: undefined,
  tokenType1: undefined,
  tokenChain1: undefined,
  rewardTotal: undefined,
  zone: undefined,
  startTime: '',
  endTime: '',
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
async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with state
  transData.taskId = uuid()
  transData.taskLogo = state.taskLogo
  transData.taskName = state.taskName
  transData.taskInfo = state.taskInfo
  transData.taskRule = t('taskRule')
  transData.tokenNumber = state.tokenNumber ? state.tokenNumber : 0
  transData.tokenType = state.tokenType ? state.tokenType.value : 'none'
  transData.tokenChain = state.tokenChain ? state.tokenChain.value : 'none'
  transData.tokenNumber1 = state.tokenNumber1 ? state.tokenNumber1 : 0
  transData.tokenType1 = state.tokenType1 ? state.tokenType1.value : 'none'
  transData.tokenChain1 = state.tokenChain1 ? state.tokenChain1.value : 'none'
  transData.rewardTotal = state.rewardTotal
  transData.zone = state.zone
  transData.startTime = selected.value.start.toLocaleString()
  transData.endTime = selected.value.end.toLocaleString()
  transData.ownerId = address
  // 根据时间判断 进行中/未开始/已结束
  const currentDate = new Date()
  let isBegin = 'NS'
  if (currentDate <= selected.value.end && currentDate >= selected.value.start) {
    isBegin = 'Y'
  } else if (currentDate > selected.value.end) {
    isBegin = 'N'
  }
  transData.isBegin = isBegin
  transData.communityId = String(communityId)
  await createTask(transData)
  await joinTask(transData.taskId, address)

  await getAllTasks(String(communityId))
  if(respArray.length === 0){
    taskListIsEmpty = true
  } else {
    taskListIsEmpty = false
  }
  isOpen = false
}
const ranges = [
  { label: 'Last 7 days', duration: { days: 7 } },
  { label: 'Last 14 days', duration: { days: 14 } },
  { label: 'Last 30 days', duration: { days: 30 } },
  { label: 'Last 3 months', duration: { months: 3 } },
  { label: 'Last 6 months', duration: { months: 6 } },
  { label: 'Last year', duration: { years: 1 } }
]

const slug = $computed(() => route.params.slug)

const chatId = $ref("CvgIA17jnhmuh3VtYozqlFy4sLKPVJV1c4eVZOY97to")
const footerLinks = $computed(() => {
  return [
    // {
    //   label: 'Invite people',
    //   icon: 'i-heroicons-plus',
    //   to: `/${slug}/settings/communityinfo`,
    // },
    {
      label: t('Quests Home'),
      icon: 'i-heroicons-plus',
      class: 'border',
      to: `/${slug}/tasks`,
    },
    {
      label: 'Chatroom',
      icon: 'i-heroicons-plus',
      to: `/${slug}/chat/${communityInfo.communitychatid}`,
    },
  ]
})

let communityInfo = $ref({})
let communityInfoJson = $ref({})
const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getLocalcommunityInfo(pid)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const taskType = ref()
let taskListIsEmpty = $ref(false)
onMounted(async () => {


  setCurrentuuid(route.params.communityId)
  await loadCommunityInfo(route.params.communityId)

  const rz = await add(communityInfo.name, communityInfo.communitychatid)
  if (rz.err) {
    console.log(rz.msg)
    //return
  }

  await getAllTasks(communityId)
  if(respArray.length === 0){
    taskListIsEmpty = true
  }

})

const banners = [
  '/task/banner1.jpg',
  '/task/banner2.jpg',
  '/task/banner3.jpg',
  '/task/banner4.jpg',
  '/task/banner5.jpg'
]
const currentIndex = $ref(0); // 用于存储当前选中的索引
const updateBanner = (index: number) => {
  if (index === 1) {
    state.taskLogo = 'banner1'
  } else if (index === 2) {
    state.taskLogo = 'banner2'
  } else if (index === 3) {
    state.taskLogo = 'banner3'
  }else if (index === 4){
    state.taskLogo = 'banner4'
  }else if (index === 5){
    state.taskLogo = 'banner5'
  }
}

const taskTypes = [
  [{
    label: 'Twitter Space Quest',
    click: () => {
      isOpen = true
    }
  }], [{
    label: 'Promotion Quest',
    click: () => {
      alert('This quest template is being prepared')
    }
  }], [{
    label: 'Invitation Quest',
    click: () => {
      alert('This quest template is being prepared')
    }
  }], [{
    label: 'Try Our Product Quest',
    click: () => {
      alert('This quest template is being prepared')
    }
  }], [{
    label: 'Thread Quest',
    click: () => {
      alert('This quest template is being prepared')
    }
  }], [{
    label: 'Twitter Article Quest',
    click: () => {
      alert('This quest template is being prepared')
    }
  }]
]

let exitButton = $ref(false)
const { exitCommunity } = $(aocommunityStore())
const router = useRouter();



const quitCommunity = async(communityuuid: any) => {
  await exitCommunity(communityuuid)
  router.push(`/${slug}/discovery`);
}

async function testAO() {
  await testTransfer()

}


const textToCopy = $ref('');
const copySuccess = $ref(false);

const copyText = async () => {
  try {
    // 使用 navigator.clipboard.writeText 复制文本
    await navigator.clipboard.writeText(textToCopy.innerText);
    // 复制成功后设置一段时间后隐藏提示信息
  } catch (err) {
    console.error('复制失败: ', err);
  }
};
const finalStatus = (isBegin: string) => {
  console.log('isB = ' + isBegin)
  let res = ''
  if(isBegin === 'NS')
    res = t('Not Start')
  else if(isBegin === 'Y'){
    res = t('Ing')
  }else {
    res = t('End')
  }
  console.log('res = ' + res)
  return res
}
</script>
<template>
  <UDashboardPanel :width="420" collapsible>
    <UDashboardSidebar>
      <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
      <!--<div v-for="Info in communityInfo" :key="Info.uuid">-->
      <div class="pt-8">
        <div class="flex justify-between  my-3 items-center">
          <div class="text-3xl">{{ communityInfo.name }}</div>
          <div>
            <UButton color="white" variant="solid" :to="`/${slug}/community-details/${communityId}`">
              {{ $t('View Details') }}
            </UButton>
          </div>
        </div>

        <UDivider />

        <div class="flex justify-between my-3 mt-5 items-center">
          <div>{{ $t('WebsiteOfCommunityDetail') }}</div>
          <div>
            <div class="flex justify-center border rounded-lg w-full pl-2 pr-2">
              {{ communityInfo.website }}
            </div>
          </div>
        </div>
        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('SocialOfCommunityDetail') }}</div>
          <div>
            <UButton variant="link">
              <UIcon name="ri:twitter-fill" class="h-full w-full " />
              Twitter
            </UButton>
          </div>
        </div>
        <div class="flex justify-between my-3 mt-10 items-center">
          <div >{{ $t('TokenOfCommunityDetail') }}</div>
          <div class="flex space-x-3">
            <div
              v-for="(token, index) in communityInfo.communitytoken"
              :key="index"
              class="flex justify-center border rounded-lg w-full pl-2 pr-2"
            >
              {{ token.tokenName }}
            </div>
          </div>
        </div>
        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('Trading Support') }}</div>
          <div class="flex space-x-3">
            <div
              v-for="(token, index) in communityInfo.support"
              :key="index"
              class="flex justify-center border rounded-lg w-full pl-2 pr-2"
            >
              {{ token }}
            </div>
          </div>
        </div>
        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('GithubOfCommunityDetail') }}</div>
          <div>
            <UButton to="www.github.com" variant="link">
              <UIcon name="ri:github-line" class="h-full w-full " />
              Github
            </UButton>
          </div>
        </div>
        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('BuilderNumberOfCommunityDetail') }}</div>
          <div>{{ communityInfo.buildnum }}</div>
        </div>
        <div v-if="communityInfo.creater !== address" class="flex">
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
      <div v-if="communityInfo.creater == address" class="flex">
        <UButton class="ml-auto" variant="ghost" icon="quill:cog-alt" @click="communitySetting = true" />
      </div>
      <UPopover mode="hover" :popper="{ placement: 'top' }">
        <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
        <Button class="center-text border rounded-lg w-full">Invite people</Button>
        <template #panel>
          <div class="p-4 ">
            <div>Invite Url: </div>
            <div class="flex items-center">
              <p ref="textToCopy">
                www.dm.com/invite/?{{ communityId }}
              </p>
              <UButton icon="carbon:align-box-bottom-right" variant="ghost" @click="copyText" />
            </div>
          </div>
        </template>
      </UPopover>
      <NuxtLink :to="`/${slug}/tasks/${communityInfo.uuid}`">
        <Button class="center-text border rounded-lg bg-black text-white w-full">Quests Home</Button>
      </NuxtLink>
      <NuxtLink :to="`/${slug}/chat/${communityInfo.communitychatid}`">
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
      <div class=" flex flex-col mx-10 pt-10 items-center h-full">
        <div class="flex w-full justify-between mb-4">
          <div>
            <UTabs :items="items" @change="onChange" />
          </div>
          <div class="flex">
            <div>
<!--              <UButton color="white" label="teest" trailing-icon="i-heroicons-chevron-down-20-solid" @click="testAO"/>-->
              <UDropdown :items="taskTypes" :popper="{ placement: 'bottom-start' }" v-if="communityInfo.creater == address" >
                <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
              </UDropdown>
            </div>
          </div>
        </div>
        <div class="h-full w-full flex justify-center items-center" v-if="taskListIsEmpty">
          <div class=" w-1/3" v-if="taskListIsEmpty">
            <UPricingCard
              :title="$t('Nothing here,click to start your first public quest.')"
              highlight
              orientation="vertical"
              align="bottom"
            >
              <template #title>
                <div class="text-2xl pt-16">
                  {{ $t('Nothing here,click to start your first public quest.') }}
                </div>
              </template>
              <template #description>
                <div class="flex mt-10 justify-center items-center">
                  <div class="flex justify-center items-center" v-if="communityInfo.creater == address" >
                    <UDropdown :items="taskTypes" :popper="{ placement: 'bottom-start' }">
                      <UButton color="white" :label="$t('Start a Public Quest')" trailing-icon="i-heroicons-chevron-down-20-solid" />
                    </UDropdown>
                  </div>
                </div>
              </template>
            </UPricingCard>
          </div>
        </div>
        <div class="mx-auto w-full" v-if="!taskListIsEmpty">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
            <UBlogPost v-for="blogPost in respArray" :key="blogPost.id" :image="`/task/${blogPost.image}.jpg`"
                       :description="blogPost.description">
              <template #title>
                <div class="flex justify-between ...">
                  <div>{{ blogPost.name }}</div>
                  <UBadge size="xs" color="black" variant="solid">
                    {{ finalStatus(blogPost.isBegin)}}
                  </UBadge>
                </div>
              </template>
              <template #description>
                <div class="flex flex-col space-y-2">
                  <div >
                    {{ blogPost.description }}
                  </div>
                  <div class="flex justify-between ...">
                    <div>
                      <div >
                        {{ $t("Bounty") }}:
                      </div>
                    </div>
                    <div>
                      <div >
                        {{ blogPost.reward }}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between ...">
                    <div>
                      <div >
                        {{ $t("builders now") }}:
                      </div>
                    </div>
                    <div>
                      <div >
                        {{ blogPost.builderNum }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <UButton :to="`/${slug}/taskDetail/${blogPost.id}`" class="absolute right-0" color="white" variant="outline">
                {{ $t("View Details") }}
              </UButton>
            </UBlogPost>
          </div>
        </div>
      </div>
    </UPage>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Start a Public Quest") }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>
        <UForm ref="form" :schema="schema" :state="state" class="space-y-4 ml-10" @submit="onSubmit">
          <UFormGroup name="taskLogo" :label="$t('Banner')">
            <template #label>
              <div class="w-[300px]">{{ $t('Banner') }}</div>
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
            <UTextarea disabled v-model="state.taskRule" :placeholder="$t('taskRule')" />
          </UFormGroup>

          <UFormGroup name="textarea" :label="$t('Bounty')">
            <div class="flex justify-between items-center">
              <UInput v-model="state.tokenNumber" :placeholder="$t('Token Number')" />

              <UInputMenu v-model="state.tokenType" :placeholder="$t('Token Type')" :options="tokenOptions" />

              <UInputMenu v-model="state.tokenChain" :placeholder="$t('Chain Type')" :options="chainOptions" />
            </div>
            <div class="flex justify-between items-center">
              <UInput v-model="state.tokenNumber1" :placeholder="$t('Token Number')" />

              <UInputMenu v-model="state.tokenType1" :placeholder="$t('Token Type')" :options="tokenOptions" />

              <UInputMenu v-model="state.tokenChain1" :placeholder="$t('Chain Type')" :options="chainOptions" />
            </div>
          </UFormGroup>
          <UFormGroup name="rewardTotal" :label="$t('Total Chances')">
            <UInput v-model="state.rewardTotal" :placeholder="$t('Total Chances')" />
          </UFormGroup>
          <UFormGroup name="textarea" :label="$t('Time')">
            <div class="flex justify-between items-center">
              <USelect v-model="state.zone" :placeholder="$t('Time Zone')" :options="timeZoneOptions" />
              <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid">
                  {{ format(selected.start, 'd MMM, yyy') }} - {{ format(selected.end, 'd MMM, yyy') }}
                </UButton>
                <template #panel="{ close }">
                  <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
                    <div class="hidden sm:flex flex-col py-4">
                      <UButton v-for="(range, index) in ranges" :key="index" :label="range.label" color="gray"
                        variant="ghost" class="rounded-none px-6"
                        :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                        truncate @click="selectRange(range.duration)" />
                    </div>

                    <DatePicker v-model="selected" @close="close" />
                  </div>
                </template>
              </UPopover>
            </div>
          </UFormGroup>
          <UButton color="white" type="submit">
            {{ $t('Post the Quest') }}
          </UButton>
        </UForm>
      </UCard>
    </UModal>
    <UModal v-model="communitySetting" :ui="{ width: w-full }">
      <UCard>
        <CommunitySetting />
      </UCard>
    </UModal>
    <UModal v-model="exitButton" :ui="{ width: w-full }">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to exit
        </div>
        <div class="w-full flex space-x-10 mt-6">
          <UButton @click="exitButton = false">No</UButton>
          <UButton @click="quitCommunity(communityId)">Yes</UButton>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
