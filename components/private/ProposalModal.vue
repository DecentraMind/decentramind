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

const { showError } = $(notificationStore())
const { currentUuid: communityUuid } = $(communityStore())
const privateTaskStore = usePrivateTaskStore()

const isViewOnly = $ref(true)

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
      </PrivateTaskForm>
    </UCard>
  </UModal>
</template>