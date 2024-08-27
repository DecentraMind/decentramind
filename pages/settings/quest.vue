<script setup lang="ts">
import { denominations } from '~/utils/constants'
import { useTaskStore } from '~/stores/taskStore'
import type { Bounty } from '~/types'

const { getAllBounty } = useTaskStore()
const { address } = $(aoStore())
let bounties = $ref<Bounty[]>([])
const did = $ref([])
const created = $ref([])
let result = $ref(0)

function categorizeByTaskId(data: Bounty[]): Record<string, Bounty[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.taskPid]) {
      acc[item.taskPid] = []
    }
    acc[item.taskPid].push(item)
    return acc
  }, {} as Record<string, Bounty[]>)
}
onMounted( async () => {
  bounties = await getAllBounty()
  const cori:Bounty[] = []
  const dori:Bounty[] = []

  for(let i = 0; i < bounties.length; ++i){
    const tt = bounties[i]
    if(address === tt.sender){
      cori.push(tt)
    }
    if(address === tt.recipient){
      dori.push(tt)
    }
  }
  // 根据任务分类好的，将含有两种bounty的加和在一起
  const categorizedC = categorizeByTaskId(cori)
  const categorizedD = categorizeByTaskId(dori)
  for (const taskId in categorizedC) {
    if (categorizedC[taskId]) {
      const taskArray = categorizedC[taskId]
      if(taskArray.length > 1){
        const b = (taskArray[0].tokenNumber / denominations[taskArray[0].tokenType as TokenName]) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / denominations[taskArray[1].tokenType as TokenName]) + ' ' + taskArray[1].tokenType

        const combine = {
          communityName: taskArray[0].communityName,
          taskName: taskArray[0].taskName,
          receive: taskArray[0].receive,
          send: taskArray[0].send,
          communityId: taskArray[0].communityId,
          tokenNumber: taskArray[0].tokenNumber,
          taskId: taskArray[0].taskId,
          tokenType: taskArray[0].tokenType,
          show: b
        }
        created.push(combine)
      }else{
        const b = (taskArray[0].tokenNumber / denominations[taskArray[0].tokenType as TokenName]) + ' ' + taskArray[0].tokenType
        const combine = {
          communityName: taskArray[0].communityName,
          taskName: taskArray[0].taskName,
          receive: taskArray[0].receive,
          send: taskArray[0].send,
          communityId: taskArray[0].communityId,
          tokenNumber: taskArray[0].tokenNumber,
          taskId: taskArray[0].taskId,
          tokenType: taskArray[0].tokenType,
          show: b
        }
        created.push(combine)
      }

    }
  }
  for (const taskId in categorizedD) {
    if (categorizedD.hasOwnProperty(taskId)) {
      const taskArray = categorizedD[taskId]
      if(taskArray.length > 1){
        const b = (taskArray[0].tokenNumber / denominations[taskArray[0].tokenType as TokenName]) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / denominations[taskArray[1].tokenType as TokenName]) + ' ' + taskArray[1].tokenType
        const combine = {
          communityName: taskArray[0].communityName,
          taskName: taskArray[0].taskName,
          receive: taskArray[0].receive,
          send: taskArray[0].send,
          communityId: taskArray[0].communityId,
          tokenNumber: taskArray[0].tokenNumber,
          taskId: taskArray[0].taskId,
          tokenType: taskArray[0].tokenType,
          show: b
        }
        did.push(combine)
      }else{
        const b = (taskArray[0].tokenNumber / denominations[taskArray[0].tokenType as TokenName]) + ' ' + taskArray[0].tokenType
        const combine = {
          communityName: taskArray[0].communityName,
          taskName: taskArray[0].taskName,
          receive: taskArray[0].receive,
          send: taskArray[0].send,
          communityId: taskArray[0].communityId,
          tokenNumber: taskArray[0].tokenNumber,
          taskId: taskArray[0].taskId,
          tokenType: taskArray[0].tokenType,
          show: b
        }
        did.push(combine)
      }

    }
  }
  result = created.length + did.length
})



const taskForm = $ref({
    showTasknum: true,
})
function onSubmitTask () {
  console.log('Submitted form:', taskForm)
}

</script>

<template>
  <UDashboardPanelContent class="p-4 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}" @submit.prevent="onSubmitTask">
      <template #header>
        <div class="text-xl flex items-center pl-5">
          <h3 class="w-[420px]">
            {{ $t('setting.task.completed') }}： {{ result }}
          </h3>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
