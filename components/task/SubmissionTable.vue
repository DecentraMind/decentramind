<script setup lang="ts">
import { getTaskTableColumns } from '~/utils'
import type { AllSubmissionWithCalculatedBounties, SubmissionValidateStatus, Task } from '~/types'
import { maxTotalChances } from '~/utils/constants'
import { formatDate } from '~/utils/time'
import ValidateStatus from './ValidateStatus.vue'

const props = defineProps<{
  task: Task
  isOwner: boolean
  isLoading: boolean
  submissions: AllSubmissionWithCalculatedBounties[]
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
const selectedSubmissions = ref<AllSubmissionWithCalculatedBounties[]>([])

watch(() => selectedSubmissions.value, (newVal) => {
  emit('update:selectedSubmissions', newVal)
}, { deep: true })

const { showMessage } = $(notificationStore())

watch(() => selectedSubmissions.value.length, () => {
  if (!props.task) {
    showMessage(
      'Task data not ready, please try again later, or refresh this page.',
    )
    return
  }

  const maxSelection = props.task ? props.task.totalChances : 1
  if (selectedSubmissions.value.length > maxSelection) {
    showMessage(`Selected items exceed ${maxSelection}!`)
    // If selection exceeds max, trim the excess selections
    selectedSubmissions.value = selectedSubmissions.value.slice(0, maxSelection)
  }
})

const lastUpdateTime = computed(() => {
  const lastUpdateTime = props.submissions.reduce((max, submission) => {
    return Math.max(max, submission.updateTime)
  }, 0)
  return lastUpdateTime
})
</script>

<template>
  <div>
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
        <div class="font-semibold mr-2">{{ $t('Submissions') }}</div>
        <UInput v-model="searchKeyword" icon="heroicons:magnifying-glass" placeholder="Search..." />
      </div>
    </div>

    <UTable
      v-model="selectedSubmissions"
      :rows="pageRows"
      :columns="getTaskTableColumns(task.type)"
      :loading="isLoading"
      :ui="{
        checkbox: {
          padding: task.isSettled || !isOwner ? 'hidden' : '',
        },
      }"
    >
      <template #id-data="{ row }">
        {{ row.id }}
      </template>
      <template #validateStatus-data="{ row }">
        <ValidateStatus
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
      <template #rewardHtml-data="{ row }">
        <p
          class="flex justify-start items-center"
          v-html="
            task.isSettled || selectedSubmissions.find(s => s.id === row.id)
              ? row.rewardHtml
              : '/'
          "
        />
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