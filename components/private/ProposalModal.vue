<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { tokens, tokenChains } from '~/utils/constants'
import { arUrl, gateways, defaultTokenLogo } from '~/utils/arAssets'
import type { UserInfoWithAddress } from '~/types'
import { getPrivateUnlockMembers } from '~/utils/community/community'

// Only use what we need
const _props = defineProps<{
  modelValue: boolean
  boardUuid: string
}>()

const emit = defineEmits(['proposal-added', 'update:modelValue'])

interface BudgetItem {
  member: UserInfoWithAddress | null
  amount: number
  tokenName: string
  tokenProcessID: string
  chain: string
  quantity: bigint
}

const state = ref({
  title: '',
  startAt: Date.now(),
  endAt: Date.now(),
  description: '',
  executionResult: '',
  budgets: [{ 
    member: null,
    amount: 0, 
    tokenName: '', 
    tokenProcessID: '', 
    chain: tokenChains[0], 
    quantity: BigInt(0) 
  }] as BudgetItem[]
})

// Define a local state variable for the date range using Dayjs
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(state.value.startAt), dayjs(state.value.endAt)])

watch(dateRange, (newRange) => {
  state.value.startAt = newRange[0].valueOf()
  state.value.endAt = newRange[1].valueOf()
})

const addBudget = () => {
  state.value.budgets.push({ 
    member: null,
    amount: 0, 
    tokenName: '', 
    tokenProcessID: '', 
    chain: tokenChains[0], 
    quantity: BigInt(0) 
  })
}

const submitProposal = () => {
  // Emit the proposal-added event with the task data
  emit('proposal-added', state.value)
  emit('update:modelValue', false) // Close modal after submission
}

// Token options
const tokenNames = Object.keys(tokens)

// Members
const members = ref<Awaited<ReturnType<typeof getPrivateUnlockMembers>>>([])
const { currentUuid: communityUuid } = $(communityStore())

// Search function for the select menu
function search(query: string, users: Awaited<ReturnType<typeof getPrivateUnlockMembers>>) {
  if (!query) return users
  
  const lowercaseQuery = query.toLowerCase()
  return users.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) || 
    user.address.toLowerCase().includes(lowercaseQuery)
  )
}

onMounted(async () => {
  try {
    if (communityUuid) {
      // Fetch private members
      const privateMembers = await getPrivateUnlockMembers(communityUuid)
      console.log({ privateMembers })
      members.value = privateMembers
    }
  } catch (error) {
    console.error('Error fetching private members:', error)
  }
})
</script>

<template>
  <UModal
    :model-value="_props.modelValue"
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

      <UForm :state="state" class="space-y-6" @submit.prevent="submitProposal">
        <UFormGroup :label="$t('private.task.fields.title')" name="title">
          <UInput v-model="state.title" placeholder="Enter task title" required />
        </UFormGroup>

        <UFormGroup :label="$t('private.task.fields.timeRange')" name="timeRange">
          <a-range-picker v-model:value="dateRange" show-time class="w-full" />
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
            <div class="flex flex gap-2 mb-3">
              <!-- Member Selection -->
              <USelectMenu
                v-model="budget.member"
                :searchable="true"
                :search="search"
                :search-attributes="['address', 'name']"
                searchable-placeholder="Search by name or address..."
                :options="members"
                option-attribute="name"
                by="address"
                trailing
                placeholder="Select member"
                class="flex-1"
              >
                <template #option-empty="{ query }">
                  <q>{{ query }}</q> not found
                </template>
                <template #option="{ option }">
                  <div class="flex items-center space-x-2">
                    <ArAvatar
                      :src="option.avatar"
                      :alt="option.name"
                      class="w-6 h-6"
                    />
                    <div>
                      <span class="font-medium">{{ option.name }}</span>
                      <div class="text-xs text-gray-500 max-w-xs">{{ option.address }}</div>
                    </div>
                  </div>
                </template>
                <template #label>
                  <div v-if="budget.member" class="flex items-center space-x-2">
                    <ArAvatar
                      :src="budget.member.avatar"
                      :alt="budget.member.name"
                      class="w-6 h-6"
                    />
                    <div>
                      <span class="font-medium">{{ budget.member.name }}</span>
                      <div class="text-xs text-gray-500 max-w-xs">{{ budget.member.address }}</div>
                    </div>
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
                :ui="{ wrapper: 'w-24' }"
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
                    class="w-8 h-8 rounded-full border border-gray-200"
                  >
                  <span class="truncate" :title="tokens[name].label">{{ tokens[name].label }}</span>
                </template>
              </USelectMenu>
            </div>
          </UFormGroup>
          
          <UButton
            size="sm"
            variant="soft"
            icon="i-heroicons-plus"
            label="Add Budget"
            class="mt-2"
            @click="addBudget"
          />
        </div>

        <UFormGroup :label="$t('private.task.fields.executionResult')" name="executionResult">
          <UTextarea v-model="state.executionResult" placeholder="Enter execution result" :rows="3" />
        </UFormGroup>

        <div class="flex justify-end pt-4">
          <UButton type="submit" color="primary" label="Submit Proposal" />
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
