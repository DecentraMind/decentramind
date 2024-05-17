<script setup lang="ts">
import { sub, format, isSameDay, type Duration } from 'date-fns'
import type { FormSubmitEvent } from '#ui/types'

const { t } = useI18n()
const { createTask, getAllTasks, respArray } = $(taskStore())
const { getCommunityInfo } = $(aocommunityStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId)
console.log('communityId = ' + communityId)

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

  alert(`${item.label} was clicked!此处应该刷新下方列表数据，重新渲染，待完善`)
}


const tokenOptions = [
  { label: 'Eth', value: 'Eth' },
  { label: 'USDT', value: 'USDT' },
  { label: 'AR', value: 'AR' }
]
const chainOptions = [
  { label: 'Ethereum Mainnet', value: 'Ethereum Mainnet' },
  { label: 'Linea Mainnet', value: 'Linea Mainnet' },
  { label: 'Arweave Mainnet', value: 'Arweave Mainnet' }
]
const timeZoneOptions = [
  { label: 'ACDT', value: 'ACDT' },
  { label: 'AT', value: 'AT' },
]
const selected = ref({ start: sub(new Date(), { days: 14 }), end: new Date() })
function isRangeSelected(duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}
function selectRange(duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
}
const state = $ref({
  taskLogo: undefined,
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  rewardTotal: undefined,
  zone: undefined,
})
const transData = {
  taskId: '',
  taskLogo: undefined,
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  rewardTotal: undefined,
  zone: undefined,
  startTime: '',
  endTime: '',
  buildNumber: 0,
  joined: 0,
  ownerId: undefined,
  communityId: '',
  isBegin: '',
  isSettle: t('Not Settle')
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
  // Do something with event.data
  transData.taskId = uuid()
  transData.taskLogo = event.data.taskLogo
  transData.taskName = event.data.taskName
  transData.taskInfo = event.data.taskInfo
  transData.taskRule = event.data.taskRule
  transData.tokenNumber = event.data.tokenNumber
  transData.tokenType = event.data.tokenType.value
  transData.tokenChain = event.data.tokenChain.value
  transData.rewardTotal = event.data.rewardTotal
  transData.zone = event.data.zone
  transData.startTime = selected.value.start.toLocaleString()
  transData.endTime = selected.value.end.toLocaleString()
  // 根据时间判断 进行中/未开始/已结束
  const currentDate = new Date()
  let isBegin = t('Not Start')
  if (currentDate <= selected.value.end && currentDate >= selected.value.start) {
    isBegin = t('ing')
  } else if (currentDate > selected.value.end) {
    isBegin = t('End')
  }
  transData.isBegin = isBegin
  transData.communityId = String(communityId)
  console.log(transData)
  await createTask(transData, 'CreateTask')
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

const footerLinks = $computed(() => {
  return [
    {
      label: t('Quests Home'),
      icon: 'i-heroicons-plus',
      to: `/${slug}/tasks`,
    },
    {
      label: 'Invite people',
      icon: 'i-heroicons-plus',
      to: `/${slug}/settings/communityinfo`,
    },
    {
      label: 'Chatroom',
      icon: 'i-heroicons-plus',
      to: `/${slug}/chat`,
    },
  ]
})

const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

let communityInfo = $ref({})
let communityInfoJson = $ref({})
const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getCommunityInfo(pid)
    const jsonData = communityInfo.Messages[0].Data
    const jsonObjects = jsonData.match(/\{.*?\}/g)
    communityInfoJson = jsonObjects.map((item) => JSON.parse(item))
    console.log("-------------", communityInfoJson)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const taskTypes = [t('Twitter Space Quest'), t('Promotion Quest'), t('Invitation Quest'),t('Try Our Product Quest'),t('Thread Quest'),t('Twitter Article Quest')]
const taskType = ref()
let taskListIsEmpty = $ref(true)
onMounted(async () => {
  // await getAllTasks('GetAllTasks')
  if(Array.isArray(respArray) && respArray.length){
    taskListIsEmpty = false
  }
  console.log("taskIsEmpty = " + taskListIsEmpty)
  await loadCommunityInfo(route.params.communityId)
})
</script>

<template>
  <UDashboardPanel :width="350" collapsible>
    <UDashboardSidebar>
      <UColorModeImage :light="light" :dark="dark" class="h-[80px]" />
      <div v-for="Info in communityInfoJson" :key="Info.uuid">
        <div class="flex justify-between  my-3 items-center">
          <div class="text-3xl">{{ Info.name }}</div>
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
            <UBadge color="primary" variant="soft" size="lg">
              {{ Info.website }}
            </UBadge>
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
          <div>
            <UBadge color="primary" variant="soft" size="lg">
              USDC
            </UBadge>
          </div>
        </div>
        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('Trading Support') }}</div>
          <div>
            <UBadge color="primary" variant="soft" size="lg">
              OKE
            </UBadge>
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
          <div>10</div>
        </div>
      </div>
      <UDivider />

      <!--      <UDashboardSidebarLinks :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
      <!--        @update:links="(colors) => (defaultColors = colors)" />-->

      <div class="flex-1" />

      <UDashboardSidebarLinks :links="footerLinks" />

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
      <div class="   mx-10 mt-10  ">
        <div class="flex justify-between mb-4">
          <div>
            <UTabs :items="items" @change="onChange" />
          </div>
          <div class="flex">
            <div>
              <UButton color="white" variant="solid" size="lg" @click="openModal">
                {{ $t("Start a Public Quest") }}
              </UButton>
            </div>

          </div>
        </div>
        <div v-if="taskListIsEmpty">
          <UPricingCard
              :title="$t('Nothing here,click to start your first public quest.')"
              highlight
              orientation="vertical"
              align="bottom">
            <template #description>
              <div class="flex mt-10 justify-between items-center">
                <div class="flex items-center justify-center">
                  <span>{{ $t('Nothing here,click to start your first public quest.') }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="mr-3"><USelect v-model="taskType" :placeholder="$t('More Quests Soon')" :options="taskTypes" size="lg"/></div>
                  <div>
                    <UButton icon="ic:baseline-add-circle-outline" color="white" variant="solid" size="lg" @click="openModal">
                      {{ $t("Start a Public Quest") }}
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UPricingCard>
        </div>
        <UBlogList orientation="horizontal">
          <UBlogPost v-for="blogPost in respArray" :key="blogPost.id" :image="blogPost.image"
            :description="blogPost.description">
            <template #title>
              <div class="flex justify-between ...">
                <Text>{{ blogPost.name }}</Text>
                <UBadge color="green" variant="solid">
                  {{ blogPost.status }}
                </UBadge>
              </div>
            </template>
            <template #description>
              <div class="flex flex-col space-y-2">
                <Text class="text-blue-900">
                  {{ blogPost.description }}
                </Text>
                <div class="flex justify-between ...">
                  <div>
                    <Text class="text-blue-300">
                      {{ $t("Bounty") }}:
                    </Text>
                  </div>
                  <div>
                    <Text class="text-blue-300">
                      {{ blogPost.reward }}
                    </Text>
                  </div>
                </div>
                <div class="flex justify-between ...">
                  <div>
                    <Text class="text-blue-300">
                      {{ $t("builders now") }}:
                    </Text>
                  </div>
                  <div>
                    <Text class="text-blue-300">
                      {{ blogPost.builderNum }}
                    </Text>
                  </div>
                </div>
              </div>
            </template>
            <UButton to="/signup/detail-task/" class="absolute right-0" color="primary" variant="outline">
              {{ $t("View Details") }}
            </UButton>
          </UBlogPost>
        </UBlogList>
      </div>
    </UPage>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Start a Public Quest") }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen = false" />
          </div>
        </template>
        <UForm ref="form" :state="state" class="space-y-4 ml-10" @submit="onSubmit">
          <UFormGroup name="taskLogo" :label="$t('Banner')">
            <UInput v-model="state.taskLogo" type="file" size="sm" />
          </UFormGroup>

          <UFormGroup name="taskName" :label="$t('Name of Quest')">
            <UInput v-model="state.taskName" placeholder="name" />
          </UFormGroup>

          <UFormGroup name="taskInfo" :label="$t('Task Introduction')">
            <UTextarea v-model="state.taskInfo" />
          </UFormGroup>

          <UFormGroup name="taskRule" :label="$t('Rules of the Quest')">
            <UTextarea v-model="state.taskRule" placeholder="已自动生成任务规则" />
          </UFormGroup>

          <UFormGroup name="textarea" :label="$t('Bounty')">
            <div class="flex justify-between items-center">
              <UInput v-model="state.tokenNumber" :placeholder="$t('Token Number')" />

              <UInputMenu v-model="state.tokenType" :placeholder="$t('Token Type')" :options="tokenOptions" />

              <UInputMenu v-model="state.tokenChain" :placeholder="$t('Chain Type')" :options="chainOptions" />
            </div>
          </UFormGroup>
          <UFormGroup name="rewardTotal" :label="$t('Total Chances')">
            <UInput v-model="state.rewardTotal" :placeholder="$t('Task Introduction')" />
          </UFormGroup>
          <UFormGroup name="textarea" :label="$t('Task Period')">
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
          <UButton type="submit">
            {{ $t('Post the Quest') }}
          </UButton>
          <UButton variant="outline" class="ml-2" @click="form.clear()">
            Clear
          </UButton>
        </UForm>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
