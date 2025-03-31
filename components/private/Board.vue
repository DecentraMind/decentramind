<script setup lang="ts">
import type { BoardWithTasks, PrivateTask, PrivateTaskStatus } from '~/types'
import Bounties from '~/components/task/Bounties.vue'
import ProposalModal from './ProposalModal.vue'
import { communityStore } from '~/stores/communityStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import { privateTaskStatusColorMap } from '~/utils/constants'
import { useUpdateBoardTitleMutation } from '~/composables/community/communityQuery'
import EditableText from '~/components/common/EditableText.vue'

const props = defineProps<{
  data: BoardWithTasks
  unclickable?: boolean
  canEditTitle?: boolean
}>()

const privateTaskStore = usePrivateTaskStore()
const { updateCurrentPrivateTask } = privateTaskStore
const runtimeConfig = useRuntimeConfig()
const { currentUuid: communityUuid } = $(communityStore())

const { mutateAsync: updateBoardTitle, isPending: updateBoardTitleLoading } = useUpdateBoardTitleMutation({
  communityUuid: communityUuid!,
  onErrorCb: () => {
    showError('Failed to update work area title.')
    console.error('Failed to update board title')
  }
})

const statuses: PrivateTaskStatus[] = ['draft', 'auditing', 'executing', 'waiting_for_validation', 'waiting_for_settlement', 'settled']

console.log('board props.data', props.data)
const taskGroups = computed(() => {
  return statuses.reduce((acc, status) => {
    acc[status] = props.data.tasks.filter((task) => task.status === status)
    return acc
  }, {} as Record<string, PrivateTask[]>)
})


const onProposalAdded = () => {
  console.log('new proposal added to board', props.data.uuid)
}

const openProposalModal = (task: PrivateTask) => {
  console.log('open proposal modal', task.uuid)
  updateCurrentPrivateTask({
    ...task,
    boardUuid: props.data.uuid
  })
  privateTaskStore.isProposalModal = true
}

const openAddProposalModal = () => {
  updateCurrentPrivateTask({
    boardUuid: props.data.uuid
  })
  privateTaskStore.isProposalModal = true
}

const handleUpdateBoardTitle = async (newTitle: string) => {
  await updateBoardTitle({
    boardUuid: props.data.uuid,
    title: newTitle
  })
}
</script>

<template>
  <div class="w-full h-fit flex flex-col items-start justify-start bg-white px-3 py-6 border-t first:border-t-0">
    <div class="flex flex-row items-center justify-between w-full">
      <EditableText
        :text="data.title"
        :can-edit="canEditTitle"
        tag="h3"
        class-name="text-lg font-medium mb-4"
        :mutate="handleUpdateBoardTitle"
        :loading="updateBoardTitleLoading"
      />
      <span v-if="runtimeConfig.public.debug" class="text-sm text-gray-500">{{ data.uuid }}</span>
    </div>
    <div class="w-full overflow-x-auto">
      <div class="min-w-[920px] flex flex-row items-start justify-start gap-4">
        <div v-for="status in statuses" :key="status" class="w-1/5 h-full">
          <UButton variant="soft" :color="privateTaskStatusColorMap[status]" :label="$t(`private.task.status.${status}`)" class="w-full mb-2 cursor-default" />
          <div class="p-1">
            <div
              v-for="task in taskGroups[status]"
              :key="task.uuid"
              class="w-full p-3 flex flex-col items-start justify-start gap-2 text-sm mb-3 ring-1 ring-gray-200 rounded-lg cursor-pointer"
              @click="openProposalModal(task)"
            >
              <div class="font-medium">{{ task.title }}</div>
              <div class="flex flex-row items-center justify-start gap-2">
                <span class="text-gray-500">Budgets</span>
                <Bounties :bounties="task.budgets" :show-logo="false" :disable-popover="true" wrapper-class="flex flex-col items-end" />
              </div>
            </div>
            <div v-if="status === 'draft'">
              <UButton
                variant="ghost"
                icon="i-heroicons-plus"
                :label="$t('private.task.add')"
                class="w-full mb-2"
                :disabled="unclickable"
                @click="openAddProposalModal()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProposalModal v-model="privateTaskStore.isProposalModal" @proposal-added="onProposalAdded" />
  </div>
</template>
