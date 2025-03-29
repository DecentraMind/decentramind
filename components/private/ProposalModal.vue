<script setup lang="ts">
import { watch } from 'vue'
import { useAddPrivateTaskMutation, useSaveProposalMutation, useUpdatePrivateTaskStatusMutation } from '~/composables/community/communityQuery'
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
    return true
  } else {
    return false
  }
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

const { mutateAsync: saveProposalMutateAsync, isPending: isSavePending } = useSaveProposalMutation({communityUuid: communityUuid!})
let isUpdatingStatus = $ref(false)
const saveProposal = async (updateStatus: boolean = false) => {
  try {
    const filteredState = {
      ...privateTaskStore.currentPrivateTask,
      budgets: privateTaskStore.currentPrivateTask.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    if (updateStatus) {
      isUpdatingStatus = true
      if (!['proposal', 'executing'].includes(privateTaskStore.currentPrivateTask.status)) {
        throw new Error('Only proposal or executing proposal can be updated.')
      }
      filteredState.status = privateTaskStore.currentPrivateTask.status === 'proposal' ? 'auditing' : 'waiting_for_validation'
    }
    await saveProposalMutateAsync(filteredState)
    showSuccess('Proposal saved.')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to save proposal.', error)
    showError('Failed to save proposal.')
  } finally {
    isUpdatingStatus = false
  }
}

const { mutateAsync: updatePrivateTaskStatusMutateAsync, isPending: isApprovingOrRejecting } = useUpdatePrivateTaskStatusMutation({communityUuid: communityUuid!})
let isRejectingProposal = $ref(false)
const approveOrRejectProposal = async (operation: 'approve' | 'reject') => {
  try {
    if (operation == 'reject') {
      isRejectingProposal = true
    }
    if (!['auditing', 'waiting_for_validation'].includes(privateTaskStore.currentPrivateTask.status)) {
      throw new Error('Only auditing or waiting for validation proposal can be approved.')
    }
    await updatePrivateTaskStatusMutateAsync({
      taskUuid: privateTaskStore.currentPrivateTask.uuid,
      operation
    })
  } catch (error) {
    console.error('Failed to approve proposal.', error)
  } finally {
    isRejectingProposal = false
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
            :loading="isSavePending && !isUpdatingStatus"
            :disabled="isSavePending && !isUpdatingStatus"
            type="button"
            color="white"
            label="Save Draft"
            @click="saveProposal()"
          />
          <UButton
            :loading="isSavePending && isUpdatingStatus"
            :disabled="isSavePending && isUpdatingStatus"
            type="button"
            label="Submit Proposal"
            color="primary"
            @click="saveProposal(true)"
          />
        </div>
        <div v-if="!isCreateMode && ['auditing', 'waiting_for_validation'].includes(privateTaskStore.currentPrivateTask.status) && isCommunityOwnerOrAdmin">
          <UButton
            :loading="isApprovingOrRejecting && !isRejectingProposal"
            :disabled="isApprovingOrRejecting && !isRejectingProposal"
            type="button"
            color="white"
            label="Approve"
            @click="approveOrRejectProposal('approve')"
          />
          <UButton
            :loading="isApprovingOrRejecting && isRejectingProposal"
            :disabled="isApprovingOrRejecting && isRejectingProposal"
            type="button"
            color="white"
            label="Reject"
            @click="approveOrRejectProposal('reject')"
          />
        </div>
      </PrivateTaskForm>
    </UCard>
  </UModal>
</template>
