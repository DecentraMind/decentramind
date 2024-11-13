<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import {
  calcBounties,
  formatToLocale,
  fractionalPart,
} from '~/utils'
import type {
  Task,
  Bounty,
  BountySendHistory,
  InviteCodeInfo,
  AllSubmissionWithCalculatedBounties,
  TaskWithLink,
  SubmissionUpdateResponse,
  ValidatedTweetInfo,
  ValidatedSpacesInfo,
} from '~/types'
import { DM_BOUNTY_CHARGE_PERCENT } from '~/utils/constants'
import TaskStatus from '~/components/task/TaskStatus.vue'
import { watch } from 'vue'
import { useClock } from '~/composables/useClock'
import validateTaskData from '~/utils/validateTaskData'
import { useTaskScoreCalculate } from '~/composables/tasks/useTaskScoreCalculate'
import { tweetUrlSchema } from '~/utils/schemas'
import { useFetch } from '@vueuse/core'
import { useSignature } from '~/composables/useSignature'
import { fetchSpacesInfo, fetchTweetInfo } from '~/utils/twitter/twitter.client'
import { saveSpaceTaskSubmitInfo, saveTweetTaskSubmitInfo } from '~/utils/task'
import TaskSubmissionTable from '~/components/task/SubmissionTable.vue'

const runtimeConfig = useRuntimeConfig()

let now: Ref<number>

const { t } = useI18n()

const {
  storeBounty,
  sendBounty,
  getInvitesByInviter,
  updateTaskSubmissions,
  updateTaskScores,
  getTask,
  joinTask,
  createTaskInviteCode
} = useTaskStore()


const { getLocalCommunity, twitterVouchedIDs, setCurrentCommunityUuid } = $(
  communityStore(),
)

const { showError, showSuccess, showMessage } = $(notificationStore())

const { address } = $(aoStore())
const route = useRoute()
const taskPid = $computed(() => route.params.taskId) as string

let task = $ref<Task>()

const isSubmitted = $computed(
  () =>
    submissions.findIndex(submission => submission.address === address) > -1,
)
const isJoined = $computed(() => {
  // console.log('task', task)
  return task && task.builders
    ? Object.keys(task.builders).findIndex(builder => builder === address) > -1
    : false
})

const isIng = $computed(() => {
  return task ? now.value > task.startTime && now.value < task.endTime : false
})

const taskRewardHtml = $computed(() => {
  return task?.bounties
    ? calcRewardHtml(task.bounties, true).join('&nbsp;+&nbsp;')
    : ''
})

const submittedBuilderCount = $computed(() => {
  return !task?.submissions
    ? ''
    : task.submissions.reduce((set, current) => {
        set.add(current.address)
        return set
      }, new Set()).size
})

let communityInfo: Awaited<ReturnType<typeof getLocalCommunity>>

const isOwner = $computed(() => task?.ownerAddress === address || communityInfo?.owner === address)

const isAdminOrOwner = $computed(
  () =>
    task?.ownerAddress === address || communityInfo.admins.includes(address),
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let invites: InviteCodeInfo[]

const submissions = $computed(
  () => task?.submissions as AllSubmissionWithCalculatedBounties[],
)

let isLoading = $ref(true)
onMounted(async () => {
  now = useClock(3000)
  isLoading = true
  try {
    task = await getTask(taskPid, address)
    console.log('getTask ', task)

    if (!task) {
      throw new Error('Failed to get task ' + taskPid)
    }

    if (!task.inviteCode && address) {
      task.inviteCode = await createTaskInviteCode(taskPid)
      // console.log('create invite code ', task.inviteCode)
    }

    // if the task status(from not started to ing, or from ing to ended) changes with time, refresh current page
    watch(() => now.value, (newVal, oldVal) => {
      if (!task) return

      if ((newVal >= task.startTime && oldVal < task.startTime) || (newVal >= task.endTime && oldVal < task.endTime)) {
        // same as window.location.reload()
        reloadNuxtApp()
      }
    })

    // console.log({ isIng, isSettle: task.isSettled, isCal: task.isScoreCalculated })

    // TOOD invited number should calculated at AO
    invites = (await getInvitesByInviter(address, 'task')).invites

    communityInfo = await getLocalCommunity(task.communityUuid)
    setCurrentCommunityUuid(communityInfo.uuid);

    (task.submissions as AllSubmissionWithCalculatedBounties[]).forEach(s => {
      s.rewardHtml = calcRewardHtml(
        s.calculatedBounties,
        true,
        precisions,
        'font-semibold',
      ).join('&nbsp;+&nbsp;')
      // console.log('rewardHtml', s.rewardHtml, s.calculatedBounties)
    })
    // console.log('spaceTaskSubmitInfo = ', {submissions, taskPid})

    if (
      (runtimeConfig.public.debug || !task.isScoreCalculated) &&
      now.value >= task.endTime &&
      !task.isSettled &&
      isOwner
    ) {
      const { getSignature, error: signatureError } = useSignature()
      if (signatureError.value) {
        throw new Error('Failed to update submissions, can\'t get signature: ' + signatureError.value)
      }

      const { signature, address, publicKey, message } = await getSignature(taskPid)
  
      console.log('signature', signature, address)
      
      // validate and update task submissions at DecentraMind server
      const { data, error } = await useFetch(
        '/api/updateTaskSubmissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taskPid,
            signature,
            address,
            publicKey,
            message
          })
        }
      ).json<SubmissionUpdateResponse>()
      const submissionUpdateResponse = unref(data)

      if (error.value) {
        console.error('updateTaskSubmissions error', {data: data.value, error: error.value})
        throw new Error('Failed to update submissions: ' + error.value)
      }

      console.log('submissionUpdateResponse', submissionUpdateResponse)
      task = await getTask(taskPid, address)

      const updatedSubmissions = useTaskScoreCalculate(task, task.submissions as AllSubmissionWithCalculatedBounties[])
      console.log('score calculated submissions ', submissions)

      // save submission scores and set task.isScoreCalculated
      const scores = updatedSubmissions.map(s => {
        return {
          id: s.id,
          score: s.score,
        }
      })
      // TODO move this step to server
      await updateTaskScores(taskPid, scores)
      task.submissions = updatedSubmissions
      // refetch task info
      task = await getTask(taskPid, address)
    }

    // console.log({ isSubmitted })
  } catch (e) {
    console.error(e)
    // TODO show a page size error overlay and reload button
    // if (!task) {
    //   showErrorOverlay = true
    // }
    showError('Data loading failed.', e as Error)
  } finally {
    isLoading = false
  }
})

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
  await joinTask(taskPid)
  task = await getTask(taskPid, address)
  isJoinModalOpen = false
  isJoinLoading = false
}

const tweetUrlForm = $ref({
  url: '',
})

let submitTweetUrlLoading = $ref(false)
async function onSubmitTweetUrl() {
  submitTweetUrlLoading = true
  try {
    if (!submissions || !invites || !communityInfo || !task) {
      throw new Error('Data loading not completed. Please wait or try refresh.')
    }

    if (!twitterVouchedIDs.length && !runtimeConfig.public.debug) {
      throw new Error('You are not vouched.')
    }

    if (isSubmitted && !runtimeConfig.public.debug) {
      throw new Error('You have submitted this quest.')
    }

    const data = await fetchTweetInfo([tweetUrlForm.url])
    const tweetInfo = validateTaskData<ValidatedTweetInfo>({ task, data, mode: 'add', twitterVouchedIDs })
    if (tweetInfo) {
      await saveTweetTaskSubmitInfo({
        submitterAddress: address,
        taskEndTime: task.endTime,
        data: tweetInfo,
        taskPid,
        communityUuid: communityInfo.uuid,
        invites,
        mode: 'add',
        url: tweetUrlForm.url,
      })
    }

    task = await getTask(taskPid, address)

    isSubmitModalOpen = false
  } catch (e) {
    console.error(e)
    showError('Submit failed. ', e as Error)
  } finally {
    submitTweetUrlLoading = false
  }
}

const spaceUrl = $ref('')
let submitSpaceUrlLoading = $ref(false)

async function onSubmitSpaceUrl() {
  submitSpaceUrlLoading = true

  try {
    if (!submissions || !invites || !communityInfo || !task) {
      throw new Error('Data loading not completed. Please wait or try refresh.')
    }

    if (!twitterVouchedIDs.length && !runtimeConfig.public.debug) {
      throw new Error('You are not vouched.')
    }

    if (isSubmitted && !runtimeConfig.public.debug) {
      throw new Error('You have submitted this quest.')
    }

    const data = await fetchSpacesInfo([spaceUrl])
    const spaceInfo = validateTaskData<ValidatedSpacesInfo>({ task, data, mode: 'add', twitterVouchedIDs })
    
    await saveSpaceTaskSubmitInfo({
      submitterAddress: address,
      spaceUrl,
      spaceInfo,
      taskPid,
      communityUuid: communityInfo.uuid,
      communityLogo: communityInfo.logo,
      invites,
      mode: 'add',
    })

    task = await getTask(taskPid, address)

    isSubmitModalOpen = false
  } catch (e) {
    console.error(e)
    showError('Submit failed.', e as Error)
  } finally {
    submitSpaceUrlLoading = false
  }
}

const selectedSubmissions = $ref<AllSubmissionWithCalculatedBounties[]>([])

let sendBountyLoading = $ref(false)
async function onClickSendBounty() {
  if (!task || !submissions || !communityInfo) {
    showError('Data loading does not completed. Please wait or try refresh.')
    return
  }

  // if no submitted info, don't need isScoreCalculated
  if (selectedSubmissions.length > 0 && !task.isScoreCalculated) {
    showMessage('Being Cooked.')
    return
  }

  if (selectedSubmissions.length === 0 && task.submissions.length > 0) {
    if (!confirm('Confirm skipping all submissions?')) {
      return
    }
  }

  sendBountyLoading = true

  /** bounties to send */
  const bountiesToSend: Bounty[] = []
  let sendBountyResult = false
  try {
    const selectedTotalScore = selectedSubmissions.reduce(
      (total, submission) => {
        total += submission.score
        return total
      },
      0,
    )
    console.group('Bounty calculating')
    console.log({ selected: selectedSubmissions })
    submissions
      .map(s => {
        console.log(s.address)
        return s.calculatedBounties
      })
      .forEach(i => console.table(i))

    selectedSubmissions.forEach(submission => {
      const calculated = calcBounties(
        submission,
        selectedTotalScore,
        selectedSubmissions.length,
        task!.bounties,
      )

      submission.calculatedBounties = calculated as Task['bounties']
    })

    console.log('calculated bounties')
    submissions.forEach(s => {
      console.log(s.address)
      console.table(s.calculatedBounties)
    })
    console.groupEnd()

    // save calculatedBounties
    // TODO save calculatedBounties of selected submissions only
    await updateTaskSubmissions(taskPid, submissions)

    /** bounties that should send back to the task owner */
    const refoundMap = {} as Record<string, Bounty>
    // initialize refoundMap
    for (const taskBounty of task.bounties) {
      const { tokenProcessID: pid } = taskBounty
      if (!refoundMap[pid]) {
        refoundMap[pid] = {
          taskPid,
          sender: task!.ownerAddress,
          recipient: task!.ownerAddress,
          tokenProcessID: pid,
          amount: 0,
          quantity: BigInt(0),
        }
      }
      refoundMap[pid].amount += taskBounty.amount
      refoundMap[pid].quantity += BigInt(taskBounty.quantity)
    }
    // set decentraMind service charge quantity
    const dmQuantityMap = {} as Record<string, bigint>
    for (const [pid, returnBounty] of Object.entries(refoundMap)) {
      if (!dmQuantityMap[pid]) {
        dmQuantityMap[pid] =
          (returnBounty.quantity * BigInt(DM_BOUNTY_CHARGE_PERCENT)) /
          BigInt(100)
      }
    }

    // add selected submission's bounty to bountiesToSend
    const selectedSubmitters = selectedSubmissions.map(
      submission => submission.address,
    )
    submissions
      .filter(submission => selectedSubmitters.includes(submission.address))
      .forEach(submission => {
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

          // update refoundMap
          refoundMap[pid].amount -= bounty.amount
          refoundMap[pid].quantity -= BigInt(bounty.quantity)

          bountiesToSend.push(bountyData)
        })
      })

    for (const [pid, returnBounty] of Object.entries(refoundMap)) {
      // add DecentraMind bounty service charges if submissions.length > 0
      if (submissions.length) {
        const quantity = dmQuantityMap[pid]

        // to avoid total quantity greater than available number, you have to correct the quantity
        const correctQuantity =
          quantity > returnBounty.quantity ? returnBounty.quantity : quantity
        const denomination = tokensByProcessID[pid].denomination
        const correctAmount = bigInt2Float(correctQuantity, denomination)
        bountiesToSend.push({
          taskPid,
          sender: task!.ownerAddress,
          recipient: decentraMindReceiver,
          tokenProcessID: pid,
          amount: correctAmount,
          quantity: correctQuantity,
        })

        refoundMap[pid].amount -= correctAmount
        refoundMap[pid].quantity -= BigInt(correctQuantity)
      } else {
        bountiesToSend.push(returnBounty)
      }
    }

    console.log('bounties to send:', {
      bounties: bountiesToSend,
      submissions,
      refoundMap,
    })

    sendBountyResult = await sendBounty(task.processID, bountiesToSend)

    if (!selectedSubmissions.length) {
      showSuccess('The bounty has been returned!')
    } else {
      showSuccess(
        'Your bounties have been sent. You can view them in the Transaction Book.',
      )
    }
  } catch (e) {
    console.error(e)
    showError('Send bounty failed.', e as Error)
  } finally {
    sendBountyLoading = false
  }

  if (!sendBountyResult) {
    return
  }
  // disable send bounty button to avoid double send
  task.isSettled = true

  try {
    const sentBounties: BountySendHistory[] = []
    for (const bounty of bountiesToSend as BountySendHistory[]) {
      const sent = {
        ...bounty,
        tokenName: bounty.tokenName,
        communityUuid: communityInfo.uuid,
        communityName: communityInfo.name,
        taskName: task.name,
      }
      sentBounties.push(sent)
    }

    await retry({
      fn: async () => {
        return await storeBounty(task!.processID, sentBounties)
      },
      maxAttempts: 3,
    })
  } catch (e) {
    console.error('Failed to set task status to settled.')
    console.error(e)
  }
}

function sendBountyBtnLabel() {
  if (!submissions || submissions.length === 0 || !submissions) {
    return 'Return Bounty'
  } else {
    return t('Send Bounty')
  }
}

const precisions = $computed(() =>
  task?.bounties.reduce((carry, bounty) => {
    const fractionalLength = fractionalPart(bounty.amount).length
    carry.set(
      bounty.tokenProcessID,
      bounty.amount < 1 ? fractionalLength + 2 : 2,
    )
    return carry
  }, new Map<string, number>()),
)

watch(
  () => selectedSubmissions.length,
  () => {
    const selectedTotalScore = selectedSubmissions.reduce(
      (total, submission) => {
        total += submission.score
        return total
      },
      0,
    )
    console.log({ selectedTotalScore })

    // clear all submission.calcuclatedBounties
    submissions.forEach(submission => {
      submission.calculatedBounties = []
    })

    selectedSubmissions.forEach(submission => {
      const calculated = calcBounties(
        submission,
        selectedTotalScore,
        selectedSubmissions.length,
        task!.bounties,
      )

      submission.calculatedBounties = calculated as Task['bounties']
      submission.rewardHtml = calcRewardHtml(
        submission.calculatedBounties,
        true,
        precisions,
        'font-semibold',
      ).join('&nbsp;+&nbsp;')
    })
    console.log('calculated bounties')
    submissions.forEach(s => {
      console.log(s.address)
      console.table(s.calculatedBounties)
    })
  },
)

watch(() => tweetUrlForm.url, (value) => {
  try {
    const url = new URL(value)
    tweetUrlForm.url = url.origin + url.pathname
  } catch (e) {
    console.error('Invalid URL.')
  }
})

const onClickCopyInviteCode = async () => {
  try {
    if (!task) return
    await navigator.clipboard.writeText(
      location.origin + '/i/' + task.inviteCode!,
    )
    showSuccess('Copied!')
  } catch (err) {
    showError('Copy failed.')
  }
}

const isInviteModalOpen = $ref(false)
const inviteUrl = $computed(() => {
  return typeof window !== 'undefined'
    ? `${window.location.origin}/i/${task?.inviteCode}`
    : ''
})

const onClickShareToTwitter = () => {
  if (!inviteUrl || typeof window === 'undefined') return

  window.open(
    `https://twitter.com/intent/tweet?text=Check%20out%20this%20community%20on%20DecentraMind!&url=${inviteUrl}`,
    '_blank',
  )
}
</script>

<template>
  <UDashboardPage>
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

    <UPage v-if="!isLoading" class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <NuxtLink v-if="task" :to="`/community/${task.communityUuid}`">
              <UButton
                icon="i-heroicons-x-mark-20-solid"
                color="white"
                variant="solid"
                size="lg"
              />
            </NuxtLink>
          </div>
        </div>

        <UBlogPost
          v-if="task"
          :key="task.processID"
          :title="task.name"
          :description="task.intro"
          class="px-10 pt-0 pb-10"
          :ui="{ title: 'text-3xl mb-6 text-clip' }"
        >
          <template #description>
            <div class="flex flex-col space-y-6">
              <div class="text-justify text-md leading-8 whitespace-pre-line">
                {{ task.intro }}
              </div>

              <TaskStatus size="lg" :task="task" :address="address" />

              <UDivider />

              <!-- <div class="flex">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('Time Zone') }}</div>
                </div>
                <div>
                  {{ task.timezone }}
                </div>
              </div> -->
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

              <div v-if="task.type === 'promotion'" class="flex justify-start">
                <div class="font-semibold w-44 shrink-0">
                  <div>{{ $t('task.fields.Promotion Quest Link') }}</div>
                </div>
                <div>
                  {{ (task as TaskWithLink).link }}
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

              <UButton
                v-if="task.inviteCode"
                icon="heroicons:link"
                variant="soft"
                label="Your Quest Invitation Link"
                class="w-fit h-10"
                @click="isInviteModalOpen = true"
              />

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

            <div v-if="isJoined || isAdminOrOwner || runtimeConfig.public.debug" class="mt-8">
              <TaskSubmissionTable
                v-model:selected-submissions="selectedSubmissions"
                :task="task"
                :is-owner="isOwner"
                :is-loading="isLoading"
                :submissions="submissions"
              />
            </div>

            <div v-if="!isLoading && isJoined" class="flex justify-center my-8">
              <div v-if="isIng && (!isSubmitted || runtimeConfig.public.debug)" class="mx-4">
                <UButton
                  color="white"
                  :label="$t('Submit Quest')"
                  @click="openSubmitModal"
                />
              </div>
            </div>

            <div
              v-if="
                !isLoading &&
                  isOwner &&
                  !task.isSettled &&
                  now >= task.endTime
              "
              class="flex-center"
            >
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
              <p
                class="leading-6 text-gray-400 text-sm"
                v-html="$t(`task.judgment.${task.type}`).replace(/\n/g, '<br>')"
              />
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
              <p v-if="task" v-html="$t(`task.joinModal.${task.type}`, { lineBreak: '<br>' })" />
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

    <UModal v-model="isSubmitModalOpen" :ui="{ width: 'w-full sm:max-w-xl' }">
      <UCard v-if="task">
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
          <div v-if="task?.type === 'space'">
            <UInput
              v-model="spaceUrl"
              :model-modifiers="{ trim: true }"
              color="primary"
              variant="outline"
              :placeholder="$t(`task.form.space.placeholder`)"
            />
            <div class="flex justify-center mb-8 mt-12">
              <UButton
                :loading="submitSpaceUrlLoading"
                :disabled="submitSpaceUrlLoading"
                @click="onSubmitSpaceUrl"
              >
                {{ $t('Submit Quest') }}
              </UButton>
            </div>
          </div>

          <UForm
            v-if="task && ['promotion', 'bird', 'article'].includes(task?.type)"
            :schema="tweetUrlSchema"
            :state="tweetUrlForm"
            class="mt-8"
          >
            <UFormGroup name="url">
              <UInput
                v-model="tweetUrlForm.url"
                :model-modifiers="{ trim: true }"
                color="primary"
                variant="outline"
                :placeholder="$t(`task.form.${task.type}.placeholder`)"
              />
            </UFormGroup>
            <div class="flex justify-center mb-8 mt-12">
              <UButton
                v-if="['promotion', 'bird', 'article'].includes(task.type)"
                :loading="submitTweetUrlLoading"
                :disabled="submitTweetUrlLoading"
                @click="onSubmitTweetUrl"
              >
                {{ $t('Submit Quest') }}
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </UModal>

    <UModal v-model="isInviteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-center font-semibold">
            {{ $t('Your Quest Invitation Link') }}
          </h3>
        </template>
        <div class="flex-col-center w-full gap-y-4">
          <div
            class="w-full h-full pl-2 flex items-center bg-slate-50 rounded-md cursor-pointer"
            @click="onClickCopyInviteCode"
          >
            <p class="w-full text-center text-gray-500 font-semibold">
              {{ inviteUrl }}
            </p>
            <UButton
              size="lg"
              icon="ri:checkbox-multiple-blank-line"
              variant="ghost"
            />
          </div>
          <UButton
            size="lg"
            label="Share to Twitter"
            icon="ri:twitter-fill"
            variant="soft"
            @click="onClickShareToTwitter"
          />
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
