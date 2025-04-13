<script setup lang="ts">
import { aoStore } from '~/stores/aoStore'
import type { PrivateTask, PrivateTaskStatus } from '~/types'
import { useGetPrivateTasksByInitiatorQuery, useGetPrivateTasksByParticipantQuery } from '~/composables/community/communityQuery'
import Bounties from '~/components/task/Bounties.vue'

const privateTaskStatuses: PrivateTaskStatus[] = ['draft', 'auditing', 'executing', 'waiting_for_validation', 'waiting_for_settlement', 'settled']

const initiatedTasks = ref<PrivateTask[]>([])
const participatedTasks = ref<PrivateTask[]>([])

const { address } = $(aoStore())

// Fetch tasks initiated by the current user
const { 
  data: initiatedTasksData, 
  isLoading: isLoadingInitiatedTasks 
} = useGetPrivateTasksByInitiatorQuery(address)

// Fetch tasks where the current user is a participant
const { 
  data: participatedTasksData, 
  isLoading: isLoadingParticipatedTasks 
} = useGetPrivateTasksByParticipantQuery(address)

// Watch for data loading
watch([initiatedTasksData, participatedTasksData], ([initiated, participated]) => {
  if (initiated) {
    initiatedTasks.value = initiated.filter(task => privateTaskStatuses.includes(task.status))
  }
  if (participated) {
    participatedTasks.value = participated.filter(task => privateTaskStatuses.includes(task.status))
  }
})

// Columns for the initiated tasks
const initiatedColumns = [
  { key: 'communityName', label: 'Community' },
  { key: 'title', label: 'Task Name' },
  { key: 'budgets', label: 'Total Budget' },
  { key: 'settleTx', label: 'Settle Transaction', class: 'w-32' },
]

// Columns for the participated tasks
const participatedColumns = [
  { key: 'communityName', label: 'Community' },
  { key: 'title', label: 'Task Name' },
  { key: 'budget', label: 'Your Budget' },
  { key: 'settleTx', label: 'Settle Transaction', class: 'w-32' },
]

// Active tab for initiated tasks
const initiatedActiveTab = ref<string>(privateTaskStatuses[0])
// Active tab for participated tasks
const participatedActiveTab = ref<string>(privateTaskStatuses[0])

// Pagination for initiated tasks
const initiatedPage = ref(1)
const initiatedPageCount = 5

// Pagination for participated tasks
const participatedPage = ref(1)
const participatedPageCount = 5

// Filter initiated tasks by status
const initiatedTasksByStatus = computed(() => {
  return initiatedTasks.value
    .filter(task => task.status === initiatedActiveTab.value)
})

// Filter participated tasks by status
const participatedTasksByStatus = computed(() => {
  return participatedTasks.value
    .filter(task => task.status === participatedActiveTab.value)
    .map(task => {
      // Find the budget allocated to the current user
      const userBudget = task.budgets.find(budget => budget.member === address)
      
      return {
        ...task,
        budget: [userBudget],
        settleTx: userBudget?.settleTx || '',
      }
    })
})

// Paginated tasks for the current view
const paginatedInitiatedTasks = computed(() => {
  return initiatedTasksByStatus.value.slice(
    (initiatedPage.value - 1) * initiatedPageCount,
    initiatedPage.value * initiatedPageCount
  )
})

const paginatedParticipatedTasks = computed(() => {
  return participatedTasksByStatus.value.slice(
    (participatedPage.value - 1) * participatedPageCount,
    participatedPage.value * participatedPageCount
  )
})
</script>

<template>
  <div>
    <div class="w-full lg:w-[800px] mb-10">
      <UCard
        :ui="{
          header: {
            padding: 'px-4 py-2 sm:px-6',
          },
        }"
      >
        <template #header>
          <div class="text-center font-semibold">
            Initiated&emsp;<UBadge variant="soft" size="lg">
              {{ initiatedTasks.length }}
            </UBadge>
          </div>
        </template>
        
        <div class="border-b border-gray-200 dark:border-gray-800">
          <UButtonGroup block class="mb-0 rounded-none">
            <UButton
              v-for="status in privateTaskStatuses"
              :key="status"
              :color="initiatedActiveTab === status ? 'primary' : 'gray'"
              variant="ghost"
              class="flex-1 rounded-none"
              @click="initiatedActiveTab = status"
            >
              {{ $t(`private.task.status.${status}`) }}
            </UButton>
          </UButtonGroup>
        </div>
        
        <div class="p-4">
          <UTable
            :rows="paginatedInitiatedTasks"
            :columns="initiatedColumns"
            :loading="isLoadingInitiatedTasks"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          >
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="text-gray-500">No tasks found with status "{{ $t(`private.task.status.${initiatedActiveTab}`) }}"</span>
              </div>
            </template>

            <template #budgets-data="{ row }">
              <Bounties :bounties="row.budgets" :show-plus="false" :disable-popover="true" wrapper-class="flex flex-col items-start" />
            </template>
            
            <template #settleTx-data="{ row }">
              <span v-if="initiatedActiveTab === 'settled' && row.settleTx">
                {{ row.settleTx.substring(0, 8) }}...
              </span>
              <span v-else>-</span>
            </template>
          </UTable>
          
          <div class="flex justify-end mt-4">
            <UPagination
              v-model="initiatedPage"
              :page-count="initiatedPageCount"
              :total="initiatedTasksByStatus.length"
            />
          </div>
        </div>
      </UCard>
    </div>

    <div class="w-full lg:w-[800px]">
      <UCard
        :ui="{
          header: {
            padding: 'px-4 py-2 sm:px-6',
          },
        }"
      >
        <template #header>
          <div class="text-center font-semibold">
            Participated&emsp;<UBadge variant="soft" size="lg">
              {{ participatedTasks.length }}
            </UBadge>
          </div>
        </template>
        
        <div class="border-b border-gray-200 dark:border-gray-800">
          <UButtonGroup block class="mb-0 rounded-none">
            <UButton
              v-for="status in privateTaskStatuses"
              :key="status"
              :color="participatedActiveTab === status ? 'primary' : 'gray'"
              variant="ghost"
              class="flex-1 rounded-none"
              @click="participatedActiveTab = status"
            >
              {{ $t(`private.task.status.${status}`) }}
            </UButton>
          </UButtonGroup>
        </div>
        
        <div class="p-4">
          <UTable
            :rows="paginatedParticipatedTasks"
            :columns="participatedColumns"
            :loading="isLoadingParticipatedTasks"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          >
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="text-gray-500">No tasks found with status "{{ $t(`private.task.status.${participatedActiveTab}`) }}"</span>
              </div>
            </template>

            <template #budget-data="{ row }">
              <Bounties :bounties="row.budget" :show-plus="false" :disable-popover="true" wrapper-class="flex flex-col items-start" />
            </template>
            
            <template #settleTx-data="{ row }">
              <span v-if="participatedActiveTab === 'settled' && row.settleTx">
                {{ row.settleTx.substring(0, 8) }}...
              </span>
              <span v-else>-</span>
            </template>
          </UTable>
          
          <div class="flex justify-end mt-4">
            <UPagination
              v-model="participatedPage"
              :page-count="participatedPageCount"
              :total="participatedTasksByStatus.length"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template> 