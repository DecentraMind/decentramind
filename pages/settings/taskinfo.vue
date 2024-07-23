<script setup lang="ts">
const state = $ref<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})
interface TaskData {
  communityName: string;
  taskName: string;
  receive: string;
  send: string;
  communityId: string;
  tokenNumber: number;
  taskId: string;
  tokenType: string;
}
async function onChange () {
  // Do something with data
  console.log(state)
}
const { getAllBounty, denomination } = $(taskStore())
const { address } = $(aoStore())
let bounties = $ref([])
let did = $ref([])
let created = $ref([])
let result = $ref(0)
function categorizeByTaskId(data: TaskData[]): Record<string, TaskData[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.taskId]) {
      acc[item.taskId] = [];
    }
    acc[item.taskId].push(item);
    return acc;
  }, {} as Record<string, TaskData[]>);
}
onMounted( async () => {
  bounties = await getAllBounty()
  let cori = []
  let dori = []
  console.log('bounties = ' + bounties)
  for(let i = 0; i < bounties.length; ++i){
    const tt = bounties[i]
    if(address === tt.send){
      cori.push(tt)
    }
    if(address === tt.receive){
      dori.push(tt)
    }
  }
  // 根据任务分类好的，将含有两种bounty的加和在一起
  const categorizedC = categorizeByTaskId(cori)
  const categorizedD = categorizeByTaskId(dori)
  for (const taskId in categorizedC) {
    if (categorizedC.hasOwnProperty(taskId)) {
      const taskArray = categorizedC[taskId]
      if(taskArray.length > 1){
        const b = (taskArray[0].tokenNumber / denomination[taskArray[0].tokenType]) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / denomination[taskArray[1].tokenType]) + ' ' + taskArray[1].tokenType

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
        const b = (taskArray[0].tokenNumber / denomination[taskArray[0].tokenType]) + ' ' + taskArray[0].tokenType
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
        const b = (taskArray[0].tokenNumber / denomination[taskArray[0].tokenType]) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / denomination[taskArray[1].tokenType]) + ' ' + taskArray[1].tokenType
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
        const b = (taskArray[0].tokenNumber / denomination[taskArray[0].tokenType]) + ' ' + taskArray[0].tokenType
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
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard class="pl-10 pt-10 text-xl" @submit.prevent="onSubmitTask">
      <div class="flex items-center">
        {{ $t('setting.task.completed')}}： {{result}}
        <UToggle v-model="taskForm.showTasknum" class="ml-10 mr-3" size="xl" />{{ $t('show')}}
      </div>
    </UCard>
  </udashboardpanelcontent>
</template>
