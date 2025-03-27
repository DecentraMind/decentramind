<script setup lang="ts">
import type { ButtonColor } from '#ui/types'
import type { BoardWithTasks, PrivateTask } from '~/types'
import Bounties from '@/components/task/Bounties.vue'
import ProposalModal from './ProposalModal.vue'

const props = defineProps<{
  data: BoardWithTasks
  unclickable?: boolean
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

console.log('board props.data', props.data)
const taskGroups = computed(() => {
  return statuses.reduce((acc, status) => {
    acc[status] = props.data.tasks.filter((task) => task.status === status)
    return acc
  }, {} as Record<string, PrivateTask[]>)
})

const isProposalModalOpen = ref(false)

const onProposalAdded = () => {
  console.log('new proposal added to board', props.data.uuid)
}
</script>

<template>
  <div class="w-full h-fit flex flex-col items-start justify-start bg-white px-3 py-6 border-t first:border-t-0">
    <div class="flex flex-row items-center justify-between w-full">
      <h3 class="text-lg font-medium mb-4 cursor-pointer">{{ data.title }}</h3>
      <span v-if="runtimeConfig.public.debug" class="text-sm text-gray-500">{{ data.uuid }}</span>
    </div>
    <div class="w-full overflow-x-auto">
      <div class="min-w-[920px] flex flex-row items-start justify-start gap-4">
        <div v-for="status in statuses" :key="status" class="w-1/5 h-full">
          <UButton variant="soft" :color="statusColorMap[status]" :label="$t(`private.task.status.${status}`)" class="w-full mb-2 cursor-default" />
          <div class="p-1">
            <div v-for="task in taskGroups[status]" :key="task.uuid" class="w-full p-3 flex flex-col items-start justify-start gap-2 text-sm mb-3 ring-1 ring-gray-200 rounded-lg">
              <div class="font-medium">{{ task.title }}</div>
              <div class="flex flex-row items-center justify-start gap-2">
                <span class="text-gray-500">Budgets</span>
                <Bounties :bounties="task.budgets" :show-logo="false" wrapper-class="flex flex-col items-end" />
              </div>
            </div>
            <div v-if="status === 'proposal'">
              <UButton
                variant="ghost"
                icon="i-heroicons-plus"
                :label="$t('private.task.add')"
                class="w-full"
                :disabled="unclickable"
                @click="isProposalModalOpen = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProposalModal v-model="isProposalModalOpen" :board-uuid="data.uuid" @proposal-added="onProposalAdded" />
  </div>
</template>
