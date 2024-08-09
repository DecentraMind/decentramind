<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { taskStore } from '~/stores/taskStore'
import { shortAddress } from '~/utils/web3'
import { ssimStore } from '~/stores/ssimStore'
import { formatToLocale } from '~/utils/util'
import type { InviteInfo, Task, TwitterSpaceInfo } from '~/types'
import { tokens } from '~/utils/constants'

const { t } = useI18n()

const { storeBounty, sendBounty, updateTaskAfterSettle, getInvitesByInviter, updateTaskSubmitInfoAfterCal, updateTaskAfterCal, getTask, submitSpaceTask, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo } = $(taskStore())

const { getLocalCommunity } = $(aoCommunityStore())

const { showError, showSuccess, showMessage } = $(notificationStore())

// 用户钱包地址
const { address } = $(aoStore())
const { compareImages } = $(ssimStore())
const route = useRoute()
const taskId = $computed(() => route.params.taskId) as string

console.log('route params', route.params)

let task = $ref<Task & {
  reward: string
}>()

console.log('blogPost of task id ' + taskId + JSON.stringify(task))

const communityId = $computed(() => task.communityId)

const isOwner = $computed(() => task.ownerId === address)

let taskJoinRecord = $ref<Awaited<ReturnType<typeof getTaskJoinRecord>>>()

let spaceTaskSubmitInfo = $ref<Awaited<ReturnType<typeof getSpaceTaskSubmitInfo>>>([])

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

submitStatus = isSubmitted ? t('task.isjoin') : t('Not Join')
// console.log('taskJoinRecord = ' + JSON.stringify(taskJoinRecord))
// console.log('isJoined = ' + isJoined)
// console.log('chatProcessId = ' + chatProcessId)

let submittedBuilderCount = $ref<number>(0)

let communityInfo: Awaited<ReturnType<typeof getLocalCommunity>>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let invites: InviteInfo[]

onMounted(async () => {
  try {
    task = await getTask(taskId)
    console.log('getTask ' + JSON.stringify(task))

    if (!task) {
      throw new Error('Failed to get task ' + taskId)
    }

    const isBegin = task.isBegin
    if (isBegin === 'Y') {
      isIng = true
    } else {
      isIng = false
    }
    const isSettle = task!.isSettle
    const isCal = task!.isCal
    console.log(isBegin)
    console.log(isSettle)
    console.log(isCal)

    invites = await (await getInvitesByInviter(address)).invites

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

    taskJoinRecord = await getTaskJoinRecord(taskId)
    communityInfo = await getLocalCommunity(task.communityId)
    spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
    console.log('spaceTaskSubmitInfo = ' + JSON.stringify(spaceTaskSubmitInfo), taskId)

  } catch (e) {
    console.error(e)
    showError('Data loading failed.')
  }
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
    if (task!.tokenNumber) {
      const token = tokens[spaceTaskSubmitInfo[i].bountyType1 as TokenName]
      // TODO 5% 手续费
      spaceTaskSubmitInfo[i].bounty1 = (spaceTaskSubmitInfo[i].score / totalScore * Number(task!.tokenNumber)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType1 = task!.tokenType

      spaceTaskSubmitInfo[i].bounty = (spaceTaskSubmitInfo[i].bounty1 / Math.pow(10, token.denomination)).toString() + spaceTaskSubmitInfo[i].bountyType1
    }
    if (task!.tokenNumber1) {
      const token = tokens[spaceTaskSubmitInfo[i].bountyType2 as TokenName]
      // TODO 5% 手续费
      spaceTaskSubmitInfo[i].bounty2 = (spaceTaskSubmitInfo[i].score / totalScore * Number(task!.tokenNumber1)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType2 = task!.tokenType1

      spaceTaskSubmitInfo[i].bounty = spaceTaskSubmitInfo[i].bounty + '+' + (spaceTaskSubmitInfo[i].bounty2 / Math.pow(10, token.denomination)).toString() + spaceTaskSubmitInfo[i].bountyType2
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

const modal = useModal()
let isSubmitModalOpen = $ref(false)
let isJoinModalOpen = $ref(false)
function checkVouch() {
  // TODO check current address is vouched
}
function openSubmitModal() {
  // if (isNullOrEmpty(userInfo.twitter) || userInfo.twitter === 'Success') {
  //   modal.open(CommonAlert, { message: error_msg })
  // } else {
  //   isOpen = true
  // }
  isSubmitModalOpen = true
}

function openJoinModal() {
  // if (isNullOrEmpty(userInfo.twitter) || userInfo.twitter === 'Success') {
  //   modal.open(CommonAlert, { message: error_msg })
  // } else {
  //   isOpenJoin = true
  // }
  isJoinModalOpen = true
}

let isJoinLoading = $ref(false)
async function onClickJoin() {
  isJoinLoading = true
  //  调用参与任务方法，只计数不提交
  await joinTask(taskId, address)
  // blogPost = await getTaskById(taskId)
  taskJoinRecord = await getTaskJoinRecord(taskId)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isJoined = checkJoin()
  isJoinModalOpen = false
  isJoinLoading = false
}

const spaceUrl = $ref('')
let submitLoading = $ref(false)

async function submitTask() {
  submitLoading = true

  try {
    if(!spaceTaskSubmitInfo || !invites || !communityInfo) {
      throw new Error('Data loading does not completed. Please wait or try refresh.')
    }

    // for (let i = 0;i < spaceTaskSubmitInfo.length;i++) {
    //   if (spaceTaskSubmitInfo[i].address === address) {
    //     throw new Error('You have submitted this quest.')
    //   }
    // }
    // TODO 调用提交space链接并解析方法
    const matched = spaceUrl.trim().match(/spaces\/([^/]+)\/?/)

    if(!matched || !matched[1]) {
      throw new Error('Invalid space URL.')
    }
    const spaceId = matched[1]

    const { data, error } = await useFetch('/api/twitter?' + new URLSearchParams({ spaceId })).json<TwitterSpaceInfo>()
    const spaceInfo = unref(data)

    if (error.value || !spaceInfo) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate space URL.')
    }

    console.log('data from twitter = ', spaceInfo)

    const { started_at, ended_at, participant_count: participantCount } = spaceInfo.data
    const spaceStartAt = new Date(started_at).getTime()
    const spaceEndedAt = new Date(ended_at).getTime()
    const validJoinStartAt = new Date(spaceEndedAt - 24*60*60*1000).getTime()

    const minuteDifference = (spaceEndedAt - spaceStartAt) / (1000 * 60)
    if (minuteDifference < 15) {
      throw Error('Space lasts less than 15 minutes')
    }

    // space创办人的ID 用于判断是否是本人提交任务
    const userID = spaceInfo.includes.users[0].id
    // TODO compare userID and user id from vouch info

    // space参与人数
    // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
    const la = spaceInfo.includes.users[0].profile_image_url
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

    // const userAvatarBase64 = await url2Base64(userAvatar)
    const ssim = await compareImages(communityInfo.logo, userAvatar)
    // 品牌效应
    const brandEffect = ssim && ssim >= 0.8 ? 10 : 0
    // 听众
    const audience = participantCount
    // 邀请人数
    const inviteCount = invites.filter((inviteInfo) => {
      return inviteInfo.inviterAddress === address
        && inviteInfo.communityID === communityId
        && inviteInfo.time < spaceEndedAt
        && inviteInfo.time > validJoinStartAt
    }).length

    console.log('spaceEnded_at = ' + spaceEndedAt)
    console.log('participated = ' + participantCount)
    console.log('userAvatar = ' + userAvatar)
    //console.log('userCreatedAt = ' + userCreatedAt)
    console.log('userId = ' + userID)
    // console.log('brand = ' + brandEffect)
    // console.log(communityInfo.logo)
    // console.log(userAvatarBase64)
    await submitSpaceTask(taskId, address, spaceUrl, brandEffect, inviteCount, audience)
    spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
    isSubmitted = checkSubmit()
    submitStatus = isSubmitted ? t('task.isjoin') : t('Not Join')

    isSubmitModalOpen = false
  } catch (e) {
    showError('Submit failed.', e as Error)
  } finally {
    submitLoading = false
  }
}

let selected = $ref([])

let sendBountyLoading = $ref(false)
async function sendBountyByAo() {
  if(!task || !spaceTaskSubmitInfo || !communityInfo) {
    showError('Data loading does not completed. Please wait or try refresh.')
    return
  }

  if (selected.length > 0 && task.isCal !== 'Y'){
    showMessage('Being Cooked.')
    return
  }

  // if(blogPost.isCal === 'Y' && blogPost.isSettle === 'N'){
  sendBountyLoading = true

  const bounties:{
    walletAddress: string;
    tokenNumber: number;
    tokenType: TokenName;
  }[] = []
  const bounty1 = task.tokenNumber
  const bounty2 = task.tokenNumber1
  console.log({selected, bounty1, bounty2})
  // if no submitted info, don't need isCal==='Y'

  for (const selectedItem of selected) {
    const address = selectedItem.address
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

  // 计算应返还给任务创建人的 token
  const returnBounties = {bounty1, bounty2}
  for (const bounty of bounties) {
    if (bounty.tokenType === task.tokenType) {
      returnBounties.bounty1 -= bounty.tokenNumber
    }
    if (bounty.tokenType === task.tokenType1) {
      returnBounties.bounty2 -= bounty.tokenNumber
    }
  }

  // TODO use reduce to calculate return bounties
  // const returnBounties = bounties.reduce(bounty => {
  //   return bounty.tokenNumber
  // })

  // TODO 如果bounties.length>0 收取5%手续费

  if (bounty1 && bounty1 > 0 && bounty1 != 'undefined') {
    const bountyData = {
      walletAddress: task.ownerId,
      tokenNumber: returnBounties.bounty1,
      tokenType: task.tokenType as TokenName
    }
    bounties.push(bountyData)
  }
  if (bounty2 && bounty2 > 0 && bounty2 != 'undefined') {
    const bountyData = {
      walletAddress: task.ownerId,
      tokenNumber: returnBounties.bounty2,
      tokenType: task.tokenType1 as TokenName
    }
    bounties.push(bountyData)
  }

  // TODO try catch
  console.log('selected = ' + JSON.stringify(bounties))
  await sendBounty(task.processId, bounties)
  await updateTaskAfterSettle(task.taskId)

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
      taskId: task?.taskId,
      taskName: task?.taskName,
      communityId: communityInfo.uuid,
      communityName: communityInfo.name
    }
    sentBounties.push(sent)
  }
  await storeBounty(sentBounties)

  task = await getTask(taskId)
  console.log({ blogPostSettled: task })

  if(!selected.length) {
    showSuccess('The Bounty Has Been Returned!')
  } else {
    showSuccess('Congrats! This quest has been successfully settled.')
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

function labelName() {
  if (!spaceTaskSubmitInfo || spaceTaskSubmitInfo.length === 0 || !spaceTaskSubmitInfo) {
    return 'Return Bounty'
  } else {
    return t('Send Bounty')
  }
}

const searchKeyword = $ref('')

let filteredRows = $ref<Awaited<ReturnType<typeof getSpaceTaskSubmitInfo>>>([])
const page = $ref(1)
const pageCount = 5
let pageRows = $ref<Awaited<ReturnType<typeof getSpaceTaskSubmitInfo>>>([])
watch(() => [spaceTaskSubmitInfo, searchKeyword], () => {
  console.log('changed')
  if (!searchKeyword) {
    console.info('spaceTaskSubmitInfo as filteredRows', spaceTaskSubmitInfo)
    filteredRows = spaceTaskSubmitInfo
  }

  if (!spaceTaskSubmitInfo) filteredRows = []

  filteredRows = spaceTaskSubmitInfo.filter(info => {
    return Object.values(info).some(value => {
      return String(value).toLowerCase().includes(searchKeyword.toLowerCase())
    })
  })

  console.log('new pageRows', filteredRows.slice((page - 1) * pageCount, page * pageCount))
  pageRows = filteredRows.slice((page - 1) * pageCount, page * pageCount)
})


watch(() => selected, (newVal) => {
  const maxSelection = task ? task.rewardTotal : 1
  if (newVal.length > maxSelection) {
    alert(`Selected items exceed ${maxSelection}!`)
    // 如果选择的数量超过最大值，取消超出的选择项
    selected = newVal.slice(0, maxSelection)
  }
})
</script>

<template>
  <UDashboardPage>
    <UPage v-if="task" class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full ">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <NuxtLink :to="`/community/${communityId}`">
              <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg" />
            </NuxtLink>
          </div>
        </div>
        <!--
        <div class="mx-10">
          <UColorModeImage :src="`/task/${blogPost.image}.jpg`" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>
        -->
        <UBlogPost :key="task.taskId" :description="task.taskInfo" class="p-10">
          <template #title>
            <div class="flex justify-start">
              <div class="flex-none w-60"><div>{{ task?.taskName }}</div></div>
              <div class="flex justify-start">
                <div>
                  <UBadge color="black" variant="solid">
                    {{ finalStatus(task.isBegin) }}
                  </UBadge>
                </div>
                <div v-if="isSubmitted" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ submitStatus }}
                  </UBadge>
                </div>
                <div v-if="isOwner && task.isSettle === 'N' && task.isBegin === 'N'" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ $t('Unsettled') }}
                  </UBadge>
                </div>
              </div>
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-2">
              <div class="h-6 overflow-hidden">
                {{ task.taskInfo }}
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Time Zone") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ task.zone }}
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
                    {{ formatToLocale(task.startTime) }} - {{ formatToLocale(task.endTime) }}
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
                    {{ task.reward }}
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
                    {{ task.rewardTotal }}
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
                    {{ task.taskRule }}
                  </div>
                </div>
              </div>
              <div v-if=" isIng && !isJoined" class="flex justify-center ">
                <UButton color="white" :label="$t('Join Quest')" @click="openJoinModal" />
              </div>
            </div>
            <!--            <UDivider class="mt-4" />-->
            <div class="mt-8">
              <div class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                  <div class="mr-8">
                    {{ $t("Quests Form") }}:
                  </div>
                  <UInput v-model="searchKeyword" placeholder="Filter..." />
                </div>
                <ULink
                  :to="`https://www.ao.link/#/entity/${task.processId}?tab=incoming`"
                  active-class="text-primary"
                  target="_blank"
                  inactive-class="text-primary"
                >
                  Transaction Book
                </ULink>
              </div>
              <div v-if="isJoined || isOwner">
                <UTable v-model="selected" :rows="pageRows" :columns="columns">
                  <template #address-data="{ row }">
                    {{ isOwner ? row.address : shortAddress(row.address) }}
                  </template>
                  <template #url-data="{ row }">
                    {{ isOwner ? row.url : shortAddress(row.url) }}
                  </template>
                </UTable>
                <div class="flex justify-end mt-2">
                  <UPagination v-model="page" :page-count="pageCount" :total="filteredRows?.length || 0" />
                </div>
              </div>
            </div>

            <div v-if="isJoined || isOwner" class="flex justify-center my-8">
              <!--              <div class="mx-4">-->
              <!--                <UButton color="white" label="testuser" @click="test" />-->
              <!--              </div>-->
              <div v-if="isIng && !isSubmitted" class="mx-4">
                <UButton color="white" :label="$t('Submit Quest')" @click="openSubmitModal" />
              </div>
              <div v-if="isOwner && task.isSettle === 'N' && task.isBegin === 'N'" class="mx-4">
                <UButton color="white" :label="labelName()" :loading="sendBountyLoading" :disabled="sendBountyLoading" @click="sendBountyByAo" />
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
    <UModal v-model="isJoinModalOpen">
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
            <UButton color="white" :loading="isJoinLoading" :disabled="isJoinLoading" @click="onClickJoin">
              {{ $t('I have read all rules') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
    <UModal v-model="isSubmitModalOpen">
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
              @click="isSubmitModalOpen = false"
            />
          </div>
        </template>
        <div>
          <div class="my-8">
            <UInput v-model="spaceUrl" :model-modifiers="{trim: true}" color="primary" variant="outline" :placeholder="$t('Space Url')" />
          </div>
          <div class="flex justify-center my-8">
            <UButton :loading="submitLoading" :disabled="submitLoading" @click="submitTask">
              {{ $t("Submit Quest") }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
