<script setup lang="ts">
import { watch } from 'vue'
import { useAddPrivateTaskMutation } from '~/composables/community/communityQuery'
import { communityStore } from '~/stores/communityStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import PrivateTaskForm from './PrivateTaskForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  boardUuid: {
    type: String,
    required: true
  },
  taskUuid: {
    type: String,
    default: undefined
  }
})

const { showError, showSuccess } = $(notificationStore())
const { currentUuid: communityUuid } = $(communityStore())
const { isCurrentCommunityAdmin, isCurrentCommunityOwner, address } = useUserInfo()
const privateTaskStore = usePrivateTaskStore()

const isCreateMode = $computed(() => {
  return !props.taskUuid
})
const isTaskEditor = $computed(() => {
  if (!isCreateMode) {
    return privateTaskStore.currentPrivateTask.editors.includes(address)
  }
  return true
})
const isCommunityOwnerOrAdmin = $computed(() => {
  return isCurrentCommunityOwner || isCurrentCommunityAdmin
})

const isViewOnly = $computed(() => {
  if (!isCreateMode) {
    // view task or edit task
    if (['proposal', 'executing'].includes(privateTaskStore.currentPrivateTask.status)) {
      // only task editor can edit task
      return !isTaskEditor
    }
  } else {
    return false
  }
  return true
})

onMounted(() => {
  if (props.boardUuid) {
    privateTaskStore.currentPrivateTask.boardUuid = props.boardUuid
  }
  if (props.taskUuid) {
    // load task
  }
})

const emit = defineEmits(['proposal-added', 'update:modelValue'])

let isSubmittingDraft = $ref(false)
let isSubmittingProposal = $ref(false)
const { mutateAsync: addPrivateTaskMutateAsync, isPending: isAddPending, status: addPrivateTaskStatus } = useAddPrivateTaskMutation({communityUuid: communityUuid!})

watch(addPrivateTaskStatus, (status) => {
  if (status === 'success' || status === 'error') {
    isSubmittingDraft = false
    isSubmittingProposal = false
  }
})

const submitProposal = async (status: 'proposal' | 'auditing') => {
  if (status === 'proposal') {
    isSubmittingDraft = true
  } else {
    isSubmittingProposal = true
  }
  try {
    const filteredState = {
      ...privateTaskStore.currentPrivateTask,
      budgets: privateTaskStore.currentPrivateTask.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    await addPrivateTaskMutateAsync(filteredState)
    emit('proposal-added', privateTaskStore.currentPrivateTask)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to add proposal.', error)
    showError('Failed to add proposal.')
  }
}

const saveProposal = async () => {
  try {
    const filteredState = {
      ...privateTaskStore.currentPrivateTask,
      budgets: privateTaskStore.currentPrivateTask.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    // TODO update proposal
    // await addPrivateTaskMutateAsync(filteredState)
    showSuccess('Proposal saved.')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to save proposal.', error)
    showError('Failed to save proposal.')
  }
}
</script>

<template>
  <UModal
    :model-value="props.modelValue"
    :ui="{
      width: 'sm:max-w-xl',
      overlay: {
        background: 'bg-gray-900/50'
      }
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold">Add Proposal</h3>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          aria-label="Close"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <PrivateTaskForm :view-only="isViewOnly">
        <div v-if="isCreateMode">
          <UButton
            :loading="isSubmittingDraft"
            :disabled="isAddPending"
            type="button"
            color="white"
            label="Save as Draft"
            @click="submitProposal('proposal')"
          />
          <UButton
            :loading="isSubmittingProposal"
            :disabled="isAddPending"
            type="button"
            color="primary"
            label="Submit Proposal"
            @click="submitProposal('auditing')"
          />
        </div>
        <div v-if="!isCreateMode && ['proposal', 'executing'].includes(privateTaskStore.currentPrivateTask.status) && isTaskEditor">
          <UButton
            :loading="isSubmittingDraft"
            :disabled="isAddPending"
            type="button"
            color="white"
            label="Save"
            @click="saveProposal()"
          />
        </div>
      </PrivateTaskForm>
    </UCard>
  </UModal>
</template>
