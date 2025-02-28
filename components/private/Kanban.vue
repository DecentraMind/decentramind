<script setup lang="ts">
import type { ButtonColor } from '#ui/types'
import type { BoardWithTasks, PrivateTask } from '~/types'
import Bounties from '@/components/task/Bounties.vue'

const props = defineProps<{
  data: BoardWithTasks
}>()

const statuses = ['proposal', 'auditing', 'executing', 'waiting_for_settlement', 'settled']
const statusColorMap: Record<string, ButtonColor> = {
  proposal: 'gray',
  auditing: 'blue',
  executing: 'green',
  waiting_for_settlement: 'yellow',
  settled: 'red'
}
const taskGroups = computed(() => {
  return statuses.reduce((acc, status) => {
    acc[status] = props.data.tasks.filter((task) => task.status === status)
    return acc
  }, {} as Record<string, PrivateTask[]>)
})

onMounted(async () => {
  console.log(props.data)
})
</script>

<template>
  <div class="ttt w-full h-fit flex flex-col items-start justify-start">
    <h3 class="text-lg font-bold mb-3">{{ data.title }}</h3>
    <div class="w-full h-full flex flex-row items-start justify-start gap-4">
      <div v-for="status in statuses" :key="status" class="w-1/5 h-full">
        <UButton variant="soft" :color="statusColorMap[status]" :label="$t(`private.task.status.${status}`)" class="w-full mb-3" />

        <div v-for="task in taskGroups[status]" :key="task.uuid" class="w-full h-full p-3 flex flex-col items-start justify-start gap-3 text-sm mb-3 ring-1 ring-gray-200 rounded-lg">
          <div class="font-medium">{{ task.title }}</div>
          <div class="flex flex-row items-center justify-start gap-2">
            <span class="text-gray-500">Budgets</span>
            <Bounties :bounties="task.budgets" :show-logo="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
