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

const props = defineProps({
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const privateTaskStore = usePrivateTaskStore()
const { currentPrivateTask } = storeToRefs(privateTaskStore)

const formRef = $ref<Form<PrivateTask> | null>(null)

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
          <UButton variant="soft" :label="currentPrivateTask.status" :color="privateTaskStatusColorMap[currentPrivateTask.status]" class="cursor-default" />
        </div>
      </template>
    </UFormGroup>

    <UFormGroup name="time" :label="$t('private.task.fields.timeRange')">
      <DateTimeRange
        v-model="currentPrivateTask"
        :disabled="props.viewOnly"
      />
    </UFormGroup>

    <div>
      <UFormGroup
        v-for="(budget, index) in currentPrivateTask.budgets"
        :key="index"
        :name="`budgets[${index}]`"
        :label="index === 0 ? $t('private.task.fields.participantsAndBudgets') : ''"
        :ui="{ error: index === 0 ? 'hidden' : 'absolute' }"
      >
        <div class="flex gap-2 mb-3">
          <!-- 使用新的 UserSelectMenu 组件 -->
          <UserSelectMenu
            v-model="budget.member"
            placeholder="Select member"
            :disabled="props.viewOnly"
          />

          <!-- Amount and Token Selection -->
          <UInput
            v-model.number="budget.amount"
            :name="`budgets[${index}].amount`"
            type="number"
            placeholder="Amount"
            :ui="{ base: 'w-24 h-8' }"
            :disabled="props.viewOnly"
          />

          <USelectMenu
            v-model="budget.tokenName"
            :name="`budgets[${index}].tokenProcessID`"
            placeholder="Token"
            :options="tokenNames"
            :ui="{ wrapper: 'flex-1' }"
            :disabled="props.viewOnly"
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
            @click="removeBudget(index)"
          />
          <UButton
            variant="outline"
            icon="heroicons:plus"
            :disabled="props.viewOnly"
            @click="insertBudget(index)"
          />
        </div>
      </UFormGroup>
    </div>

    <UFormGroup :label="$t('private.task.fields.description')" name="description">
      <UTextarea v-model="currentPrivateTask.description" :disabled="props.viewOnly" placeholder="Enter task description" :rows="4" />
    </UFormGroup>

    <UFormGroup
      :label="$t('private.task.fields.executionResult')"
      name="executionResult"
      :class="cn({
        'hidden': !currentPrivateTask.uuid
      })"
    >
      <UTextarea
        v-model="currentPrivateTask.executionResult"
        placeholder="Enter execution result"
        :rows="3"
        :disabled="props.viewOnly"
      />
    </UFormGroup>


    <div v-if="currentPrivateTask.uuid" class="flex justify-between items-center gap-2 mb-6">
      <p class="text-sm text-gray-500"><span class="font-semibold">Proposal UUID:</span> {{ currentPrivateTask.uuid }}</p>
    </div>

    <div class="flex justify-end pt-4 gap-2">
      <slot />
    </div>
  </UForm>
</template>