<script setup lang="ts">
import { getTaskTableColumns } from '~/utils'
import type { AllSubmissionWithCalculatedBounties, SubmissionValidateStatus, Task } from '~/types'
import { maxTotalChances, VALID_SUBMISSION_STATUS } from '~/utils/constants'
import { formatDate } from '~/utils/time'
import ValidateStatus from './ValidateStatus.vue'
import Bounties from './Bounties.vue'
import { cn } from '~/utils'

const props = defineProps<{
  task: Task
  isOwner: boolean
  isLoading: boolean
  submissions: AllSubmissionWithCalculatedBounties[]
  selectedSubmissions: AllSubmissionWithCalculatedBounties[]
}>()

const emit = defineEmits<{
  'update:selectedSubmissions': [submissions: AllSubmissionWithCalculatedBounties[]]
}>()

const shortString = (str: string, length: number) => str.slice(0, length) + '...' + str.slice(-length)

// Search and filter
const searchKeyword = ref('')
const filteredRows = computed(() => 
  searchKeyword.value
    ? props.submissions
    : props.submissions.filter(info => {
        return Object.values(info).some(value => {
          return String(value)
            .toLowerCase()
            .includes(searchKeyword.value.toLowerCase())
        })
      })
)

// Pagination
const page = ref(1)
const pageSize = computed(() => 
  props.task
    ? props.task.totalChances >= props.submissions.length
      ? props.submissions.length
      : Math.max(props.task.totalChances, 10)
    : maxTotalChances
)

const pageRows = computed(() => {
  const rows = filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
  console.log('pageRows', rows)
  return rows
})

// Selected submissions
const selected = computed({
  get: () => props.selectedSubmissions,
  set: (value) => emit('update:selectedSubmissions', value)
})

const { showMessage } = $(notificationStore())

const selectSubmission = (submission: AllSubmissionWithCalculatedBounties, checked: boolean) => {
  if (!props.task) {
    showMessage(
      'Task data not ready, please try again later, or refresh this page.',
    )
    return
  }

  if (checked) {
    const maxSelection = props.task ? props.task.totalChances : 1
    if (selected.value.length + 1 > maxSelection) {
      showMessage(`Selected items exceed total chances(${maxSelection})!`)
      return
    }

    if (submission.validateStatus === 'invalid') {
      showMessage('Invalid submission cannot be selected!')
      return
    }
    
    selected.value = [...selected.value, submission]
  } else {
    selected.value = selected.value.filter(s => s.id !== submission.id)
  }
}

const lastUpdateTime = computed(() => {
  const lastUpdateTime = props.submissions.reduce((max, submission) => {
    return Math.max(max, submission.updateTime)
  }, 0)
  return lastUpdateTime
})
</script>

<template>
  <div class="mt-6">
    <div class="flex-center !justify-between gap-2 flex-row-reverse py-3.5 border-b border-gray-300 dark:border-gray-700">
      <ULink
        :to="`https://www.ao.link/#/entity/${task.processID}?tab=incoming`"
        active-class="text-primary"
        target="_blank"
        inactive-class="text-primary"
        class="text-xs md:text-base"
      >
        Transaction Book
      </ULink>
      <div :class="cn('flex items-center text-sm md:text-base', !isOwner && 'hidden')">
        <div class="font-semibold mr-2">{{ $t('Submissions') }}&nbsp;&nbsp;<span class="text-gray-300 text-sm mr-4">{{ submissions.length }}</span></div>
        <UInput v-model="searchKeyword" icon="heroicons:magnifying-glass" placeholder="Search..." />
      </div>
    </div>

    <UTable
      :rows="pageRows"
      :columns="getTaskTableColumns(task.type, !task.isSettled && isOwner)"
      :loading="isLoading"
    >
      <template #selectStatus-data="{ row }">
        <!-- TODO: use a checkbox here if the checked status bug is fixed -->
        <div
          :class="[
            'w-4 h-4 border rounded cursor-pointer',
            row.validateStatus && !VALID_SUBMISSION_STATUS.includes(row.validateStatus) ? 'opacity-50 cursor-not-allowed' : '',
            selected.find(s => s.id === row.id) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'
          ]"
          @click="row.validateStatus && VALID_SUBMISSION_STATUS.includes(row.validateStatus) ? selectSubmission(row, !selected.find(s => s.id === row.id)) : null"
        >
          <div v-if="selected.find(s => s.id === row.id)" class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-check" class="w-3 h-3 text-white" />
          </div>
        </div>
      </template>
      <template #id-data="{ row }">
        {{ row.id }}
      </template>
      <template #validateStatus-data="{ row }">
        <ValidateStatus
          v-if="row.validateStatus"
          :status="row.validateStatus as SubmissionValidateStatus"
          :error="row.validateError"
        />
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
      <template #bounty-data="{ row }">
        <p v-if="task.isSettled || selected.find(s => s.id === row.id)" class="flex gap-2">
          <Bounties :bounties="row.calculatedBounties" :show-logo="false" />
        </p>
      </template>
    </UTable>

    <div class="flex justify-between items-center mt-2">
      <div class="text-sm text-gray-500">Last Update: {{ formatDate(lastUpdateTime) }}</div>
      <UPagination
        v-model="page"
        :page-count="pageSize"
        :total="filteredRows.length"
      />
    </div>
  </div>
</template> 