<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { taskStore } from '~/stores/taskStore'
import { compareImages } from '~/utils/image'
import { formatToLocale, shortString } from '~/utils/util'
import type {
  SpaceSubmission,
  InviteInfo,
  Task,
  TwitterSpaceInfo,
  Bounty,
  SpaceSubmissionWithCalculatedBounties,
} from '~/types'
import { DM_BOUNTY_CHARGE_RATE, maxTotalChances, tokens } from '~/utils/constants'
import TaskStatus from '~/components/task/TaskStatus.vue'
import { unref, watch } from 'vue'
import { useClock } from '~/composables/useClock'
import { gateways, arUrl } from '~/utils/arAssets'

let now: Ref<number>

const { t } = useI18n()

const {
  storeBounty,
  sendBounty,
  setTaskIsSettled,
  getInvitesByInviter,
  updateTaskSubmissions,
  setTaskIsCalculated,
  getTask,
  submitSpaceTask,
  joinTask,
  getSubmissionsByTaskPid,
} = $(taskStore())

const { getLocalCommunity, twitterVouchedIDs } = $(communityStore())

const { showError, showSuccess, showMessage } = $(notificationStore())

// 用户钱包地址
const { address } = $(aoStore())
const route = useRoute()
const taskPid = $computed(() => route.params.taskId) as string

let task = $ref<
  Task & {
    reward: string
  }
>()

const isOwner = $computed(() => task?.ownerAddress === address)

let submissions = $ref<SpaceSubmissionWithCalculatedBounties[]>([])

const isSubmitted = $computed(() => submissions.findIndex(submission => submission.address === address) > -1)
const isJoined = $computed(() => {
  console.log('task', task)
  return task && task.builders ? Object.keys(task.builders).findIndex(builder => builder === address) > -1 : false
})

const isIng = $computed(() => {
  return task ? now.value > task.startTime && now.value < task.endTime : false
})

let submittedBuilderCount = $ref<number>(0)

let communityInfo: Awaited<ReturnType<typeof getLocalCommunity>>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let invites: InviteInfo[]

let isLoading = $ref(false)
onMounted(async () => {
  now = useClock(3000)
  isLoading = true
  try {
    task = await getTask(taskPid)
    console.log('getTask ' + JSON.stringify(task))

    if (!task) {
      throw new Error('Failed to get task ' + taskPid)
    }

    console.log({ isIng, isSettle: task.isSettled, isCal: task.isScoreCalculated })

    invites = (await getInvitesByInviter(address)).invites

    communityInfo = await getLocalCommunity(task.communityUuid)
    submissions = await getSubmissionsByTaskPid(taskPid)
    console.log('spaceTaskSubmitInfo = ' + JSON.stringify(submissions), taskPid)

    if (submissions && submissions.length !== 0) {
      // TODO update task.submittedCount after every task submit in cronjob
      submittedBuilderCount = submissions.reduce((set, current) => {
        set.add(current.address)
        return set
      }, new Set()).size

      // TODO enable !task.isCalculated condition
      if (
        // !task.isCalculated &&
        now.value >= task.endTime &&
        !task.isSettled
      ) {
        calculateScore()
        // console.log('after cal spaceTaskSubmitInfo = ' + spaceTaskSubmitInfo)

        if (isOwner) {
          await setTaskIsCalculated(taskPid)
          await updateTaskSubmissions(taskPid, submissions)
          // refetch task info
          task = await getTask(taskPid)
        }
      }
    }

    console.log({ isSubmitted })
  } catch (e) {
    console.error(e)
    showError('Data loading failed.')
  } finally {
    isLoading = false
  }
})

function calculateScore() {
  if (!submissions || !task) return
  // 找到friends和audience的最大值
  submissions.sort((a, b) => b.inviteCount - a.inviteCount)
  const getPersonMax = submissions[0].inviteCount
  submissions.sort((a, b) => b.audience - a.audience)
  const audienceMax = submissions[0].audience
  console.log('getPersonMax = ' + getPersonMax)
  console.log('audienceMax = ' + audienceMax)
  let totalScore = 0
  let friendScore = 0
  let audienceScore = 0

  for (const submission of submissions) {
    if (getPersonMax != 0) {
      friendScore = (submission.inviteCount / getPersonMax) * 40
    }
    if (audienceMax != 0) {
      audienceScore = (submission.audience / audienceMax) * 50
    }
    let brandScore = 0
    if (submission.brandEffect === 10) {
      brandScore = 10
    }
    console.log('friendScore = ' + friendScore)
    console.log('audienceScore = ' + audienceScore)
    console.log('brandScore = ' + brandScore)

    submission.score = friendScore + audienceScore + brandScore

    totalScore += submission.score

  }
  console.log('totalScore = ' + totalScore)

  for (const submission of submissions) {

    submission.calculatedBounties.forEach(bounty => {
      if (!bounty.tokenName) return

      const token = tokens[bounty.tokenName as TokenName]
      if (!token) {
        throw new Error(`Bounty token ${bounty.tokenName} not supported.`)
      }
      // TODO 5% 手续费
      const bountyToSend =
        (submission.score / totalScore) * Number(bounty.amount)
      bounty.amount = Number(bountyToSend.toFixed(4))

      submission.bounty +=
        (submission.bounty ? ' ' : '') +
        (bountyToSend / Math.pow(10, token.denomination)).toString() +
        bounty.tokenName
    })

    console.log('calculated submitInfo ' + submission)
  }
}


const columns = [
  {
    key: 'uuid',
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
    key: 'inviteCount',
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

let isSubmitModalOpen = $ref(false)
let isJoinModalOpen = $ref(false)

function openSubmitModal() {
  // TODO check if vouched, if not, show a modal with a link to vouch page, and a 'I'm vouched' button to verify and update vouched state
  isSubmitModalOpen = true
}

function openJoinModal() {
  // TODO check if vouched, if not, show a modal with a link to vouch page, and a 'I'm vouched' button to verify and update vouched state
  isJoinModalOpen = true
}

let isJoinLoading = $ref(false)
async function onClickJoin() {
  isJoinLoading = true
  await joinTask(taskPid, address)
  task = await getTask(taskPid)
  isJoinModalOpen = false
  isJoinLoading = false
}

const spaceUrl = $ref('')
let submitLoading = $ref(false)

async function onClickSubmit() {
  submitLoading = true

  try {
    if (!submissions || !invites || !communityInfo || !task) {
      throw new Error(
        'Data loading does not completed. Please wait or try refresh.',
      )
    }
    // TODO enable this
    // if (!twitterVouchedIDs.length) {
    //   throw new Error('You are not vouched.')
    // }

    // for (let i = 0;i < spaceTaskSubmitInfo.length;i++) {
    //   if (spaceTaskSubmitInfo[i].address === address) {
    //     throw new Error('You have submitted this quest.')
    //   }
    // }
    // TODO 调用提交space链接并解析方法
    const matched = spaceUrl.trim().match(/(x|twitter)\.com\/i\/spaces\/([^/]+)\/?/)

    if (!matched || !matched[1]) {
      throw new Error('Invalid space URL.')
    }
    const spaceId = matched[1]

    const { data, error } = await useFetch(
      '/api/twitter?' + new URLSearchParams({ spaceId }),
    ).json<TwitterSpaceInfo>()
    const spaceInfo = unref(data)

    if (error.value || !spaceInfo) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate space URL.')
    }

    console.log('data from twitter = ', spaceInfo)

    const {
      started_at,
      ended_at,
      participant_count: participantCount,
    } = spaceInfo.data
    const spaceStartAt = new Date(started_at).getTime()
    const spaceEndedAt = new Date(ended_at).getTime()
    const validJoinStartAt = new Date(
      spaceEndedAt - 24 * 60 * 60 * 1000,
    ).getTime()

    const minuteDifference = (spaceEndedAt - spaceStartAt) / (1000 * 60)
    // TODO enable this
    // if (minuteDifference < 15) {
    //   throw Error('Space lasts less than 15 minutes')
    // }

    const hostID = spaceInfo.data.creator_id
    const host = spaceInfo.includes.users.find(user => user.id === hostID)
    const hostHandle = host?.username
    // TODO enable this
    // if (!host || !twitterVouchedIDs.find(id => id === hostHandle)) {
    //   throw new Error('You are not the space host.')
    // }

    // space参与人数
    // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
    // const la = host.profile_image_url
    // const resp = la.split('_')
    // let url = ''
    // for (let i = 0;i < resp.length - 1;++i) {
    //   url = url + resp[i]
    //   if (i != resp.length - 2) {
    //     url += '_'
    //   }
    // }
    // url = url + '.png'
    const userAvatar = host?.profile_image_url
    // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
    // const userCreatedAt = data._rawValue.includes.users[0].created_at

    // const userAvatarBase64 = await url2Base64(userAvatar)
    const ssim = userAvatar
      ? await compareImages(arUrl(communityInfo.logo, gateways.ario), userAvatar)
      : 0
    console.log({ ssim })
    // TODO brandEffect, inviteCount, audience should be calculated again under task owner's login session
    // 品牌效应
    const brandEffect = ssim && ssim >= 0.8 ? 10 : 0
    // 听众
    const audience = participantCount
    // 邀请人数
    const inviteCount = invites.filter(inviteInfo => {
      return (
        inviteInfo.inviterAddress === address &&
        inviteInfo.communityID === task!.communityUuid &&
        inviteInfo.time < spaceEndedAt &&
        inviteInfo.time > validJoinStartAt
      )
    }).length

    console.log('spaceEnded_at = ' + spaceEndedAt)
    console.log('participated = ' + participantCount)
    console.log('userAvatar = ' + userAvatar)
    const spaceSubmission:SpaceSubmission = {
      uuid: createUuid(), // will be override by task manager process
      taskPid,
      address,
      brandEffect,
      inviteCount,
      audience,
      url: spaceUrl,
      score: 0,
      bounty: '0'
    }

    await submitSpaceTask(spaceSubmission)
    submissions = await getSubmissionsByTaskPid(taskPid)

    isSubmitModalOpen = false
  } catch (e) {
    console.error(e)
    showError('Submit failed.', e as Error)
  } finally {
    submitLoading = false
  }
}

let selectedSubmission = $ref<SpaceSubmission[]>([])

let sendBountyLoading = $ref(false)
async function onClickSendBounty() {
  if (!task || !submissions || !communityInfo) {
    showError('Data loading does not completed. Please wait or try refresh.')
    return
  }

  // if no submitted info, don't need isScoreCalculated
  if (selectedSubmission.length > 0 && !task.isScoreCalculated) {
    showMessage('Being Cooked.')
    return
  }

  sendBountyLoading = true

  try {
    /** bounties to send */
    const bounties: Bounty[] = []

    console.log({ selected: selectedSubmission })

    /** bounties that should send back to the task owner */
    const refoundMap = task.bounties.reduce((returnBounties, taskBounty) => {
      const { tokenProcessID: pid } = taskBounty
      if(!returnBounties[pid]) {
        returnBounties[pid] = {
          taskPid,
          sender: task!.ownerAddress,
          recipient: task!.ownerAddress,
          tokenProcessID: pid,
          amount: taskBounty.amount,
          quantity: BigInt(taskBounty.quantity)
        }
      }
      returnBounties[pid].amount += taskBounty.amount
      returnBounties[pid].quantity += BigInt(taskBounty.quantity)
      return returnBounties
    }, {} as Record<string, Bounty>)

    const selectedSubmitters = selectedSubmission.map(submission => submission.address)
    submissions.filter(submission => selectedSubmitters.includes(submission.address)).forEach(submission => {
      submission.calculatedBounties.forEach(bounty => {
        const pid = bounty.tokenProcessID
        const bountyData = {
          taskPid,
          sender: task!.ownerAddress,
          recipient: submission.address,
          tokenProcessID: pid,
          amount: bounty.amount,
          quantity: bounty.quantity,
        }

        refoundMap[pid].amount -= bounty.amount
        refoundMap[pid].quantity -= BigInt(bounty.quantity)

        bounties.push(bountyData)
      })

      // TODO add bountyData of 5%

      // const bountyData = {
      //         recipient: ,
      //         quantity: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty2)),
      //         tokenProcessID: spaceTaskSubmitInfo[j].bountyType2,
      //       }
    })

    for (const [tokenPid, returnBounty] of Object.entries(refoundMap)) {
      if (bounties.length) {
        // add DecentraMind bounty service charges if any bounty send to winner
        bounties.push({
          taskPid,
          sender: task!.ownerAddress,
          recipient: decentraMindReceiver,
          tokenProcessID: tokenPid,
          amount: returnBounty.amount * DM_BOUNTY_CHARGE_RATE,
          quantity: returnBounty.quantity * BigInt(DM_BOUNTY_CHARGE_RATE),
        })
      }
    }

    // TODO try catch
    await sendBounty(task.processID, bounties)
    await setTaskIsSettled(task.processID)

    // await sendBounty('Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I', bounties)
    // 将发送出去的bounty信息保存
    const sentBounties = []
    for (const bounty of bounties) {
      const sent = {
        ...bounty,
        communityUuid: communityInfo.uuid,
        communityName: communityInfo.name,
      }
      sentBounties.push(sent)
    }
    await storeBounty(task.processID, sentBounties)

    task = await getTask(taskPid)
    console.log({ blogPostSettled: task })

    if (!selectedSubmission.length) {
      showSuccess('The Bounty Has Been Returned!')
    } else {
      showSuccess('Congrats! This quest has been successfully settled.')
    }
  } catch (e) {
    showError('Send bounty failed.', e as Error)
  } finally {
    sendBountyLoading = false
  }
}

function sendBountyBtnLabel() {
  if (!submissions || submissions.length === 0 || !submissions) {
    return 'Return Bounty'
  } else {
    return t('Send Bounty')
  }
}

const searchKeyword = $ref('')

let filteredRows = $ref<Awaited<ReturnType<typeof getSubmissionsByTaskPid>>>([])
const page = $ref(1)
let pageSize = $ref<number>(maxTotalChances)
let pageRows = $ref<Awaited<ReturnType<typeof getSubmissionsByTaskPid>>>([])

watch(
  () => [submissions, searchKeyword, page],
  () => {
    console.log('page rows should change')
    if (!searchKeyword) {
      console.info('spaceTaskSubmitInfo as filteredRows', submissions)
      filteredRows = submissions
    }

    if (!submissions) filteredRows = []

    filteredRows = submissions.filter(info => {
      return Object.values(info).some(value => {
        return String(value).toLowerCase().includes(searchKeyword.toLowerCase())
      })
    })

    pageSize = task
      ? task.totalChances >= submissions.length ? submissions.length : Math.max(task.totalChances, 10)
      : maxTotalChances

    console.log(
      'new pageRows',
      filteredRows.slice((page - 1) * pageSize, page * pageSize),
    )
    pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)
  },
)

watch(
  () => selectedSubmission,
  newVal => {
    const maxSelection = task ? task.totalChances : 1
    if (newVal.length > maxSelection) {
      alert(`Selected items exceed ${maxSelection}!`)
      // 如果选择的数量超过最大值，取消超出的选择项
      selectedSubmission = newVal.slice(0, maxSelection)
    }
  },
)
</script>

<template>
  <UDashboardPage>
    <UPage v-if="task" class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <NuxtLink :to="`/community/${task.communityUuid}`">
              <UButton
                icon="i-heroicons-x-mark-20-solid"
                color="white"
                variant="solid"
                size="lg"
              />
            </NuxtLink>
          </div>
        </div>
        <!--
        <div class="mx-10">
          <UColorModeImage :src="`/task/${blogPost.image}.jpg`" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>
        -->
        <UBlogPost :key="task.processID" :description="task.intro" class="p-10">
          <template #title>
            <div class="flex flex-col justify-start">
              <div class="flex-none w-44">
                <div>{{ task.name }}</div>
              </div>
              <TaskStatus :task="task" :address="address" />
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-4">
              <div class="h-6 overflow-hidden">
                {{ task.intro }}
              </div>
              <div class="flex">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('Time Zone') }}</div>
                </div>
                <div>
                  {{ task.timezone }}
                </div>
              </div>
              <div class="flex">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('Time') }}</div>
                </div>
                <div>
                  {{ formatToLocale(task.startTime) }} -
                  {{ formatToLocale(task.endTime) }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('Bounty') }}</div>
                </div>
                <div>
                  {{ task.reward }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('Total Chances') }}</div>
                </div>
                <div>
                  {{ task.totalChances }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('builders now') }}</div>
                </div>
                <div>
                  {{ isLoading ? '' : submittedBuilderCount }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-medium w-44 shrink-0">
                  <div>{{ $t('Rules of the Quest') }}</div>
                </div>
                <div style="white-space: pre-line">
                  {{ task.rule }}
                </div>
              </div>
              <div
                v-if="!isLoading && isIng && !isJoined"
                class="flex justify-center"
              >
                <UButton
                  color="white"
                  :label="$t('Join Quest')"
                  @click="openJoinModal"
                />
              </div>
            </div>
            <!--            <UDivider class="mt-4" />-->
            <div class="mt-8">
              <div
                class="flex-center !justify-between py-3.5 border-b border-gray-300 dark:border-gray-700"
              >
                <div class="flex items-center">
                  <div class="font-medium w-44">{{ $t('Quests Form') }}</div>
                  <UInput v-model="searchKeyword" placeholder="Filter..." />
                </div>
                <ULink
                  :to="`https://www.ao.link/#/entity/${task.processID}?tab=incoming`"
                  active-class="text-primary"
                  target="_blank"
                  inactive-class="text-primary"
                >
                  Transaction Book
                </ULink>
              </div>
              <div v-if="isJoined || isOwner">
                <UTable
                  v-model="selectedSubmission"
                  :rows="pageRows"
                  :columns="columns"
                  :loading="isLoading"
                >
                  <template #uuid-data="{ row }">
                    {{ isOwner ? row.uuid : shortString(row.uuid, 4) }}
                  </template>
                  <template #address-data="{ row }">
                    {{ isOwner ? row.address : shortString(row.address, 4) }}
                  </template>
                  <template #url-data="{ row }">
                    {{ row.url.replace(/^https?:\/\//, '').replace(/\/peek$/, '') }}
                  </template>
                </UTable>
                <div class="flex justify-end mt-2">
                  <UPagination
                    v-model="page"
                    :page-count="pageSize"
                    :total="filteredRows?.length || 0"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="!isLoading && isJoined"
              class="flex justify-center my-8"
            >
              <!-- TODO v-if="isIng && !isSubmitted" -->
              <div v-if="isIng" class="mx-4">
                <UButton
                  color="white"
                  :label="$t('Submit Quest')"
                  @click="openSubmitModal"
                />
              </div>
            </div>

            <div v-if="!isLoading && isOwner && !task.isSettled && now >= task.endTime">
              <UButton
                color="white"
                :label="sendBountyBtnLabel()"
                :loading="sendBountyLoading"
                :disabled="sendBountyLoading"
                @click="onClickSendBounty"
              />
            </div>

            <div class="flex mt-4">
              <div class="font-medium w-44 shrink-0">
                <div>{{ $t('Rules of Judgment') }}</div>
              </div>
              <div>
                <p>
                  1 Total score is 100 including Brand 10%, Friends 40%,
                  Popularity 50%.
                </p>

                <p>
                  2 Brand is decided by your avatar, change it you’ll get 10,
                  not change get 0.
                </p>

                <p>
                  3 Fri ends is decided by the number of users invited through your quest invitation.
                </p>

                <p>
                  4 Popularity is decided by the amount of audience in your
                  Twitter Space.
                </p>

                <p>
                  5 The person with the highest data gets the maximum scores
                  including Brand, Friends and Popularity.
                </p>

                <p>
                  6 Everyone will have a total score, it decide the amount of
                  your bounty.
                </p>

                <p>
                  7 If the total chances are 20 but you are in 21st, sorry you
                  can get nothing.
                </p>

                <p>8 You only have 1 chance for this quest.</p>
                <p>
                  9 If no one meets the bounty, the bounty will be returned to
                  the bounty owner's wallet.
                </p>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </UPage>
    <UModal v-model="isJoinModalOpen">
      <UCard>
        <div class="space-y-2">
          <div class="flex flex-col justify-center">
            <div class="text-center">
              <p v-html="$t('task.spaceJoinModal', { lineBreak: '<br>' })" />
            </div>
          </div>

          <div class="flex justify-center">
            <UButton
              color="white"
              :loading="isJoinLoading"
              :disabled="isJoinLoading"
              @click="onClickJoin"
            >
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
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{ $t('Submit Quest') }}
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
            <UInput
              v-model="spaceUrl"
              :model-modifiers="{ trim: true }"
              color="primary"
              variant="outline"
              :placeholder="$t('Space Url')"
            />
          </div>
          <div class="flex justify-center my-8">
            <UButton
              :loading="submitLoading"
              :disabled="submitLoading"
              @click="onClickSubmit"
            >
              {{ $t('Submit Quest') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
