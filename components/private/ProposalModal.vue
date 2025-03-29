<script setup lang="ts">
import { watch } from 'vue'
import { useAddPrivateTaskMutation, useDeleteProposalMutation, useSaveProposalMutation, useUpdatePrivateTaskStatusMutation } from '~/composables/community/communityQuery'
import { communityStore } from '~/stores/communityStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import PrivateTaskForm from './PrivateTaskForm.vue'
import { notificationStore } from '~/stores/notificationStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  boardUuid: {
    type: String,
    required: true
  }
})

const { showError, showSuccess } = $(notificationStore())
const { currentUuid: communityUuid } = $(communityStore())
const { isCurrentCommunityAdmin, isCurrentCommunityOwner, address } = useUserInfo()
const privateTaskStore = usePrivateTaskStore()
const { currentPrivateTask } = storeToRefs(privateTaskStore)

const isCreateMode = $computed(() => {
  return !currentPrivateTask.value.uuid
})
const isTaskEditor = $computed(() => {
  if (!isCreateMode) {
    return currentPrivateTask.value.editors.includes(address)
  }
  return true
})
const isCommunityOwnerOrAdmin = $computed(() => {
  return isCurrentCommunityOwner || isCurrentCommunityAdmin
})

const isViewOnly = $computed(() => {
  if (!isCreateMode) {
    // view task or edit task
    if (['proposal', 'executing'].includes(currentPrivateTask.value.status)) {
      // only task editor can edit task
      return !isTaskEditor
    }
    return true
  } else {
    return false
  }
})

onMounted(() => {
  if (props.boardUuid && isCreateMode) {
    currentPrivateTask.value.boardUuid = props.boardUuid
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
      ...currentPrivateTask.value,
      budgets: currentPrivateTask.value.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    await addPrivateTaskMutateAsync(filteredState)
    showSuccess('Proposal added.')
    emit('proposal-added', currentPrivateTask.value)
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
      ...currentPrivateTask.value,
      budgets: currentPrivateTask.value.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    if (updateStatus) {
      isUpdatingStatus = true
      if (!['proposal', 'executing'].includes(currentPrivateTask.value.status)) {
        throw new Error('Only proposal or executing proposal can be updated.')
      }
      filteredState.status = currentPrivateTask.value.status === 'proposal' ? 'auditing' : 'waiting_for_validation'
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
    if (!['auditing', 'waiting_for_validation'].includes(currentPrivateTask.value.status)) {
      throw new Error('Only auditing or waiting for validation proposal can be approved.')
    }
    await updatePrivateTaskStatusMutateAsync({
      taskUuid: currentPrivateTask.value.uuid,
      operation
    })
    showSuccess('Proposal approved.')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to approve proposal.', error)
  } finally {
    isRejectingProposal = false
  }
}

const { mutateAsync: deleteProposalMutateAsync, isPending: isDeletePending } = useDeleteProposalMutation({communityUuid: communityUuid!})
const deleteProposal = async () => {
  await deleteProposalMutateAsync(currentPrivateTask.value.uuid)
  showSuccess('Proposal deleted.')
  emit('update:modelValue', false)
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
        <h3 class="text-xl font-semibold">{{ isCreateMode ? 'Add Proposal' : currentPrivateTask.title }}</h3>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          aria-label="Close"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <PrivateTaskForm :view-only="isViewOnly">
        <div v-if="isCreateMode" class="flex flex-row gap-2">
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

        <div v-if="!isCreateMode && ['proposal', 'executing'].includes(currentPrivateTask.status) && isTaskEditor" class="flex flex-row gap-2">
          <UButton
            :loading="isDeletePending"
            :disabled="isDeletePending"
            type="button"
            color="red"
            label="Delete Proposal"
            @click="deleteProposal()"
          />
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

        <div v-if="!isCreateMode && ['auditing', 'waiting_for_validation'].includes(currentPrivateTask.status) && isCommunityOwnerOrAdmin" class="flex flex-row gap-2">
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
