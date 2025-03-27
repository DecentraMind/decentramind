<script setup lang="ts">
import { watch } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { tokens, tokenChains } from '~/utils/constants'
import { arUrl, gateways, defaultTokenLogo } from '~/utils/arAssets'
import { shortString } from '~/utils/string'
import type { PrivateTask, PrivateUnlockMember } from '~/types'
import { useAddPrivateTaskMutation, usePrivateUnlockMembersQuery } from '~/composables/community/communityQuery'
import { createProposalSchema, validateCreateProposalForm } from '~/utils/schemas'

const props = defineProps<{
  modelValue: boolean
  boardUuid: string
}>()

const { showError } = $(notificationStore())

const { currentUuid: communityUuid } = $(communityStore())
const emit = defineEmits(['proposal-added', 'update:modelValue'])

const formRef = ref()
const state = $ref<PrivateTask>({
  title: '',
  uuid: '',
  boardUuid: props.boardUuid,
  status: 'proposal',
  editors: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  startAt: Date.now(),
  endAt: Date.now(),
  description: '',
  executionResult: '',
  budgets: [{
    member: '',
    amount: 0,
    tokenName: '', 
    tokenProcessID: '', 
    chain: tokenChains[0], 
    quantity: BigInt(0) 
  }]
})

// Define a local state variable for the date range using Dayjs
const dateRange = $ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(state.startAt), dayjs(state.endAt)])

watch(dateRange, (newRange) => {
  state.startAt = newRange[0].valueOf()
  state.endAt = newRange[1].valueOf()
})

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
      ...state,
      budgets: state.budgets.filter(budget => budget.amount > 0 && budget.tokenName && budget.tokenProcessID)
    }
    await addPrivateTaskMutateAsync(filteredState)
    // Emit the proposal-added event with the task data
    emit('proposal-added', state)
    emit('update:modelValue', false) // Close modal after submission
  } catch (error) {
    console.error('Failed to add proposal.', error)
    showError('Failed to add proposal.')
  }
}

// Token options
const tokenNames = Object.keys(tokens)

// Search function for the select menu
function search(query: string, users: PrivateUnlockMember[]) {
  if (!query) return users
  
  const lowercaseQuery = query.toLowerCase()
  return users.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) || 
    user.address.toLowerCase().includes(lowercaseQuery)
  )
}

const { data: members } = usePrivateUnlockMembersQuery(communityUuid!)

const budgetMembers = $ref<PrivateUnlockMember[]>([])

const addBudget = () => {
  budgetMembers.push({ 
    address: '',
    name: '',
    avatar: ''
  })
}
const removeBudget = (index: number) => {
  state.budgets.splice(index, 1)
}
watch(budgetMembers, (newBudgetMembers) => {
  state.budgets = newBudgetMembers.map((member, index) => {
    const existingBudget = state.budgets[index] || {
      amount: 0,
      tokenName: '',
      tokenProcessID: '',
      chain: tokenChains[0],
      quantity: BigInt(0),
      member: ''
    }
    return {
      ...existingBudget,
      member: member.address
    }
  })
})

const timezone = $ref('')
function handleDateChange(
  value: [string, string] | [Dayjs, Dayjs],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: [string, string],
) {
  // TODO get tiemstamp based on timezone
  console.log({ value, dateRange, timezone })
  if (!dateRange) {
    return
  }

  const offset = new Date().getTimezoneOffset() * 60000
  const tz = timezone.match(/[-+]\d+/)
  
  const timezoneOffset = tz ? parseInt(tz[0]) * -60*60*1000 : offset
  // translate to UTC time
  state.startAt = new Date(dateRange[0].toString()).getTime() - offset + timezoneOffset
  state.endAt = new Date(dateRange[1].toString()).getTime() - offset + timezoneOffset
  formRef.value.validate('time')
  console.log({
    offset,
    timezoneOffset,
    startTime: formatDate(state.startAt),
    start: state.startAt,
    endTime: formatDate(state.endAt)
  })
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

      <UForm
        ref="formRef"
        :state="state"
        :schema="createProposalSchema"
        :validate="validateCreateProposalForm"
        class="space-y-6"
        @submit="submitProposal"
      >
        <UFormGroup :label="$t('private.task.fields.title')" name="title">
          <UInput v-model="state.title" placeholder="Enter task title" required />
        </UFormGroup>

        <UFormGroup name="time" :label="$t('private.task.fields.timeRange')">
          <div class="flex justify-between items-center gap-x-1">
            <USelect
              v-model="timezone"
              :placeholder="$t('Time Zone')"
              :options="timezones"
              :ui="{
                variant: {
                  outline:
                    'ring-gray-300 dark:ring-primary-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
                },
              }"
              @change="handleDateChange"
            />
            <a-range-picker
              v-model:value="dateRange"
              show-time
              @change="handleDateChange"
            />
          </div>
        </UFormGroup>

        <UFormGroup :label="$t('private.task.fields.description')" name="description">
          <UTextarea v-model="state.description" placeholder="Enter task description" :rows="4" />
        </UFormGroup>

        <div>
          <UFormGroup
            v-for="(budget, index) in state.budgets"
            :key="index"
            :name="`budgets[${index}]`"
            :label="index === 0 ? $t('private.task.fields.participantsAndBudgets') : ''"
            :ui="{ error: index === 0 ? 'hidden' : 'absolute' }"
          >
            <div class="flex gap-2 mb-3">
              <!-- Member Selection -->
              <USelectMenu
                v-model="budgetMembers[index]"
                :searchable="true"
                :search="search"
                :search-attributes="['address', 'name']"
                searchable-placeholder="Search by name or address..."
                :options="members"
                option-attribute="name"
                trailing
                leading
                by="address"
                placeholder="Select member"
                class="w-60"
              >
                <template #option-empty="{ query }">
                  <q>{{ query }}</q> not found
                </template>
                <template #option="{ option }">
                  <div class="flex items-center space-x-2">
                    <ArAvatar
                      :src="option.avatar"
                      :alt="option.name"
                      size="2xs"
                    />
                    <span class="font-medium">{{ option.name }}</span>
                    <div class="text-xs text-gray-500 max-w-xs">{{ shortString(option.address) }}</div>
                  </div>
                </template>
                <template #label>
                  <div v-if="budgetMembers[index]" class="flex items-center space-x-2">
                    <ArAvatar
                      :src="budgetMembers[index].avatar"
                      :alt="budgetMembers[index].name"
                      size="2xs"
                    />
                    <span class="font-medium">{{ budgetMembers[index].name }}</span>
                    <div class="text-xs text-gray-500 max-w-xs">{{ shortString(budgetMembers[index].address) }}</div>
                  </div>
                  <span v-else>Select member</span>
                </template>
              </USelectMenu>

              <!-- Amount and Token Selection -->
              <UInput
                v-model.number="budget.amount"
                :name="`budgets[${index}].amount`"
                type="number"
                placeholder="Amount"
                :ui="{ base: 'w-24 h-8' }"
              />

              <USelectMenu
                v-model="budget.tokenName"
                :name="`budgets[${index}].tokenProcessID`"
                placeholder="Token"
                :options="tokenNames"
                :ui="{ wrapper: 'flex-1' }"
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
                variant="outline"
                icon="heroicons:x-mark"
                :class="cn({
                  '!mr-10': index !== state.budgets.length - 1,
                })"
                @click="removeBudget(index)"
              />
              <UButton
                v-if="index === state.budgets.length-1"
                variant="outline"
                icon="heroicons:plus"
                @click="addBudget"
              />
            </div>
          </UFormGroup>
        </div>

        <UFormGroup :label="$t('private.task.fields.executionResult')" name="executionResult">
          <UTextarea v-model="state.executionResult" placeholder="Enter execution result" :rows="3" />
        </UFormGroup>

        <div class="flex justify-end pt-4 gap-2">
          <UButton
            :loading="isSubmittingDraft"
            :disabled="isAddPending"
            type="button"
            color="white"
            label="Save as Draft"
            @click="async () => {
              try {
                const isValid = formRef && await formRef.validate()
                if (isValid) {
                  submitProposal('proposal')
                }
              } catch (error) {
                console.error('Failed to validate form.', error)
                showError('Failed to validate form.')
              }
            }"
          />
          <UButton
            :loading="isSubmittingProposal"
            :disabled="isAddPending"
            type="button"
            color="primary"
            label="Submit Proposal"
            @click="async () => { 
              try {
                const isValid = formRef && await formRef.validate()
                if (isValid) {
                  submitProposal('auditing')
                }
              } catch (error) {
                console.error('Failed to validate form.', error)
                showError('Failed to validate form.')
              }
            }"
          />
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
