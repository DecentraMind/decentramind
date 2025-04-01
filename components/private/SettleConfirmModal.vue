<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import { useTransferTokenMutation } from '~/composables/tokenQuery'
import { usePrivateUnlockMembersQuery, useUpdateSettleTxMutation } from '~/composables/community/communityQuery'
import { communityStore } from '~/stores/communityStore'
import { notificationStore } from '~/stores/notificationStore'
import type { BudgetItem } from '~/types'
import { getAoTxLink } from '~/utils/string'
import { openExternalLink } from '~/utils/window.client'
import Bounties from '~/components/task/Bounties.vue'
import UserInfo from '~/components/users/UserInfo.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const queryClient = useQueryClient()
const { showSuccess, showError } = $(notificationStore())
const { currentUuid: communityUuid } = $(communityStore())
const privateTaskStore = usePrivateTaskStore()
const { currentPrivateTask } = storeToRefs(privateTaskStore)
const { data: members } = usePrivateUnlockMembersQuery(communityUuid!)

// State for tracking settlement status for each budget
const settlingStatus = ref(new Map<number, 'idle' | 'pending' | 'success' | 'error'>())
const allSettled = $computed(() => {
  return currentPrivateTask.value.budgets.every((_, index) => {
    return currentPrivateTask.value.budgets[index].settleTx || settlingStatus.value.get(index) === 'success'
  })
})

console.log('settle currentPrivateTask', currentPrivateTask.value.budgets)

// Transfer token mutation
const { mutate: transferToken } = useTransferTokenMutation()

// Update settlement transaction mutation
const { mutate: updateSettleTx } = useUpdateSettleTxMutation({ communityUuid: communityUuid! })

// Handle settling a budget
const handleSettleBudget = (budget: BudgetItem, index: number) => {
  if (budget.settleTx || settlingStatus.value.get(index) === 'pending') {
    return
  }
  
  settlingStatus.value.set(index, 'pending')
  
  console.log('handleSettleBudget budget', budget)
  transferToken({
    receiver: budget.member,
    token: {
      tokenName: budget.tokenName,
      tokenProcessID: budget.tokenProcessID,
      amount: budget.amount,
      quantity: budget.quantity,
      chain: budget.chain
    }
  }, {
    onSuccess: (data) => {
      const { transferTx } = data
      // Update the settleTx in AO
      updateSettleTx({
        taskUuid: currentPrivateTask.value.uuid,
        budgetIndex: index + 1, // Lua arrays are 1-indexed
        settleTx: transferTx
      }, {
        onSuccess: () => {
          settlingStatus.value.set(index, 'success')
          showSuccess(`Successfully settled budget for ${budget.member}`)
          
          privateTaskStore.updateCurrentPrivateTask({
            budgets: currentPrivateTask.value.budgets.map((b, i) => {
              if (i === index) {
                return { ...b, settleTx: transferTx }
              }
              return b
            })
          })
          // Check if all budgets are settled
          const allDone = currentPrivateTask.value.budgets.every((b, i) => {
            return b.settleTx || settlingStatus.value.get(i) === 'success'
          })
          
          if (allDone) {
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['community', 'privateTask', currentPrivateTask.value.uuid] })
            queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
          }
        },
        onError: (error) => {
          settlingStatus.value.set(index, 'error')
          console.error('Failed to update settlement transaction:', error)
          showError('Token transferred but failed to update settlement record')
        }
      })
    },
    onError: (error) => {
      settlingStatus.value.set(index, 'error')
      console.error('Failed to transfer token:', error)
      showError(`Failed to transfer token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
}

// Get status for a budget
const getBudgetStatus = (index: number) => {
  if (currentPrivateTask.value.budgets[index].settleTx) {
    return 'settled'
  }
  return settlingStatus.value.get(index) || 'idle'
}

// Reset state when modal is closed
watch(() => props.modelValue, (value) => {
  if (!value) {
    settlingStatus.value.clear()
  }
})


</script>

<template>
  <UModal
    :model-value="props.modelValue"
    :ui="{
      width: 'sm:max-w-lg',
      overlay: {
        background: 'bg-gray-900/50'
      }
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold">Settle Task Payments</h3>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          aria-label="Close"
          @click="emit('update:modelValue', false)"
        />
      </div>
      
      <div class="space-y-6">
        <p class="text-sm text-gray-600">
          Transfer tokens to each participant to complete this task. Once all transfers are complete, the task will be marked as settled.
        </p>
        
        <div class="rounded-lg border border-gray-200 overflow-hidden">
          <div class="bg-gray-50 px-4 py-2">
            <h4 class="font-medium">{{ currentPrivateTask.title }}</h4>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div
              v-for="(budget, index) in currentPrivateTask.budgets"
              :key="index"
              class="px-4 py-3 flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <div class="flex flex-col gap-1">
                  <UserInfo v-if="members" :address="budget.member" :members="members" />
                  <Bounties :bounties="[budget]" :show-plus="false" />
                </div>
              </div>
              
              <div class="flex flex-col items-end space-x-2">
                <template v-if="budget.settleTx">
                  <UBadge color="green" variant="subtle" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-check-circle" class="h-4 w-4" />
                    <span>Settled</span>
                  </UBadge>
                  
                  <UButton
                    icon="i-heroicons-arrow-top-right-on-square"
                    variant="link"
                    size="xs"
                    :label="$t('View Transaction')"
                    @click.prevent.stop="() => {
                      if (budget.settleTx) {
                        openExternalLink(getAoTxLink(budget.settleTx))
                      }
                    }"
                  />
                </template>
                <template v-else>
                  <UButton
                    :loading="getBudgetStatus(index) === 'pending'"
                    :disabled="getBudgetStatus(index) === 'pending'"
                    :color="getBudgetStatus(index) === 'error' ? 'red' : 'primary'"
                    size="sm"
                    @click="handleSettleBudget(budget, index)"
                  >
                    <template v-if="getBudgetStatus(index) === 'error'">Retry</template>
                    <template v-else>Transfer</template>
                  </UButton>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="allSettled" class="flex flex-col items-center justify-center py-4">
          <UIcon name="i-heroicons-check-circle" class="h-12 w-12 text-green-500 mb-2" />
          <p class="text-green-600 font-medium">All payments settled successfully!</p>
          <p class="text-sm text-gray-500 mb-4">The task has been marked as completed.</p>
          <UButton
            color="green"
            variant="soft"
            @click="privateTaskStore.isProposalModal = false; emit('update:modelValue', false)"
          >
            Close
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template> 