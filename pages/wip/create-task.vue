<script setup lang="ts">
definePageMeta({
  layout: "wip",
});


import type { FormSubmitEvent } from '#ui/types'
import { sub, format, isSameDay, type Duration } from 'date-fns'

const tokenOptions = [
  { label: 'Eth', value: 'Eth' },
  { label: 'USDT', value: 'USDT' },
  { label: 'AR', value: 'AR' }
]

const chainOptions = [
  { label: 'Ethereum Mainnet', value: 'Ethereum Mainnet' },
  { label: 'Linea Mainnet', value: 'Linea Mainnet' },
  { label: 'Arweave Mainnet', value: 'Arweave Mainnet' }
]

const timeZoneOptions = [
  { label: 'ACDT', value: 'ACDT'},
  { label: 'AT', value: 'AT'},
]

const state = reactive({
  input: undefined,
  inputMenu: undefined,
  textarea: undefined,
  select: undefined,
  selectMenu: undefined,
  checkbox: undefined,
  toggle: undefined,
  radio: undefined,
  radioGroup: undefined,
  switch: undefined,
  range: undefined
})




const form = ref()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}

const ranges = [
  { label: 'Last 7 days', duration: { days: 7 } },
  { label: 'Last 14 days', duration: { days: 14 } },
  { label: 'Last 30 days', duration: { days: 30 } },
  { label: 'Last 3 months', duration: { months: 3 } },
  { label: 'Last 6 months', duration: { months: 6 } },
  { label: 'Last year', duration: { years: 1 } }
]
const selected = ref({ start: sub(new Date(), { days: 14 }), end: new Date() })

function isRangeSelected(duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}

function selectRange(duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
}
</script>

<template>
  <!-- <div class="bg-red-400">create task</div> -->
  <UForm ref="form" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup name="input" label="任务封面">
      <UInput type="file" size="sm" />
    </UFormGroup>

    <UFormGroup name="input" label="任务名称">
      <UInput placeholder="name" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务简介">
      <UTextarea />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务规则">
      <UTextarea placeholder="已自动生成任务规则" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务奖励">
      <div class="flex justify-between items-center">
        <UInput placeholder="数量" />

        <UInputMenu placeholder="Token" :options="tokenOptions" />

        <UInputMenu placeholder="链" :options="chainOptions" />
      </div>



    </UFormGroup>
    <UFormGroup name="input" label="总奖励任务数">
      <UInput placeholder="指奖励多少场space" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务周期">
      <div class="flex justify-between items-center">
        <USelect placeholder="时区" :options="timeZoneOptions" />


        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid">
            {{ format(selected.start, 'd MMM, yyy') }} - {{ format(selected.end, 'd MMM, yyy') }}
          </UButton>

          <template #panel="{ close }">
            <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
              <div class="hidden sm:flex flex-col py-4">
                <UButton v-for="(range, index) in ranges" :key="index" :label="range.label" color="gray" variant="ghost"
                  class="rounded-none px-6"
                  :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                  truncate @click="selectRange(range.duration)" />
              </div>

              <DatePicker v-model="selected" @close="close" />
            </div>
          </template>
        </UPopover>
      </div>




    </UFormGroup>

    <UButton type="submit">
      Submit
    </UButton>

    <UButton variant="outline" class="ml-2" @click="form.clear()">
      Clear
    </UButton>
  </UForm>
</template>
