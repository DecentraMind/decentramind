<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { sub, format, isSameDay, type Duration } from 'date-fns'

const { createTask, getAllTasks } = $(taskStore())
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
const selected = ref({ start: sub(new Date(), { days: 14 }), end: new Date() })
function isRangeSelected(duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}
function selectRange(duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
}
const state = $ref({
  taskLogo: undefined,
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  rewardTotal: undefined,
  zone: undefined,
})
const transData = {
  taskId: "",
  taskLogo: undefined,
  taskName: undefined,
  taskInfo: undefined,
  taskRule: undefined,
  tokenNumber: undefined,
  tokenType: undefined,
  tokenChain: undefined,
  rewardTotal: undefined,
  zone: undefined,
  startTime: "",
  endTime: "",
  buildNumber: 0,
  joined: 0
}
const form = $ref()
function uuid() {
  var str = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return str.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  transData.taskId = uuid()
  transData.taskLogo = event.data.taskLogo
  transData.taskName = event.data.taskName
  transData.taskInfo = event.data.taskInfo
  transData.taskRule = event.data.taskRule
  transData.tokenNumber = event.data.tokenNumber
  transData.tokenType = event.data.tokenType.value
  transData.tokenChain = event.data.tokenChain.value
  transData.rewardTotal = event.data.rewardTotal
  transData.zone = event.data.zone
  transData.startTime = selected.value.start.toLocaleString()
  transData.endTime = selected.value.end.toLocaleString()
  console.log(transData)
  createTask(transData, "CreateTask")
}
const ranges = [
  { label: 'Last 7 days', duration: { days: 7 } },
  { label: 'Last 14 days', duration: { days: 14 } },
  { label: 'Last 30 days', duration: { days: 30 } },
  { label: 'Last 3 months', duration: { months: 3 } },
  { label: 'Last 6 months', duration: { months: 6 } },
  { label: 'Last year', duration: { years: 1 } }
]

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel>
      <UDashboardNavbar/>
      <UForm ref="form" :state="state" class="space-y-4 ml-10" @submit="onSubmit">
        <UFormGroup name="taskLogo" label="任务封面">
          <UInput v-model="state.taskLogo" type="file" size="sm" />
        </UFormGroup>

        <UFormGroup name="taskName" label="任务名称">
          <UInput v-model="state.taskName" placeholder="name" />
        </UFormGroup>

        <UFormGroup name="taskInfo" label="任务简介">
          <UTextarea v-model="state.taskInfo" />
        </UFormGroup>

        <UFormGroup name="taskRule" label="任务规则">
          <UTextarea v-model="state.taskRule" placeholder="已自动生成任务规则" />
        </UFormGroup>

        <UFormGroup name="textarea" label="任务奖励">
          <div class="flex justify-between items-center">
            <UInput v-model="state.tokenNumber" placeholder="数量" />

            <UInputMenu v-model="state.tokenType" placeholder="Token" :options="tokenOptions" />

            <UInputMenu v-model="state.tokenChain" placeholder="链" :options="chainOptions" />
          </div>
        </UFormGroup>
        <UFormGroup name="rewardTotal" label="总奖励任务数">
          <UInput v-model="state.rewardTotal" placeholder="指奖励多少场space" />
        </UFormGroup>
        <UFormGroup name="textarea" label="任务周期">
          <div class="flex justify-between items-center">
            <USelect v-model="state.zone" placeholder="时区" :options="timeZoneOptions" />
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
      <NuxtPage />
    </UDashboardPanel>
  </UDashboardPage>
</template>
