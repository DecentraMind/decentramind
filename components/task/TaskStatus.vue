<script lang="ts" setup>
import type { Submission, Task } from '~/types'
import { taskProgress } from '~/utils/util'
import { useClock } from '~/composables/useClock'
import type { BadgeSize } from '#ui/types'

const props = defineProps<{
  task: Task
  address: string
  size?: BadgeSize
}>()
const { task, address, size = 'sm' } = $(toRefs(props))

function checkSubmit(submissions: Submission[], address: string) {
  return submissions.findIndex(submission => submission.address === address) > -1
}

const now = $(useClock(3000))
const progress = $computed(() => taskProgress(now, task.startTime, task.endTime))
</script>

<template>
  <div class="flex justify-start">
    <div class="mr-2">
      <UBadge :size="size" :color="progress.isNotStarted ? 'gray' : progress.isIng ? 'green' : 'gray'" variant="soft">
        {{ progress.text }}
      </UBadge>
    </div>
    <div v-if="checkSubmit(task.submissions, address)" class="mr-2">
      <UBadge :size="size" color="sky" variant="soft">
        {{ $t('task.submitted') }}
      </UBadge>
    </div>
    <div v-if="(task.ownerAddress === address || checkSubmit(task.submissions, address)) && !task.isSettled && progress.isEnded">
      <UBadge :size="size" color="orange" variant="soft">
        {{ $t('Unsettled') }}
      </UBadge>
    </div>
  </div>
</template>
