
<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { CreateToken } from '~/types'
import { createTokenSchema, type CreateTokenSchema } from '~/utils/schemas'

const { createToken } = $(aoCommunityStore())
const state = $ref<CreateToken>({
  name: '',
  ticker: '',
  balance: 0,
})


async function onSubmit(event: FormSubmitEvent<CreateTokenSchema>) {
  // Do something with event.data
  console.log(event.data)
}

let creating = $ref(false)
let creatEnd = $ref(false)
let createResult = $ref('')
const create = async() => {
  creating = true
  try {
    const result = await createToken(state.name, state.ticker, state.balance)
    creating = false
    creatEnd = true
    createResult = result
  } catch (error) {
    creating = false
    creatEnd = true
    createResult = 'error'
  }
}
</script>








<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto px-10 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl text-center p-2">Create Token</div>
        </template>
      </UAlert>
      <UForm v-if="!creatEnd" ref="form" :schema="createTokenSchema" :state="state" class="space-y-4 p-5 pl-20 pt-10" @submit="onSubmit">
        <UFormGroup name="Name" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[100px]">Name</div>
          </template>
          <UInput v-model="state.name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>
        <UFormGroup name="Ticker" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[100px]">Ticker</div>
          </template>
          <UInput v-model="state.ticker" placeholder="Ticker" class="min-w-[100px] w-[430px]" />
        </UFormGroup>
        <UFormGroup name="Balance" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[100px]">Balance</div>
          </template>
          <UInput v-model="state.balance" placeholder="Ticker" class="min-w-[100px] w-[430px]" />
        </UFormGroup>
        <div class="flex justify-center">
          <UButton color="white" type="submit" size="xl" :loading="creating" @click="create">
            {{ $t('add') }}
          </UButton>
        </div>
      </UForm>
      <div v-if="creatEnd" class="w-[550px] mt-6">
        {{ createResult }}
      </div>
    </DashboardPanelContent>
  </UDashboardPage>
</template>