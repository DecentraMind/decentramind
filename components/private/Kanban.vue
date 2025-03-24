<script setup lang="ts">
import type { ButtonColor } from '#ui/types'
import type { BoardWithTasks, PrivateTask } from '~/types'
import Bounties from '@/components/task/Bounties.vue'
import ProposalModal from './ProposalModal.vue'

const props = defineProps<{
  data: BoardWithTasks
}>()

const runtimeConfig = useRuntimeConfig()

const statuses = ['proposal', 'auditing', 'executing', 'waiting_for_settlement', 'settled']
const statusColorMap: Record<string, ButtonColor> = {
  proposal: 'gray',
  auditing: 'blue',
  executing: 'green',
  waiting_for_settlement: 'orange',
  settled: 'pink'
}
const taskGroups = computed(() => {
  return statuses.reduce((acc, status) => {
    acc[status] = props.data.tasks.filter((task) => task.status === status)
    return acc
  }, {} as Record<string, PrivateTask[]>)
})

const isProposalModalOpen = ref(false)

onMounted(async () => {
  console.log(props.data)
})

const fetchTasks = () => {
  console.log('fetch tasks')
}
</script>

<template>
  <div class="ttt w-full h-fit flex flex-col items-start justify-start">
    <div class="flex flex-row items-center justify-between w-full">
      <h3 class="text-lg font-bold mb-3">{{ data.title }}</h3>
      <span v-if="runtimeConfig.public.debug" class="text-sm text-gray-500">{{ data.uuid }}</span>
    </div>
    <div class="w-full h-full flex flex-row items-start justify-start gap-4">
      <div v-for="status in statuses" :key="status" class="w-1/5 h-full">
        <UButton variant="soft" :color="statusColorMap[status]" :label="$t(`private.task.status.${status}`)" class="w-full mb-3" />

        <div v-for="task in taskGroups[status]" :key="task.uuid" class="w-full h-full p-3 flex flex-col items-start justify-start gap-3 text-sm mb-3 ring-1 ring-gray-200 rounded-lg">
          <div class="font-medium">{{ task.title }}</div>
          <div class="flex flex-row items-center justify-start gap-2">
            <span class="text-gray-500">Budgets</span>
            <Bounties :bounties="task.budgets" :show-logo="false" wrapper-class="flex flex-col items-end" />
          </div>
        </div>

        <div v-if="status === 'proposal'">
          <UButton variant="ghost" icon="i-heroicons-plus" :label="$t('private.task.add')" class="w-full" @click="isProposalModalOpen = true" />
        </div>
      </div>
    </div>

    <ProposalModal v-model="isProposalModalOpen" :board-uuid="data.uuid" @proposal-added="fetchTasks" />
  </div>
</template>
