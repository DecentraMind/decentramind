<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import { calcBounties, formatToLocale } from '~/utils'
import type {
  Task,
  InviteCodeInfo,
  AllSubmissionWithCalculatedBounties,
  TaskWithLink,
  SpaceSubmission,
  TweetSubmission
} from '~/types'
import { VALID_SUBMISSION_STATUS } from '~/utils/constants'
import TaskStatus from '~/components/task/TaskStatus.vue'
import { watch, watchEffect } from 'vue'
import { useClock } from '~/composables/useClock'
import { useTaskScoreCalculate } from '~/composables/tasks/useTaskScoreCalculate'
import TaskSubmissionTable from '~/components/task/SubmissionTable.vue'
import Bounties from '~/components/task/Bounties.vue'
import SpaceSubmissionForm from '~/components/task/SpaceSubmissionForm.vue'
import TweetSubmissionForm from '~/components/task/TweetSubmissionForm.vue'
import BountySendConfirmModal from '~/components/task/BountySendConfirmModal.vue'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { notificationStore } from '~/stores/notificationStore'
import { breadcrumbStore, type IBreadcrumbLink } from '~/stores/breadcrumbStore'
import { useGetInvitesByInviterQuery, useGetTaskQuery } from '~/composables/tasks/taskQuery'
import { useCommunitiesQuery } from '~/composables/community/communityQuery'


const router = useRouter()

const runtimeConfig = useRuntimeConfig()

const {
  updateTaskScores,
  joinTask,
  createTaskInviteCode,
} = useTaskStore()

const {
  setCurrentCommunityUuid,
  joinCommunity
} = $(communityStore())

const { showError, showSuccess, showMessage } = $(notificationStore())

const { address, twitterVouched, twitterVouchedIDs } = $(aoStore())
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
let { isLoginModalOpen, isVouchModalOpen, redirectUrlAfterLogin } = $(aoStore())
const route = useRoute()
const taskPid = $computed(() => route.params.taskId) as string

const { data: task, isSuccess: isTaskLoaded, isLoading: isTaskLoading, error: taskError, refetch: refetchTask } = useGetTaskQuery({taskPid, address})
watch(isTaskLoaded, async () => {
  if (task.value) {
    setCurrentCommunityUuid(task.value.communityUuid)
    if (!task.value.inviteCode && address) {
      task.value.inviteCode = await createTaskInviteCode(taskPid)
      // console.log('create invite code ', task.inviteCode)
    }
  }
})

// const { data: communityInfo, isLoading: isCommunityInfoLoading } = useCommunitiesQuery<Community | undefined>(address, {
//   select: (communities) => communities.find((community) => community.uuid === task.value?.communityUuid)
// })

// 改为分两步，先获取所有社区，然后用计算属性找到对应的社区
const { data: communities, isLoading: isCommunityInfoLoading } = useCommunitiesQuery(address)

// 使用计算属性找到对应的社区
const communityInfo = computed(() => {
  if (!communities.value || !task.value?.communityUuid) return undefined
  return communities.value.find(community => community.uuid === task.value?.communityUuid)
})

// 添加监听以诊断 communityInfo 何时发生变化
watchEffect(() => {
  console.log('communityInfo watchEffect:', communityInfo.value)
})

const isJoinedCommunity = $computed(() => {
  return communityInfo.value && communityInfo.value.isJoined
})
const { setBreadcrumbs } = $(breadcrumbStore())
// 将 watchEffect 改为 watch 以监视 communityInfo 变化
watch(communityInfo, (newVal) => {
  console.log('communityInfo watch with computed:', newVal)
  if (newVal) {
    const communityBreadcrumb: IBreadcrumbLink = { label: newVal.name }
    if (task.value && isJoinedCommunity) {
      communityBreadcrumb.to = `/community/${newVal.uuid}`
    }
    setBreadcrumbs([
      { labelKey: 'Home', label: 'Home', to: '/discovery' },
      communityBreadcrumb,
      { label: 'Quest' }
    ])
  }
}, { immediate: true })

const isOwner = $computed(
  () => task.value?.ownerAddress === address || communityInfo.value?.owner === address,
)

/**
 * if the user already has valid submission or waiting submission, the user can't submit again
 */
const canSubmit = $computed(
  () =>
    submissions
      .filter(
        submission => submission.validateStatus
        && (VALID_SUBMISSION_STATUS.includes(submission.validateStatus) || submission.validateStatus === 'waiting_for_validation')
      )
      .findIndex(submission => submission.address === address) === -1,
)
const isJoined = $computed(() => {
  // console.log('task', task)
  return task.value && task.value.builders
    ? Object.keys(task.value.builders).findIndex(builder => builder === address) > -1
    : false
})

const isIng = $computed(() => {
  return task.value ? now.value > task.value.startTime && now.value < task.value.endTime : false
})

const submittedBuilderCount = $computed(() => {
  return !task.value?.submissions
    ? ''
    : task.value.submissions.reduce((set, current) => {
        set.add(current.address)
        return set
      }, new Set()).size
})

const { data: inviteInfos, isSuccess: isInvitesLoaded, isLoading: isInvitesLoading } = useGetInvitesByInviterQuery({inviter: address, type: 'task'}, {
  enabled: !!address
})

const invites: InviteCodeInfo[] = $computed(() => inviteInfos.value?.invites || [])

const submissions = $computed(
  () => task.value?.submissions as AllSubmissionWithCalculatedBounties[],
)

async function calculateAndUpdateScore(task: Task, submissions: AllSubmissionWithCalculatedBounties[]) {
  // Check if submission last update is greater than task.endTime
  const lastUpdateTime = submissions.reduce((max, submission) => {
    return Math.max(max, submission.updateTime)
  }, 0)
  
  if (lastUpdateTime < task.endTime) {
    console.log('Submissions are waiting for validation or need last update after task endTime, skip score calculation')
    return null
  }
  if (task.isScoreCalculated) {
    console.log('Task is already score calculated, skip score calculation')
    return null
  }

  const updatedSubmissions = useTaskScoreCalculate(task, submissions)

  // Save submission scores and set task.isScoreCalculated
  const scores = updatedSubmissions.map(s => ({
    id: s.id,
    score: s.score,
  }))
  
  await updateTaskScores(task.processID, scores)
  return updatedSubmissions
}

const now = useClock(3000)
// if the task status(from not started to ing, or from ing to ended) changes with time, refresh current page
watch(
  () => now.value,
  (newVal, oldVal) => {
    if (!task.value) return

    if (
      (newVal >= task.value.startTime && oldVal < task.value.startTime) ||
      (newVal >= task.value.endTime && oldVal < task.value.endTime)
    ) {
      // same as window.location.reload()
      reloadNuxtApp()
    }
  },
)

/**
 * Check if task score needs to be calculated and update it
 */
async function checkAndCalculateTaskScore() {
  if (!task.value) return
  
  if (
    (runtimeConfig.public.debug || !task.value.isScoreCalculated) &&
    now.value >= task.value.endTime &&
    !task.value.isSettled &&
    isOwner
  ) {
    const updatedSubmissions = await calculateAndUpdateScore(
      task.value,
      task.value.submissions as AllSubmissionWithCalculatedBounties[]
    )
    if (updatedSubmissions) {
      // Refetch task info
      await refetchTask()
    }
  }
}

// Run calculation only once when task is first loaded
let hasCalculatedScore = $ref(false)
let isCalculatingScore = $ref(false)
watch(isTaskLoaded, async (isLoaded) => {
  if (isLoaded && task.value && !hasCalculatedScore) {
    hasCalculatedScore = true
    isCalculatingScore = true
    try {
      await checkAndCalculateTaskScore()
    } finally {
      isCalculatingScore = false
    }
  }
}, { immediate: true })

const isLoading = $computed(() => {
  const shouldIncludeInvitesLoading = !!address && isInvitesLoading.value
  return isTaskLoading.value || isCommunityInfoLoading.value || isCalculatingScore || shouldIncludeInvitesLoading
})
onMounted(async () => {
  // auto join task if there is a joinTask action in the url
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('action') === 'joinTask' && !isJoined) {
    console.log('auto join task')
    await onClickJoin()
  }
})

let isSubmitModalOpen = $ref(false)
let isJoinModalOpen = $ref(false)
function checkLoginAndVouch() {
  if (!address) {
    console.log('address false open login modal')
    // set redirect url with joinTask action after login
    redirectUrlAfterLogin = {
      path: router.currentRoute.value.path,
      query: {
        action: 'joinTask',
      },
      force: true,
    }
    isLoginModalOpen = true
    return false
  } else if (!twitterVouched) {
    console.log('twitterVouched false open vouch modal')
    isVouchModalOpen = true
    return false
  }
  return true
}
function openSubmitModal() {
  if (!checkLoginAndVouch()) return
  isSubmitModalOpen = true
}

function openJoinModal() {
  if (!checkLoginAndVouch()) return
  isJoinModalOpen = true
}

let isJoinLoading = $ref(false)
async function onClickJoin() {
  isJoinLoading = true
  // if not joined the community, join the community first
  if (!communityInfo.value?.isJoined) {
    await joinCommunity(communityInfo.value!.uuid)
  }
  await joinTask(taskPid)
  await refetchTask()
  isJoinModalOpen = false
  isJoinLoading = false
}

let submitTweetUrlLoading = $ref(false)
async function onSubmitTweetUrl(url: string) {
  submitTweetUrlLoading = true
  try {
    if (!submissions || !invites || !communityInfo.value || !task) {
      throw new Error('Data loading not completed. Please wait or try refresh.')
    }

    if (!twitterVouchedIDs.length && !runtimeConfig.public.debug) {
      throw new Error('You are not vouched.')
    }

    if (!canSubmit && !runtimeConfig.public.debug) {
      throw new Error('You already have a valid submission or waiting submission.')
    }
    
    const tweetSubmission:Omit<TweetSubmission, 'id'|'createTime'|'updateTime'> = {
      taskPid,
      address,
      url,
      // metrics and score will be overwritten by process side
      buzz: 0,
      discuss: 0,
      identify: 0,
      popularity: 0,
      spread: 0,
      friends: 0,
      score: 0
    }
    await submitTask(tweetSubmission)

    await refetchTask()

    isSubmitModalOpen = false
  } catch (e) {
    console.error(e)
    showError('Submit failed. ', e as Error)
  } finally {
    submitTweetUrlLoading = false
  }
}

let submitSpaceUrlLoading = $ref(false)
async function onSubmitSpaceUrl(url: string) {
  submitSpaceUrlLoading = true
  try {
    if (!submissions || !invites || !communityInfo.value || !task) {
      throw new Error('Data loading not completed. Please wait or try refresh.')
    }

    if (!twitterVouchedIDs.length && !runtimeConfig.public.debug) {
      throw new Error('You are not vouched.')
    }

    if (!canSubmit && !runtimeConfig.public.debug) {
      throw new Error('You already have a valid submission or waiting submission.')
    }

    const spaceSubmission:Omit<SpaceSubmission, 'id'|'createTime'|'updateTime'> = {
      taskPid,
      address,
      url,
      // metrics and score will be overwritten by process side
      inviteCount: 0,
      audience: 0,
      brandEffect: 0,
      score: 0
    }
    await submitTask(spaceSubmission)

    await refetchTask()

    isSubmitModalOpen = false
  } catch (e) {
    console.error(e)
    showError('Submit failed.', e as Error)
  } finally {
    submitSpaceUrlLoading = false
  }
}

const selectedSubmissions = $ref<AllSubmissionWithCalculatedBounties[]>([])
const validatedSubmissions = $computed(() => {
  return task.value?.submissions.filter(s => s.validateStatus && VALID_SUBMISSION_STATUS.includes(s.validateStatus))
})

let isBountyConfirmModalOpen = $ref(false)
async function onClickSendBounty() {
  if (!task.value || !submissions || !communityInfo.value) {
    showError('Data loading does not completed. Please wait or try refresh.')
    return
  }

  // if no submitted info, don't need isScoreCalculated
  if (selectedSubmissions.length > 0 && !task.value.isScoreCalculated) {
    showMessage('Being Cooked.')
    return
  }

  if (selectedSubmissions.length === 0 && validatedSubmissions && validatedSubmissions.length > 0) {
    alert('Please select at least one submission.')
    return
  }
  console.log('selectedSubmissions', selectedSubmissions)

  isBountyConfirmModalOpen = true
  return
}

// update calculatedBounties when selectedSubmissions changes
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
        task.value!.bounties,
        task.value!.totalChances,
      )

      submission.calculatedBounties = calculated as Task['bounties']
    })
    console.log('calculated bounties')
    submissions.forEach(s => {
      if (s.calculatedBounties.length > 0) {
        console.log(s.address)
        console.table(s.calculatedBounties)
      }
    })
  },
)

const onClickCopyInviteCode = async () => {
  try {
    if (!task) return
    await navigator.clipboard.writeText(
      location.origin + '/i/' + task.value!.inviteCode!,
    )
    showSuccess('Copied!')
  } catch (_) {
    showError('Copy failed.')
  }
}

const isInviteModalOpen = $ref(false)
const inviteUrl = $computed(() => {
  return typeof window !== 'undefined'
    ? `${window.location.origin}/i/${task.value?.inviteCode}`
    : ''
})

const onClickShareToTwitter = () => {
  if (!inviteUrl || typeof window === 'undefined') return

  window.open(
    `https://x.com/intent/tweet?text=Check%20out%20this%20community%20on%20DecentraMind!&url=${inviteUrl}`,
    '_blank',
  )
}


</script>

<template>
  <UDashboardPage :ui="{ wrapper: 'h-[calc(100vh-var(--header-height))] overflow-y-auto' }">
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

    <UPage v-if="!isLoading" class="overflow-y-auto h-full lg:w-full">
      <div class="w-full overflow-y-auto h-full">
        <UBlogPost
          v-if="task"
          :key="task.processID"
          :title="task.name"
          :description="task.intro"
          class="px-4 sm:px-10 pt-8 sm:pt-10 pb-8 sm:pb-10"
          :ui="{
            // wrapper: 'p-2 sm:p-4',
            title: 'text-3xl mb-6 text-clip'
          }"
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
              <div class="xs:flex xs:justify-start">
                <div class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
                  {{ $t('Time') }}
                </div>
                <div>
                  {{ formatToLocale(task.startTime) }} -
                  {{ formatToLocale(task.endTime) }}
                </div>
              </div>
              <div class="xs:flex xs:justify-start">
                <div class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
                  {{ $t('Bounty') }}
                </div>
                <Bounties v-if="task.bounties" :bounties="task.bounties" />
              </div>
              <div class="xs:flex xs:justify-start">
                <div class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
                  {{ $t('Total Chances') }}
                </div>
                <div>
                  {{ task.totalChances }}
                </div>
              </div>

              <div v-if="task.type === 'promotion'" class="xs:flex xs:justify-start">
                <div class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
                  {{ $t('task.fields.Promotion Quest Link') }}
                </div>
                <div v-if="(task as TaskWithLink).link" class="break-all">
                  <a :href="(task as TaskWithLink).link" target="_blank" class="hover:text-primary-500">{{ (task as TaskWithLink).link }}</a>
                </div>
              </div>

              <div class="xs:flex xs:justify-start">
                <div class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
                  {{ $t('builders now') }}
                </div>
                <div>
                  {{ isLoading ? '' : submittedBuilderCount }}
                </div>
              </div>

              <div>
                <p class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">
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
                  :loading="isJoinLoading"
                  :disabled="isJoinLoading"
                  :label="$t('Join Quest')"
                  @click="openJoinModal"
                />
              </div>
            </div>
            
            <TaskSubmissionTable
              v-model:selected-submissions="selectedSubmissions"
              :task="task"
              :is-owner="isOwner"
              :is-loading="isLoading"
              :submissions="submissions"
            />

            <div v-if="!isLoading && isJoined" class="flex justify-center my-8">
              <div
                v-if="isIng"
                class="mx-4"
              >
                <UButton
                  v-if="canSubmit"
                  :label="$t('Submit Quest')"
                  @click="openSubmitModal"
                />
                <UButton
                  v-if="!canSubmit && runtimeConfig.public.debug"
                  :label="$t('Submit Quest')"
                  @click="openSubmitModal"
                />
              </div>
            </div>

            <div
              v-if="
                !isLoading && isOwner && !task.isSettled && now >= task.endTime
              "
              class="flex-center"
            >
              <UButton
                :color="selectedSubmissions.length > 0 ? 'primary' : 'gray'"
                :label="validatedSubmissions && validatedSubmissions.length === 0 ? $t('Return Bounty') : $t('Send Bounty') + ' (' + selectedSubmissions.length + ')'"
                :disabled="isBountyConfirmModalOpen"
                @click="onClickSendBounty"
              />
            </div>

            <div class="mt-8">
              <h4 class="font-semibold w-44 shrink-0 mb-2 whitespace-nowrap">{{ $t('Rules of Judgment') }}</h4>
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
      <UCard :ui="{ body: { base: 'px-3 sm:px-3' } }">
        <div class="space-y-2">
          <p
            v-if="task"
            class="text-center w-full"
            v-html="
              $t(`task.joinModal.${task.type}`, { lineBreak: '<br>' })
            "
          />

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
          <SpaceSubmissionForm
            v-if="task?.type === 'space'"
            v-model:submit-space-url-loading="submitSpaceUrlLoading"
            @submit="onSubmitSpaceUrl"
          />

          <TweetSubmissionForm
            v-if="task && ['promotion', 'bird', 'article'].includes(task?.type)"
            v-model:submit-tweet-url-loading="submitTweetUrlLoading"
            :task-type="task?.type"
            @submit="onSubmitTweetUrl"
          />
        </div>
      </UCard>
    </UModal>

    <BountySendConfirmModal
      v-if="task"
      v-model="isBountyConfirmModalOpen"
      :task="task"
      :selected-submissions="selectedSubmissions"
      :community-info="communityInfo"
      @success="
        task.isSettled = true;
        isBountyConfirmModalOpen = false
      "
    />

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