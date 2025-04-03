<script setup lang="ts">
import { tokens, tokenChains } from '~/utils/constants'
import { arUrl, gateways, defaultTokenLogo } from '~/utils/arAssets'
import type { PrivateTask } from '~/types'
import { createProposalSchema, validateCreateProposalForm } from '~/utils/schemas'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import { storeToRefs } from 'pinia'
import type { Form } from '#ui/types'
import UserSelectMenu from '~/components/common/UserSelectMenu.vue'
import DateTimeRange from '~/components/common/DateTimeRange.vue'
import { usePrivateUnlockMembersQuery } from '~/composables/community/communityQuery'
import UserInfo from '~/components/users/UserInfo.vue'
import { getAoTxLink } from '~/utils/string'
import Bounties from '~/components/task/Bounties.vue'
import { openExternalLink } from '~/utils/window.client'

const props = defineProps({
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const privateTaskStore = usePrivateTaskStore()
const { currentPrivateTask } = storeToRefs(privateTaskStore)
const { currentUuid: communityUuid } = $(communityStore())
const { data: members } = usePrivateUnlockMembersQuery(communityUuid!)


const formRef = $ref<Form<PrivateTask> | null>(null)

// Expose validate method to parent component
const validate = async () => {
  if (!formRef) return false
  return await formRef.validate()
}

defineExpose({ validate })

// Token options
const tokenNames = Object.keys(tokens)

const insertBudget = (index: number) => {
  const newBudget = {
    amount: 0,
    tokenName: '',
    tokenProcessID: '',
    chain: tokenChains[0],
    quantity: BigInt(0),
    member: ''
  }

  const insertPosition = Math.max(0, Math.min(index + 1, currentPrivateTask.value.budgets.length))

  const updatedBudgets = [
    ...currentPrivateTask.value.budgets.slice(0, insertPosition),
    newBudget,
    ...currentPrivateTask.value.budgets.slice(insertPosition)
  ]

  privateTaskStore.updateCurrentPrivateTask({
    budgets: updatedBudgets
  })
}

const removeBudget = (index: number) => {
  const updatedBudgets = [...currentPrivateTask.value.budgets]
  updatedBudgets.splice(index, 1)
  privateTaskStore.updateCurrentPrivateTask({
    budgets: updatedBudgets
  })
}
</script>

<template>
  <UForm
    ref="formRef"
    :state="currentPrivateTask"
    :schema="createProposalSchema"
    :validate="validateCreateProposalForm"
    class="space-y-6"
  >
    <UFormGroup :label="$t('private.task.fields.title')" name="title">
      <template #default>
        <div class="flex justify-between items-center gap-2 mb-6">
          <UInput v-model="currentPrivateTask.title" :disabled="props.viewOnly" placeholder="Enter task title" required class="flex-1" />
          <UButton variant="soft" :label="$t(`private.task.status.${currentPrivateTask.status}`)" :color="privateTaskStatusColorMap[currentPrivateTask.status]" class="cursor-default" />
        </div>
      </template>
    </UFormGroup>

    <UFormGroup name="time" :label="$t('private.task.fields.timeRange')">
      <DateTimeRange
        v-model:start-at="currentPrivateTask.startAt"
        v-model:end-at="currentPrivateTask.endAt"
        :disabled="props.viewOnly"
      />
    </UFormGroup>

    <!-- For non-settled tasks: show the form group -->
    <template v-if="currentPrivateTask.status !== 'settled'">
      <UFormGroup
        v-for="(budget, index) in currentPrivateTask.budgets"
        :key="index"
        :name="`budgets[${index}]`"
        :label="index === 0 ? $t('private.task.fields.participantsAndBudgets') : ''"
        :ui="{ error: index === 0 ? 'hidden' : 'absolute' }"
      >
        <div class="flex gap-2 mb-1">
          <UserSelectMenu
            v-model="budget.member"
            placeholder="Select member"
            :disabled="props.viewOnly || currentPrivateTask.status !== 'draft'"
          />

          <!-- Amount and Token Selection -->
          <UInput
            v-model.number="budget.amount"
            :name="`budgets[${index}].amount`"
            type="number"
            placeholder="Amount"
            :ui="{ base: 'w-24 h-8' }"
            :disabled="props.viewOnly || currentPrivateTask.status !== 'draft'"
          />

          <USelectMenu
            v-model="budget.tokenName"
            :name="`budgets[${index}].tokenProcessID`"
            placeholder="Token"
            :options="tokenNames"
            :ui="{ wrapper: 'flex-1' }"
            :disabled="props.viewOnly || currentPrivateTask.status !== 'draft'"
            @change="
              (name:string) => {
                budget.tokenProcessID = tokens[name].processID
                budget.chain = tokenChains[0]
              }
            "
          >
            <template #option="{ option: name }">
              <img
                :src="
                  arUrl(tokens[name].logo || defaultTokenLogo, gateways.ario)
                "
                :alt="`logo of ${tokens[name].label}`"
                class="w-8 h-8 min-w-8 rounded-full border border-gray-200"
              >
              <span class="truncate" :title="tokens[name].label">{{ tokens[name].label }}</span>
            </template>
          </USelectMenu>

          <UButton
            v-if="currentPrivateTask.budgets.length > 1"
            variant="outline"
            icon="heroicons:x-mark"
            :disabled="props.viewOnly"
            :class="cn({
              'hidden': currentPrivateTask.status !== 'draft'
            })"
            @click="removeBudget(index)"
          />
          <UButton
            variant="outline"
            icon="heroicons:plus"
            :disabled="props.viewOnly"
            :class="cn({
              'hidden': currentPrivateTask.status !== 'draft'
            })"
            @click="insertBudget(index)"
          />
        </div>
      </UFormGroup>
    </template>

    <!-- For settled tasks: show the settled view -->
    <template v-else>
      <UFormGroup :label="$t('private.task.fields.participantsAndBudgets')">
        <div class="rounded-lg border border-gray-200 overflow-hidden">
          <div class="divide-y divide-gray-200">
            <div
              v-for="(budget, index) in currentPrivateTask.budgets"
              :key="index"
              class="px-4 py-3 flex items-center justify-between"
            >
              <UserInfo v-if="members" :address="budget.member" :members="members" />
              
              <div class="flex items-center space-x-2">
                <Bounties :bounties="[budget]" />
                
                <UButton
                  v-if="budget.settleTx"
                  variant="link"
                  size="xs"
                  icon="i-heroicons-arrow-top-right-on-square"
                  @click.prevent.stop="() => {
                    if (budget.settleTx) {
                      openExternalLink(getAoTxLink(budget.settleTx))
                    }
                  }"
                >
                  {{ $t('View Transaction') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UFormGroup>
    </template>

    <UFormGroup :label="$t('private.task.fields.description')" name="description">
      <UTextarea
        v-model="currentPrivateTask.description"
        :disabled="props.viewOnly || currentPrivateTask.status !== 'draft'"
        placeholder="Enter task description"
        :rows="4"
      />
    </UFormGroup>

    <UFormGroup
      :label="$t('private.task.fields.executionResult')"
      name="executionResult"
      :class="cn({
        'hidden': ['draft', 'auditing'].includes(currentPrivateTask.status)
      })"
    >
      <UTextarea
        v-model="currentPrivateTask.executionResult"
        placeholder="Enter execution result"
        :rows="3"
        :disabled="props.viewOnly || currentPrivateTask.status !== 'executing'"
      />
    </UFormGroup>


    <div v-if="currentPrivateTask.uuid" class="flex flex-col justify-start gap-2 mb-6">
      <div class="text-sm text-gray-500 flex justify-between"><span class="font-semibold select-none">Proposal UUID&emsp;</span><span class="text-gray-700">{{ currentPrivateTask.uuid }}</span></div>
      <div class="text-sm text-gray-500 flex justify-between">
        <span class="font-semibold select-none">Proposed by&emsp;</span>
        <UserInfo v-if="members" :address="currentPrivateTask.editors[0]" :members="members" />
      </div>
    </div>

    <div class="flex justify-end pt-4 gap-2">
      <slot />
    </div>
  </UForm>
</template>