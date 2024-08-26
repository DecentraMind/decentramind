<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { useTaskStore } from '~/stores/taskStore'
import { compareImages } from '~/utils/image'
import { calcBounties, formatToLocale, fractionalPart, shortString } from '~/utils'
import type {
  SpaceSubmission,
  InviteInfo,
  Task,
  TwitterSpaceInfo,
  Bounty,
  SpaceSubmissionWithCalculatedBounties,
} from '~/types'
import { DM_BOUNTY_CHARGE_PERCENT, maxTotalChances } from '~/utils/constants'
import TaskStatus from '~/components/task/TaskStatus.vue'
import { unref, watch } from 'vue'
import { useClock } from '~/composables/useClock'
import { gateways, arUrl } from '~/utils/arAssets'
const runtimeConfig = useRuntimeConfig()

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
} = useTaskStore()

const { getLocalCommunity, twitterVouchedIDs, setCurrentCommunityUuid } = $(communityStore())

const { showError, showSuccess, showMessage } = $(notificationStore())

// 用户钱包地址
const { address } = $(aoStore())
const route = useRoute()
const taskPid = $computed(() => route.params.taskId) as string

let task = $ref<Task>()

const isOwner = $computed(() => task?.ownerAddress === address)

let submissions = $ref<SpaceSubmissionWithCalculatedBounties[]>([])

const isSubmitted = $computed(() => submissions.findIndex(submission => submission.address === address) > -1)
const isJoined = $computed(() => {
  // console.log('task', task)
  return task && task.builders ? Object.keys(task.builders).findIndex(builder => builder === address) > -1 : false
})

const isIng = $computed(() => {
  return task ? now.value > task.startTime && now.value < task.endTime : false
})

const taskRewardHtml = $computed(() => {
  return task ? calcRewardHtml(task.bounties, true).join('&nbsp;+&nbsp;') : ''
})

const submittedBuilderCount = $computed(() => {
  return !task ? '' : task.submissions.reduce((set, current) => {
    set.add(current.address)
    return set
  }, new Set()).size
})

let communityInfo: Awaited<ReturnType<typeof getLocalCommunity>>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let invites: InviteInfo[]

let isLoading = $ref(true)
onMounted(async () => {
  now = useClock(3000)
  isLoading = true
  try {
    task = await getTask(taskPid)
    console.log('getTask ', task)

    if (!task) {
      throw new Error('Failed to get task ' + taskPid)
    }

    console.log({ isIng, isSettle: task.isSettled, isCal: task.isScoreCalculated })

    // TOOD invited number should calculated at AO
    invites = (await getInvitesByInviter(address)).invites

    communityInfo = await getLocalCommunity(task.communityUuid)
    setCurrentCommunityUuid(communityInfo.uuid)

    submissions = await getSubmissionsByTaskPid(taskPid)
    console.log('spaceTaskSubmitInfo = ' + JSON.stringify(submissions), taskPid)

    // TODO enable !task.isCalculated condition
    if (
      // !task.isCalculated &&
      now.value >= task.endTime &&
      !task.isSettled
    ) {
      submissions = calcScore(submissions)
      console.log('score calculated submissions ', submissions)

      if (isOwner) {
        await setTaskIsCalculated(taskPid)
        await updateTaskSubmissions(taskPid, submissions)
        // refetch task info
        task = await getTask(taskPid)
      }
    }

    console.log({ isSubmitted })
  } catch (e) {
    console.error(e)
    // TODO show a page size error overlay and reload button
    // if (!task) {
    //   showErrorOverlay = true
    // }
    showError('Data loading failed.')
  } finally {
    isLoading = false
  }
})

const columns = [{
  key: 'id',
  label: 'ID',
}, {
  key: 'address',
  label: t('Wallet'),
  rowClass: 'font-mono'
}, {
  key: 'brandEffect',
  label: t('Brand'),
  class: 'text-right',
  rowClass: 'font-mono text-right'
}, {
  key: 'inviteCount',
  label: t('Friends'),
  class: 'text-right',
  rowClass: 'font-mono text-right'
}, {
  key: 'audience',
  label: t('Popularity'),
  class: 'text-right',
  rowClass: 'font-mono text-right'
}, {
  key: 'url',
  label: t('URL'),
}, {
  key: 'score',
  label: t('Total Score'),
  class: 'text-right',
  rowClass: 'font-mono text-right'
}, {
  key: 'rewardHtml',
  label: t('Bounty'),
  class: 'text-right',
  rowClass: 'font-mono'
}]

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

    if (!matched || !matched[2]) {
      throw new Error('Invalid space URL.')
    }
    const spaceId = matched[2]

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
    const userAvatar = host?.profile_image_url.replace(/_(normal|bigger|mini).jpg$/, '.jpg')
    // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
    // const userCreatedAt = data._rawValue.includes.users[0].created_at

    // const userAvatarBase64 = await url2Base64(userAvatar)
    // TODO use https://dms.4everland.store/... as communityLogo
    const ssim = userAvatar
      ? await compareImages(arUrl(communityInfo.logo, gateways.ario), userAvatar)
      : 0
    console.log({ ssim, communityLogo: arUrl(communityInfo.logo, gateways.ario), twitterUserAvatar: userAvatar})
    
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

    const spaceSubmission:Omit<SpaceSubmission, 'id'|'createTime'> = {
      taskPid,
      address,
      brandEffect,
      inviteCount,
      audience,
      url: spaceUrl,
      // TODO calculate score at server side or at AO
      score: 0
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

let selectedSubmission = $ref<SpaceSubmissionWithCalculatedBounties[]>([])

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

  if (selectedSubmission.length === 0 && task.submissions.length > 0) {
    if(!confirm('Confirm skipping all submissions?')) {
      return
    }
  }

  sendBountyLoading = true

  try {
    const selectedTotalScore = selectedSubmission.reduce((total, submission) => {
      total += submission.score
      return total
    }, 0)
    console.group('Bounty calculating')
    submissions.map(s => s.calculatedBounties).forEach(i => console.table(i))

    submissions.forEach(submission => {
      const calculated = calcBounties(submission, selectedTotalScore, task!.bounties)

      submission.calculatedBounties = calculated as Task['bounties']
    })

    console.log('calculated bounties')
    submissions.map(s => s.calculatedBounties).forEach(i => console.table(i))
    console.groupEnd()

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
          amount: returnBounty.amount * (DM_BOUNTY_CHARGE_PERCENT / 100),
          quantity: returnBounty.quantity * BigInt(DM_BOUNTY_CHARGE_PERCENT) / 100n,
        })
      }
    }

    console.log('bounties to send:', {bounties, submissions, refoundMap})
    
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
    console.log({ taskAfterSettled: task })

    if (!selectedSubmission.length) {
      showSuccess('The Bounty Has Been Returned!')
    } else {
      showSuccess('Congrats! This quest has been successfully settled.')
    }
  } catch (e) {
    console.error(e)
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

let filteredRows = $ref<SpaceSubmissionWithCalculatedBounties[]>([])
const page = $ref(1)
let pageSize = $ref<number>(maxTotalChances)
let pageRows = $ref<SpaceSubmissionWithCalculatedBounties[]>([])

const precisions = $computed(() => task?.bounties.reduce((carry, bounty) => {
    carry.set(bounty.tokenProcessID, fractionalPart(bounty.amount).length)
    return carry
  }, new Map<string, number>())
)

watch(
  () => [submissions, searchKeyword, page],
  () => {
    console.log('page rows should change')

    filteredRows = searchKeyword ? submissions : submissions.filter(info => {
      return Object.values(info).some(value => {
        return String(value).toLowerCase().includes(searchKeyword.toLowerCase())
      })
    })

    pageSize = task
      ? task.totalChances >= submissions.length ? submissions.length : Math.max(task.totalChances, 10)
      : maxTotalChances

    pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize).map(submission => {
      submission.rewardHtml = calcRewardHtml(submission.calculatedBounties, true, precisions).join('&nbsp;+&nbsp;')
      return submission
    })
    // console.log('new pageRows', pageRows)
  },
)

watch(
  () => selectedSubmission,
  newVal => {
    const maxSelection = task ? task.totalChances : 1
    if (newVal.length > maxSelection) {
      showMessage(`Selected items exceed ${maxSelection}!`)
      // 如果选择的数量超过最大值，取消超出的选择项
      selectedSubmission = newVal.slice(0, maxSelection)

    }

    const selectedTotalScore = selectedSubmission.reduce((total, submission) => {
      total += submission.score
      return total
    }, 0)
    if (!selectedTotalScore) return
    
    selectedSubmission.forEach(submission => {
      const calculated = calcBounties(submission, selectedTotalScore, task!.bounties)

      submission.calculatedBounties = calculated as Task['bounties']
      submission.rewardHtml = calcRewardHtml(submission.calculatedBounties, true, precisions).join('&nbsp;+&nbsp;')
    })
    console.log('calculated bounties')
    submissions.map(s => s.calculatedBounties).forEach(i => console.table(i))
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

        <UBlogPost
          v-if="!isLoading"
          :key="task.processID"
          :title="task.name"
          :description="task.intro"
          class="px-10 pt-0 pb-10"
          :ui="{title: 'text-3xl mb-6 text-clip'}"
        >
          <template #description>
            <div class="flex flex-col space-y-6">
              <div class="text-justify text-md leading-8">
                {{ task.intro }}
              </div>
              <TaskStatus size="lg" :task="task" :address="address" />

              <UDivider />

              <div class="flex">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('Time Zone') }}</div>
                </div>
                <div>
                  {{ task.timezone }}
                </div>
              </div>
              <div class="flex">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('Time') }}</div>
                </div>
                <div>
                  {{ formatToLocale(task.startTime) }} -
                  {{ formatToLocale(task.endTime) }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('Bounty') }}</div>
                </div>
                <div class="flex-center" v-html="taskRewardHtml" />
              </div>
              <div class="flex justify-start">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('Total Chances') }}</div>
                </div>
                <div>
                  {{ task.totalChances }}
                </div>
              </div>
              <div class="flex justify-start">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('builders now') }}</div>
                </div>
                <div>
                  {{ isLoading ? '' : submittedBuilderCount }}
                </div>
              </div>
              <div>
                <p class="font-semibold mb-2">
                  {{ $t('Rules of the Quest') }}
                </p>
                <p class="leading-8 whitespace-pre-line">
                  {{ task.rule }}
                </p>
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

            <div class="mt-8">
              <div
                class="flex-center !justify-between py-3.5 border-b border-gray-300 dark:border-gray-700"
              >
                <div class="flex items-center">
                  <div class="font-semibold w-44">{{ $t('Quests Form') }}</div>
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

              <div v-if="isJoined || isOwner || runtimeConfig.public.debug">
                <UTable
                  v-model="selectedSubmission"
                  :rows="pageRows"
                  :columns="columns"
                  :loading="isLoading"
                >
                  <template #id-data="{ row }">
                    {{ row.id }}
                  </template>
                  <template #address-data="{ row }">
                    {{ isOwner ? row.address : shortString(row.address, 4) }}
                  </template>
                  <template #url-data="{ row }">
                    {{ row.url.replace(/^https?:\/\//, '').replace(/\/peek$/, '') }}
                  </template>
                  <template #score-data="{ row }">
                    {{ task.isScoreCalculated ? row.score.toFixed(2) : '/' }}
                  </template>
                  <template #rewardHtml-data="{ row }">
                    <p class="flex justify-end" v-html="task.isSettled || selectedSubmission.find(s => s.id === row.id) ? row.rewardHtml : '/'" />
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

            <div v-if="!isLoading && isOwner && !task.isSettled && now >= task.endTime" class="flex-center">
              <UButton
                color="white"
                :label="sendBountyBtnLabel()"
                :loading="sendBountyLoading"
                :disabled="sendBountyLoading"
                @click="onClickSendBounty"
              />
            </div>

            <div class="mt-4">
              <h4 class="font-semibold mb-2">{{ $t('Rules of Judgment') }}</h4>
              <p class="leading-6 text-gray-400 text-sm">
                1 Total score is 100 including Brand 10%, Friends 40%,
                Popularity 50%.
                <br>
                2 Brand is decided by your avatar, change it you’ll get 10,
                not change get 0.
                <br>
                3 Friends is decided by the number of users invited through your quest invitation.
                <br>
                4 Popularity is decided by the amount of audience in your
                Twitter Space.
                <br>
                5 The person with the highest data gets the maximum scores
                including Brand, Friends and Popularity.
                <br>
                6 Everyone will have a total score, it decide the amount of
                your bounty.
                <br>
                7 If the total chances are 20 but you are in 21st, sorry you
                can get nothing.
                <br>8 You only have 1 chance for this quest.
                <br>
                9 If no one meets the bounty, the bounty will be returned to
                the bounty owner's wallet.
              </p>
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
