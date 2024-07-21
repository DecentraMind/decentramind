<script setup lang="ts">
import { taskStore } from '~/stores/taskStore'
import { shortAddress } from '~/utils/web3'
import { ssimStore } from '~/stores/ssimStore'
import { formatToLocale } from '~/utils/util'
import type { Task } from '~/types'

const { t } = useI18n()
const { denomination, storeBounty, updateTaskAfterSettle, allInviteInfo, getAllInviteInfo, updateTaskSubmitInfoAfterCal, updateTaskAfterCal, getTaskById, getTask, submitSpaceTask, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo } = $(taskStore())
const { userInfo, getInfo, getLocalcommunityInfo } = $(aocommunityStore())
// 用户钱包地址
const { address } = $(aoStore())
const { compareImages } = $(ssimStore())
const route = useRoute()
const taskId = $computed(() => route.params.taskId) as string
const slug = $computed(() => route.params.slug)

console.log('route params', route.params)

let blogPost = $ref<Task & { reward: string }>()

blogPost = await getTask(taskId)
console.log('blogPost of task id ' + taskId + JSON.stringify(blogPost))

const communityId = blogPost!.communityId

const isOwner = blogPost!.ownerId === address

let taskJoinRecord = $ref<Awaited<ReturnType<typeof getTaskJoinRecord>>>()
taskJoinRecord = await getTaskJoinRecord(taskId)

let spaceTaskSubmitInfo = $ref<Awaited<ReturnType<typeof getSpaceTaskSubmitInfo>>>()
const communityInfo = await getLocalcommunityInfo(communityId)
spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
console.log('spaceTaskSubmitInfo = ' + JSON.stringify(spaceTaskSubmitInfo), taskId)

const checkSubmit = () => {
  if (!spaceTaskSubmitInfo) return false

  for (let index = 0;index < spaceTaskSubmitInfo.length;index++) {
    const element = spaceTaskSubmitInfo[index]
    if (element.address === address) {
      console.log('found address submitted to task', element.id)
      return true
    }
  }
  return false
}

const checkJoin = () => {
  if (!taskJoinRecord) return false

  for (let index = 0;index < taskJoinRecord.length;index++) {
    const element = taskJoinRecord[index]
    if (element.joinedAddress === address) {
      return true
    }
  }
  return false
}
let isSubmitted = $ref<boolean>(false)
let isJoined = $ref<boolean>(false)
isJoined = checkJoin()
isSubmitted = checkSubmit()
console.log({isSubmitted})

let isIng = $ref(false)
let submitStatus = $ref('')
let settleStatus = $ref(false)
submitStatus = isSubmitted ? t('task.isjoin') : t('Not Join')
// console.log('taskJoinRecord = ' + JSON.stringify(taskJoinRecord))
// console.log('isJoined = ' + isJoined)
// console.log('chatProcessId = ' + chatProcessId)

let submittedBuilderCount = $ref<number>(0)

onMounted(async () => {
  const isBegin = blogPost!.isBegin
  if (isBegin === 'Y') {
    isIng = true
  } else {
    isIng = false
  }
  const isSettle = blogPost!.isSettle
  settleStatus = isSettle === 'Y'
  const isCal = blogPost!.isCal

  // TODO don't use spaceTaskSubmitInfo array, use submitInfo of current task only
  if (spaceTaskSubmitInfo && spaceTaskSubmitInfo.length !== 0) {
    // TODO update task.submittedCount after every task submit in cronjob
    submittedBuilderCount = spaceTaskSubmitInfo.reduce((count, info) => {
      return count + (info.taskId === taskId ? 1 : 0)
    }, 0)

    if (isBegin && isSettle && isCal && isCal === 'N' && isBegin === 'N' && isSettle === 'N') {
    // 计算分数
      calculateScore()
      console.log(taskId)
      // 更新任务状态和已提交信息
      await updateTaskAfterCal(taskId)
      await updateTaskSubmitInfoAfterCal(taskId, spaceTaskSubmitInfo)
    }
  }
  // calculateScore()
  // console.log('after cal spaceTaskSubmitInfo = ' + spaceTaskSubmitInfo)
  // await updateTaskSubmitInfoAfterCal(taskId, spaceTaskSubmitInfo)

  blogPost = await getTask(taskId)
  console.log('getTask ' + JSON.stringify(blogPost))
  console.log(isBegin)
  console.log(isSettle)
  console.log(isCal)
  await getAllInviteInfo()
  await getInfo()
  console.log('userInfo', JSON.stringify(userInfo))
})

// spaceTaskSubmitInfo = people
function calculateScore() {
  if (!spaceTaskSubmitInfo) return
  // 找到friends和audience的最大值
  spaceTaskSubmitInfo.sort((a, b) => b.getPerson - a.getPerson)
  const getPersonMax = spaceTaskSubmitInfo[0].getPerson
  spaceTaskSubmitInfo.sort((a, b) => b.audience - a.audience)
  const audienceMax = spaceTaskSubmitInfo[0].audience
  console.log('getPersonMax = ' + getPersonMax)
  console.log('audienceMax = ' + audienceMax)
  let totalScore = 0
  let friendScore = 0
  let audienceScore = 0

  for (let i = 0;i < spaceTaskSubmitInfo.length;++i) {
    if (getPersonMax != 0) {
      friendScore = spaceTaskSubmitInfo[i].getPerson / getPersonMax * 40
    }
    if (audienceMax != 0) {
      audienceScore = spaceTaskSubmitInfo[i].audience / audienceMax * 50
    }
    let brandScore = 0
    if (spaceTaskSubmitInfo[i].brandEffect === 10) {
      brandScore = 10
    }
    console.log('friendScore = ' + friendScore)
    console.log('audienceScore = ' + audienceScore)
    console.log('brandScore = ' + brandScore)
    spaceTaskSubmitInfo[i].score = friendScore + audienceScore + brandScore
    console.log('spaceTaskSubmitInfo[i].score = ' + spaceTaskSubmitInfo[i].score)
    totalScore += spaceTaskSubmitInfo[i].score
  }
  console.log('totalScore = ' + totalScore)
  for (let i = 0;i < spaceTaskSubmitInfo.length;++i) {
    if (blogPost!.tokenNumber) {
      // TODO 5% 手续费
      spaceTaskSubmitInfo[i].bounty1 = (spaceTaskSubmitInfo[i].score / totalScore * Number(blogPost!.tokenNumber)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType1 = blogPost!.tokenType
      // TODO use token.denomination
      spaceTaskSubmitInfo[i].bounty = (spaceTaskSubmitInfo[i].bounty1 / denomination[spaceTaskSubmitInfo[i].bountyType1]).toString() + spaceTaskSubmitInfo[i].bountyType1
    }
    if (blogPost!.tokenNumber1) {
      // TODO 5% 手续费
      spaceTaskSubmitInfo[i].bounty2 = (spaceTaskSubmitInfo[i].score / totalScore * Number(blogPost!.tokenNumber1)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType2 = blogPost!.tokenType1
      // TODO use token.denomination
      spaceTaskSubmitInfo[i].bounty = spaceTaskSubmitInfo[i].bounty + '+' + (spaceTaskSubmitInfo[i].bounty2 / denomination[spaceTaskSubmitInfo[i].bountyType2]).toString() + spaceTaskSubmitInfo[i].bountyType2
    }

    // console.log('bounty = ' + spaceTaskSubmitInfo[i].score / totalScore * 100)
  }
  // 计算完成后更新AO侧数据和前端表单数据
  console.log('spaceTaskSubmitInfo', JSON.stringify(spaceTaskSubmitInfo))
}

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'address',
    label: t('Wallet'),
  },
  {
    key: 'brandEffect',
    label: t('Brand'),
  },
  {
    key: 'getPerson',
    label: t('Friends'),
  },
  {
    key: 'audience',
    label: t('Popularity'),
  },
  {
    key: 'url',
    label: t('URL'),
  },
  {
    key: 'score',
    label: t('Total Score'),
  },
  {
    key: 'bounty',
    label: t('Bounty'),
  },
]

const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    console.info('spaceTaskSubmitInfo as filteredRows')
    return spaceTaskSubmitInfo
  }

  if (!spaceTaskSubmitInfo) return []

  return spaceTaskSubmitInfo.filter((info) => {
    return Object.values(info).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

useModal()

let isOpen = $ref(false)
let isOpenJoin = $ref(false)
function openModal() {
  // if (isNullOrEmpty(userInfo.twitter) || userInfo.twitter === 'Success') {
  //   modal.open(CommonAlert, { message: error_msg })
  // } else {
  //   isOpen = true
  // }
  isOpen = true
}

function openJoin() {
  // if (isNullOrEmpty(userInfo.twitter) || userInfo.twitter === 'Success') {
  //   modal.open(CommonAlert, { message: error_msg })
  // } else {
  //   isOpenJoin = true
  // }
  isOpenJoin = true
}

async function onClick() {
  //  调用参与任务方法，只计数不提交
  await joinTask(taskId, address)
  blogPost = await getTaskById(taskId)
  taskJoinRecord = await getTaskJoinRecord(taskId)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isJoined = checkJoin()
  isOpenJoin = false
}

const emit = defineEmits(['success'])
const submitUrl = $ref('')
let submitLoading = $ref(false)
let sendBountyLoading = $ref(false)
async function submitTask() {
  if (!spaceTaskSubmitInfo) {
    console.error('spaceTaskSubmitInfo is null')
    return
  }

  submitLoading = true
  for (let i = 0;i < spaceTaskSubmitInfo.length;i++) {
    if (spaceTaskSubmitInfo[i].address === address) {
      alert('You have submitted this quest.')
      return
    }
  }
  // TODO 调用提交space链接并解析方法
  console.log('submitUrl = ' + submitUrl)
  const splitted = submitUrl.split('/', 6)
  console.log(splitted)
  // await testCallJava()
  // 直接在vue中请求api接口 拿到需要的信息
  const query = computed(() => ({ spaceId: splitted[splitted.length - 1] }))
  const { data, error } = await useFetch('/api/twitter', { query })

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  console.log('data = ' + JSON.stringify(data))
  // space开始时间 从开始时间往前推24小时，统计邀请数量 记作friend参数
  const spaceStart_at = data._rawValue.data.started_at
  const spaceEnded_at = data._rawValue.data.ended_at
  // 计算时间差，如果不足15分钟，不允许提交
  const timeDifference = (new Date(spaceEnded_at).getTime() - new Date(spaceStart_at).getTime()) / (1000 * 60)
  if (timeDifference < 15) {
    alert('Space lasts less than 15 minutes')
    return
  }
  // space参与人数
  const participated = data._rawValue.data.participant_count
  // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
  const la = data._rawValue.includes.users[0].profile_image_url
  const resp = la.split('_')
  let url = ''
  for (let i = 0;i < resp.length - 1;++i) {
    url = url + resp[i]
    if (i != resp.length - 2) {
      url += '_'
    }
  }
  url = url + '.png'
  const userAvatar = url
  // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
  // const userCreatedAt = data._rawValue.includes.users[0].created_at
  // space创办人的ID 用于判断是否是本人提交任务
  const userId = data._rawValue.includes.users[0].id
  // const userAvatarBase64 = await url2Base64(userAvatar)
  const ssim = await compareImages(communityInfo.logo, userAvatar)
  // 品牌效应
  const brandEffect = ssim >= 0.8 ? 10 : 0
  // 听众
  const audience = participated
  // 邀请人数
  let inviteCount = 0
  if (allInviteInfo && allInviteInfo.length != 0) {
    for (let i = 0;i < allInviteInfo.length;++i) {
      const temp = allInviteInfo[i]
      if (temp.userId === address
        && temp.communityId === communityId
        && temp.inviteTime < new Date(spaceEnded_at).getTime()
      ) {
        inviteCount = inviteCount + 1
      }
    }
  }
  console.log('spaceEnded_at = ' + spaceEnded_at)
  console.log('participated = ' + participated)
  console.log('userAvatar = ' + userAvatar)
  //console.log('userCreatedAt = ' + userCreatedAt)
  console.log('userId = ' + userId)
  // console.log('brand = ' + brandEffect)
  // console.log(communityInfo.logo)
  // console.log(userAvatarBase64)
  await submitSpaceTask(taskId, address, url, brandEffect, inviteCount, audience)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isSubmitted = checkSubmit()
  submitStatus = isSubmitted ? t('task.isjoin') : t('Not Join')
  submitLoading = false
  isOpen = false
}

let selected = $ref([])


async function sendBountyByAo() {
  // if(blogPost.isCal === 'Y' && blogPost.isSettle === 'N'){
  sendBountyLoading = true

  // TODO if no submitted info, don't need isCal==='Y'

  if (blogPost.isCal === 'Y') {
    const bounties = []
    if (selected.length != 0) {

      for (let i = 0;i < selected.length;++i) {
        const address = selected[i].address
        for (let j = 0;j < spaceTaskSubmitInfo.length;++j) {
          if (address === spaceTaskSubmitInfo[j].address) {
            console.log(spaceTaskSubmitInfo[j].bounty1)
            console.log(spaceTaskSubmitInfo[j].bounty2)
            if (spaceTaskSubmitInfo[j].bounty1 && spaceTaskSubmitInfo[j].bounty1 != 0) {
              const bountyData = {
                walletAddress: address,
                tokenNumber: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty1)),
                tokenType: spaceTaskSubmitInfo[j].bountyType1
              }
              bounties.push(bountyData)
            }
            if (spaceTaskSubmitInfo[j].bounty2 && spaceTaskSubmitInfo[j].bounty2 != 0) {
              const bountyData = {
                walletAddress: address,
                tokenNumber: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty2)),
                tokenType: spaceTaskSubmitInfo[j].bountyType2,
              }
              bounties.push(bountyData)
            }
            break
          }
        }

        // TODO add bountyData of 5%

        // const bountyData = {
        //         walletAddress: ,
        //         tokenNumber: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty2)),
        //         tokenType: spaceTaskSubmitInfo[j].bountyType2,
        //       }
      }
    }
    // ji算剩余token，返还给任务创建人
    let bounty1 = blogPost.tokenNumber
    let bounty2 = blogPost.tokenNumber1
    for (let j = 0;j < bounties.length;++j) {
      if (bounties[j].tokenType === blogPost.tokenType) {
        bounty1 = bounty1 - bounties[j].tokenNumber
      }
      if (bounties[j].tokenType === blogPost.tokenType1) {
        bounty2 = bounty2 - bounties[j].tokenNumber
      }
    }

    // TODO 如果bounties.length>0 收取5%手续费

    if (bounty1 && bounty1 > 0 && bounty1 != 'undefined') {
      const bountyData = {
        walletAddress: address,
        tokenNumber: bounty1,
        tokenType: blogPost.tokenType
      }
      bounties.push(bountyData)
    }
    if (bounty2 && bounty2 > 0 && bounty2 != 'undefined') {
      const bountyData = {
        walletAddress: address,
        tokenNumber: bounty2,
        tokenType: blogPost.tokenType1
      }
      bounties.push(bountyData)
    }
    console.log('selected = ' + JSON.stringify(bounties))
    // await sendBounty(blogPost.processId, bounties)
    await updateTaskAfterSettle(blogPost.id)
    blogPost = await getTaskById(taskId)

    console.log({ blogPost })
    // settleStatus = isSettle === 'Y'
    // await sendBounty('Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I', bounties)
    // 将发送出去的bounty信息保存
    const sentBounties = []
    for (let k = 0;k < bounties.length;++k) {
      const tt = bounties[k]
      const sent = {
        send: address,
        receive: tt.walletAddress,
        tokenNumber: tt.tokenNumber,
        tokenType: tt.tokenType,
        taskId: blogPost.id,
        taskName: blogPost.name,
        communityId: communityInfo.uuid,
        communityName: communityInfo.name
      }
      sentBounties.push(sent)
    }
    await storeBounty(sentBounties)
  } else {
    alert('This quest is not calculate store or has settled.')
  }
  sendBountyLoading = false
}

const finalStatus = (isBegin: string) => {
  console.log('isB = ' + isBegin)
  let res = ''
  if (isBegin === 'NS')
    res = t('Not Start')
  else if (isBegin === 'Y') {
    res = t('Ing')
  } else {
    res = t('End')
  }
  console.log('res = ' + res)
  return res
}

const maxSelection = blogPost.rewardTotal
// 监视 selected 数组的变化
watch(() => selected, (newVal) => {
  if (newVal.length > maxSelection) {
    alert('Selected items exceed 5!')
    // 如果选择的数量超过最大值，取消超出的选择项
    selected = newVal.slice(0, maxSelection)
  }
})
function labelName() {
  if (!spaceTaskSubmitInfo || spaceTaskSubmitInfo.length === 0 || !spaceTaskSubmitInfo) {
    return 'Return Bounty'
  } else {
    return t('Send Bounty')
  }
}
const page = ref(1)
const pageCount = 5
const trueRows = computed(() => {
  if (!filteredRows.value) return
  return filteredRows.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})
</script>

<template>
  <UDashboardPage>
    <UPage class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full ">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <NuxtLink :to="`/${slug}/community/${communityId}`">
              <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg" />
            </NuxtLink>
          </div>
        </div>
        <!--
        <div class="mx-10">
          <UColorModeImage :src="`/task/${blogPost.image}.jpg`" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>
        -->
        <UBlogPost :key="blogPost.id" :description="blogPost.description" class="p-10">
          <template #title>
            <div class="flex justify-start">
              <div class="flex-none w-60"><div>{{ blogPost?.taskName }}</div></div>
              <div class="flex justify-start">
                <div>
                  <UBadge color="black" variant="solid">
                    {{ finalStatus(blogPost.isBegin) }}
                  </UBadge>
                </div>
                <div v-if="isSubmitted" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ submitStatus }}
                  </UBadge>
                </div>
                <div v-if="isOwner && !settleStatus && blogPost.isBegin === 'N'" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ $t('Unsettled') }}
                  </UBadge>
                </div>
              </div>

              <!-- <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
              <UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge> -->
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-2">
              <div class="h-6 overflow-hidden">
                {{ blogPost.description }}
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Time Zone") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.zone }}
                  </div>
                </div>
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Time") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ formatToLocale(blogPost.startTime) }} - {{ formatToLocale(blogPost.endTime) }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Bounty") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.reward }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Total Chances") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.rewardTotal }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("builders now") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ submittedBuilderCount }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start">
                <div class="flex-none w-60 ">
                  <div>
                    {{ $t("Rules of the Quest") }}:
                  </div>
                </div>
                <div>
                  <div style="white-space: pre-line">
                    {{ blogPost.taskRule }}
                  </div>
                </div>
              </div>
              <div v-if=" isIng && !isJoined" class="flex justify-center ">
                <UButton color="white" :label="$t('Join Quest')" @click="openJoin" />
              </div>
            </div>
            <!--            <UDivider class="mt-4" />-->
            <div class="mt-8">
              <div class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex ">
                  <div class=" mr-8">
                    {{ $t("Quests Form") }}:
                  </div>
                  <UInput v-model="q" placeholder="Filter..." />
                </div>
                <div><a :href="`https://www.ao.link/#/entity/${blogPost.processId}?tab=source-code`" target="_blank">AO Process</a></div>
              </div>
              <div v-if="isJoined">
                <UTable v-model="selected" :rows="trueRows" :columns="columns">
                  <template #address-data="{ row }">
                    {{ isOwner ? row.address : shortAddress(row.address) }}
                  </template>
                  <template #url-data="{ row }">
                    {{ isOwner ? row.url : shortAddress(row.url) }}
                  </template>
                </UTable>
                <div class="flex justify-end mt-2">
                  <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
                </div>
              </div>
            </div>
            <div v-if="isJoined" class="flex justify-center my-8">
              <!--              <div class="mx-4">-->
              <!--                <UButton color="white" label="testuser" @click="test" />-->
              <!--              </div>-->
              <div v-if="isIng && !isSubmitted" class="mx-4">
                <UButton color="white" :label="$t('Submit Quest')" @click="openModal" />
              </div>
              <div v-if="isOwner && !settleStatus && blogPost.isBegin === 'N'" class="mx-4">
                <UButton color="white" :label="labelName()" :disabled="sendBountyLoading" @click="sendBountyByAo" />
              </div>
            </div>
            <div class="flex mt-4">
              <div class="flex-none w-60">
                <div>
                  {{ $t("Rules of Judgment") }}:
                </div>
              </div>
              <div>
                <div>
                  <p> 1 Total score is 100 including Brand 10%, Friends 40%, Popularity 50% </p>

                  <p> 2 Brand is decided by your avatar,  change it you’ll get 10, not change get 0 </p>

                  <p> 3 Friends is decided by the amount of new friends you invited </p>

                  <p> 4 Popularity is decided by the amount of audience in your Twitter Space </p>

                  <p> 5 The person with the highest data gets the maximum scores including Brand, Friends and Popularity </p>

                  <p> 6 Everyone will have a total score, it decide the amount of your bounty </p>

                  <p> 7 If the total chances are 20 but you are in 21st, sorry you can get nothing </p>

                  <p> 8 You only have 1 chance for this quest </p>
                  <p> 9 If no one meets the bounty, the bounty will be returned to the bounty owner's wallet </p>
                </div>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </UPage>
    <UModal v-model="isOpenJoin">
      <UCard>
        <!--        <template #header>-->
        <!--          <div class="flex items-center justify-center">-->
        <!--            <div class="flex justify-center">-->
        <!--              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">-->
        <!--                {{ $t("Join Quest") }}-->
        <!--              </h3>-->
        <!--            </div>-->
        <!--            &lt;!&ndash;-->
        <!--              <UButton-->
        <!--                color="gray"-->
        <!--                variant="ghost"-->
        <!--                icon="i-heroicons-x-mark-20-solid"-->
        <!--                class="-my-1"-->
        <!--                @click="isOpenJoin = false"-->
        <!--              />-->
        <!--              &ndash;&gt;-->
        <!--          </div>-->
        <!--        </template>-->
        <div class="space-y-2">
          <div class="flex flex-col justify-center">
            <div class="flex justify-center items-center">Thank u for your support.</div>
            <div class="flex justify-center items-center" style="text-align: center;">
              {{ $t("We appreciate your support,Please follow the rules of the quest and submit the URL back to this page") }}
            </div>
          </div>

          <div class="flex justify-center">
            <UButton color="white" @click="onClick">
              {{ $t('I have read all rules') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Submit Quest") }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>
        <div>
          <!--          <div class="my-8">-->
          <!--            <UInput v-model="addr" color="primary" variant="outline" :placeholder="$t('Wallet Address')" />-->
          <!--          </div>-->
          <div class="my-8">
            <UInput v-model="submitUrl" color="primary" variant="outline" :placeholder="$t('Space Url')" />
          </div>
          <div class="flex justify-center my-8">
            <UButton :disabled="submitLoading" @click="submitTask">
              {{ $t("Submit Quest") }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
