<script setup lang="ts">

const {t} = useI18n()

const items1 = [
  {
    slot: 'Published',
    label: 'Published 3'
  }
]

const items = [
//   {
//   slot: 'join',
//   label: `${t('task.isjoin')} 3`
// },
  {
  slot: 'reward',
  label: t('task.reward')
}]

const communityForm = $ref({ name: 'Benjamin', username: 'benjamincanac' })

function onSubmitAccount () {
  console.log('Submitted form:', communityForm)
}


const defaultColumns = [{
  key: 'id',
  label: '',
}, {
  key: 'name',
  label: t('task.name')
}, {
  key: 'from',
  label: t('task.from')
}]

const rewardColumns = [{
  key: 'id',
  label: '',
}, {
  key: 'name',
  label: t('task.name')
}, {
  key: 'balance',
  label: t('task.sum'),
}, {
  key: 'from',
  label: t('task.from')
}]

const q = $ref('')
const selectedColumns = $ref(defaultColumns)
const selectedStatuses = $ref([])
const selectedLocations = $ref([])
const sort = $ref({ column: 'id', direction: 'asc' as const })


const columns = computed(() => defaultColumns.filter((column) => selectedColumns.includes(column)))

const query = computed(() => ({ q: q, statuses: selectedStatuses, locations: selectedLocations, sort: sort.column, order: sort.direction }))

const { data: Wallettoken, pending } = await useFetch<Tasks[]>('/api/task', { query, default: () => [] })




const selectedrewardColumns = ref(rewardColumns)
const rewardcolumns = computed(() => rewardColumns.filter((column) => selectedrewardColumns.value.includes(column)))

const { communityList } = $(aocommunityStore())
const { allTasks, getAllTasksNoCommunity, submitInfo, getAllTaskSubmitInfo, getTaskById } = $(taskStore())
const { address } = $(aoStore())

let CommunityCreater = $ref(false)
const checkCreater = async () => {
  const isCreatorPresent = communityList.some(item => item.creater === address);
  if (isCreatorPresent) {
    CommunityCreater = true
    // 这里替换成你要执行的函数
    // executeYourFunction();
  } else {
    console.log("Creator not found!");
  }
}

let did = $ref([])
// let totalAmount = $ref(0)
onMounted( async () => {
  await getAllTaskSubmitInfo()
  await getAllTasksNoCommunity()
  await checkCreater()
  // console.log(JSON.stringify(submitInfo))
  for(let i = 0; i < submitInfo.length; ++i){
    const ele = submitInfo[i]
    if(ele.address === address){
      let taskName = ''
      let coummunityId = ''
      let coummunityName = ''
      for(let j = 0; j < allTasks.length; ++j){
        let taskEle = allTasks[j]
        if(taskEle.id === ele.taskId){
          taskName = taskEle.name
          coummunityId = taskEle.communityId
          break
        }
      }
      for(let k = 0; k < communityList.length; ++k){
        let community = communityList[k]
        // console.log('community.id = ' + community.uuid)
        if(community.uuid === coummunityId){
          coummunityName = community.name
          break
        }
      }
      // console.log('taskName = ' + taskName)
      const didRow = {
        name: taskName,
        balance: ele.bounty,
        from: coummunityName
      }
      // console.log('didRow = ' + JSON.stringify(didRow))
      did.push(didRow)
    }
  }
  console.log(JSON.stringify(did))
})
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard>
      <template #header>
        <UBadge color="white">
          Public Quests
        </UBadge>
      </template>
      <UTabs v-if="CommunityCreater" :items="items1" class="w-1/2 mt-10">
        <template #Published>
          <UCard>
            <UTable
              v-model:sort="sort"
              :rows="did"
              :columns="rewardcolumns"
              :loading="pending"
              sort-mode="manual"
              class="pl-10"
              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
            />
          </UCard>
        </template>
      </UTabs>
      <div class="flex pl-10 mt-6">
        {{ $t('task.allsum')}}：111U
      </div>
      <UTabs :items="items" class="w-1/2 mt-16">
<!--        <template #join>-->
<!--          <UCard>-->
<!--            <UTable-->
<!--              v-model:sort="sort"-->
<!--              :rows="Wallettoken"-->
<!--              :columns="columns"-->
<!--              :loading="pending"-->
<!--              sort-mode="manual"-->
<!--              class="pl-10"-->
<!--              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"-->
<!--            />-->
<!--          </UCard>-->
<!--        </template>-->

        <template #reward>
          <UCard>
            <UTable
              v-model:sort="sort"
              :rows="did"
              :columns="rewardcolumns"
              :loading="pending"
              sort-mode="manual"
              class="pl-10"
              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
            />
          </UCard>
        </template>
      </UTabs>

      <template #footer>
        <div class="flex pl-10">
          {{ $t('task.allsum')}}：111U
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
