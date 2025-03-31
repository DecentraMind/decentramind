<script setup lang="ts">
import { watch } from 'vue'
import { useAddPrivateTaskMutation, useDeleteProposalMutation, useSaveProposalMutation, useUpdatePrivateTaskStatusMutation } from '~/composables/community/communityQuery'
import { communityStore } from '~/stores/communityStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import PrivateTaskForm from './PrivateTaskForm.vue'
import { notificationStore } from '~/stores/notificationStore'
import { storeToRefs } from 'pinia'
import { useQueryClient } from '@tanstack/vue-query'
import { getPrivateTask } from '~/utils/community/community'
import type { PrivateAreaConfig } from '~/types'
import SettleConfirmModal from './SettleConfirmModal.vue'
import { amountToQuantity } from '~/utils/token'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const queryClient = useQueryClient()
const { showError, showSuccess } = $(notificationStore())
const { currentUuid: communityUuid } = $(communityStore())
const { isCurrentCommunityAdmin, isCurrentCommunityOwner, address } = $(useUserInfo())
const privateTaskStore = usePrivateTaskStore()
const { currentPrivateTask, isSettleConfirmModal } = storeToRefs(privateTaskStore)
const formRef = ref<InstanceType<typeof PrivateTaskForm> | null>(null)

const boardTitle = $computed(() => {
  const config = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
  const board = config?.boards.find(board => board.uuid === currentPrivateTask.value.boardUuid)
  return board?.title
})
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
    if (['draft', 'executing'].includes(currentPrivateTask.value.status)) {
      // only task editor can edit task
      return !isTaskEditor
    }
    return true
  } else {
    return false
  }
})

let isFetchingTask = $ref(false)

// Force fetch task data when modal opens
watch(() => props.modelValue, async (value) => {
  if (value && !isCreateMode) {
    try {
      isFetchingTask = true
      const uuid = currentPrivateTask.value.uuid
      if (!uuid) {
        throw new Error('Invalid task UUID')
      }

      console.log('fetching task', uuid)
      queryClient.invalidateQueries({ queryKey: ['community', 'privateTask', uuid] })
      const task = await queryClient.fetchQuery({
        queryKey: ['community', 'privateTask', uuid],
        queryFn: () => getPrivateTask(uuid),
        retry: 2,
        retryDelay: 1000
      })

      if (task) {
        privateTaskStore.updateCurrentPrivateTask(task)
        queryClient.setQueryData(['community', 'privateTask', uuid], task)
      }
    } catch (error) {
      console.error('Failed to fetch task:', error)
      showError('Failed to load task details')
    } finally {
      isFetchingTask = false
    }
  }
  if (!value) {
    console.log('resetting task')
    // when modal is closed, reset data
    privateTaskStore.resetCurrentPrivateTask()
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

const submitProposal = async (status: 'draft' | 'auditing') => {
  if (status === 'draft') {
    isSubmittingDraft = true
  } else {
    isSubmittingProposal = true
  }
  try {
    // Validate the form first
    const isValid = await formRef.value?.validate()
    if (!isValid) {
      showError('Please fix the form errors before submitting')
      return
    }

    const filteredState = {
      ...currentPrivateTask.value,
      budgets: currentPrivateTask.value.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID),
      status
    }

    // correct budget.quantity
    for (const budget of filteredState.budgets) {
      budget.quantity = await amountToQuantity(budget.amount, budget.tokenProcessID)
    }

    console.log('adding proposal', filteredState)
    await addPrivateTaskMutateAsync(filteredState)
    showSuccess('Proposal added.')
    emit('proposal-added', currentPrivateTask.value)
    emit('update:modelValue', false)
  } catch (error) {
    isSubmittingDraft = false
    isSubmittingProposal = false
    console.error('Failed to add proposal.', error)
    showError('Failed to add proposal.')
  }
}

const { mutateAsync: saveProposalMutateAsync, isPending: isSavePending } = useSaveProposalMutation({communityUuid: communityUuid!})
let isUpdatingStatus = $ref(false)
const saveProposal = async (updateStatus: boolean = false) => {
  try {
    // Validate the form first
    const isValid = await formRef.value?.validate()
    if (!isValid) {
      showError('Please fix the form errors before saving')
      return
    }

    const filteredState = {
      ...currentPrivateTask.value,
      budgets: currentPrivateTask.value.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    // correct budget.quantity
    for (const budget of filteredState.budgets) {
      budget.quantity = await amountToQuantity(budget.amount, budget.tokenProcessID)
    }
    if (updateStatus) {
      isUpdatingStatus = true
      if (!['draft', 'executing'].includes(currentPrivateTask.value.status)) {
        throw new Error('Only proposal or executing proposal can be updated.')
      }
      filteredState.status = currentPrivateTask.value.status === 'draft' ? 'auditing' : 'waiting_for_validation'
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
    showSuccess(`Proposal ${operation === 'approve' ? 'approved' : 'rejected'}.`)
    emit('update:modelValue', false)
  } catch (error) {
    showError(`Failed to ${operation} proposal.`)
    console.error(`Failed to ${operation} proposal.`, error)
  } finally {
    isRejectingProposal = false
  }
}

const { mutateAsync: deleteProposalMutateAsync, isPending: isDeletePending } = useDeleteProposalMutation({communityUuid: communityUuid!})
const deleteProposal = async () => {
  try {
    await deleteProposalMutateAsync(currentPrivateTask.value.uuid)
    showSuccess('Proposal deleted.')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to delete proposal.', error)
    showError('Failed to delete proposal.', error instanceof Error ? error.message : 'Unknown error')
  }
}
</script>

<template>
  <UModal
    :model-value="props.modelValue"
    prevent-close
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
        <h3 class="text-xl font-semibold">{{ isCreateMode ? 'Add Proposal in ' + boardTitle : currentPrivateTask.title }}</h3>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          aria-label="Close"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <div v-if="isFetchingTask" class="flex justify-center py-4">
        <UIcon name="svg-spinners:3-dots-fade" class="animate-spin" />
      </div>
      <div v-else>
        <PrivateTaskForm ref="formRef" :view-only="isViewOnly">
          <div v-if="isCreateMode" class="flex flex-row gap-2">
            <UButton
              :loading="isSubmittingDraft"
              :disabled="isAddPending"
              type="button"
              color="white"
              label="Save as Draft"
              @click="submitProposal('draft')"
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

          <div v-if="!isCreateMode && ['draft', 'executing'].includes(currentPrivateTask.status) && isTaskEditor" class="flex flex-row gap-2">
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
              color="green"
              label="Approve"
              @click="approveOrRejectProposal('approve')"
            />
            <UButton
              :loading="isApprovingOrRejecting && isRejectingProposal"
              :disabled="isApprovingOrRejecting && isRejectingProposal"
              type="button"
              color="red"
              label="Reject"
              @click="approveOrRejectProposal('reject')"
            />
          </div>

          <div v-if="!isCreateMode && currentPrivateTask.status === 'waiting_for_settlement' && isCommunityOwnerOrAdmin" class="flex flex-row gap-2">
            <UButton
              type="button"
              color="primary"
              label="Settle Proposal"
              @click="isSettleConfirmModal = true"
            />
          </div>
        </PrivateTaskForm>
      </div>
    </UCard>
  </UModal>
</template>
