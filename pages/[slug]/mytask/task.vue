<script setup lang="ts">

const {t} = useI18n()
let did = $ref([])
let created = $ref([])
let cLength = $ref(0)
let dLength = $ref(0)
console.log('cLength = ' + cLength)
console.log('dLength = ' + dLength)
const items1 = [
  {
    slot: 'Published',
    label: 'Published ' + cLength
  }
]

const items = [
//   {
//   slot: 'join',
//   label: `${t('task.isjoin')} 3`
// },
  {
  slot: 'reward',
  label: t('task.reward') + ' ' + dLength
}]

const communityForm = $ref({ name: 'Benjamin', username: 'benjamincanac' })

function onSubmitAccount () {
  console.log('Submitted form:', communityForm)
}

const rewardcolumns2 = [
  { label: 'Bounty Type', key: 'bountyType' },
  { label: 'Amount', key: 'bounty' }
]

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


const page = ref(1)
const pageC = ref(1)
const pageCount = 5
const didRows = computed(() => {
  return did.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})
const cRows = computed(() => {
  return created.slice((pageC.value - 1) * pageCount, (pageC.value) * pageCount)
})
// let totalAmount = $ref(0)
onMounted( async () => {
  await getAllTaskSubmitInfo()
  await getAllTasksNoCommunity()
  await checkCreater()
  // console.log(JSON.stringify(allTasks))
  for(let i = 0; i < submitInfo.length; ++i){
    const ele = submitInfo[i]
    // console.log(JSON.stringify(ele))
    if(ele.address === address){
      let taskName = ''
      let coummunityId = ''
      let coummunityName = ''
      let ownerId = ''
      for(let j = 0; j < allTasks.length; ++j){
        let taskEle = allTasks[j]
        if(taskEle.id === ele.taskId){
          taskName = taskEle.name
          coummunityId = taskEle.communityId
          ownerId = taskEle.ownerId
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
      // console.log(ele.bounty)
      // console.log(ele.bounty1)
      // console.log(ele.bounty2)
      if(ele.bounty === 0){
        const didRow = {
          name: taskName,
          balance: 0,
          from: coummunityName
        }
        // console.log('didRow = ' + JSON.stringify(didRow))
        if(ownerId === address){
          created.push(didRow)
        }else{
          did.push(didRow)
        }
      }else{
        if(ele.bounty1){
          const didRow = {
            name: taskName,
            balance: ele.bounty1 + ' ' + ele.bountyType1,
            from: coummunityName
          }
          // console.log('didRow = ' + JSON.stringify(didRow))
          if(ownerId === address){
            created.push(didRow)
          }else{
            did.push(didRow)
          }
        }
        if(ele.bounty2){
          const didRow = {
            name: taskName,
            balance: ele.bounty2 + ' ' + ele.bountyType2,
            from: coummunityName
          }
          // console.log('didRow = ' + JSON.stringify(didRow))
          if(ownerId === address){
            created.push(didRow)
          }else{
            did.push(didRow)
          }
        }
      }
      cLength = created.length
      dLength = did.length
      // console.log('cLength = ' + cLength)
      // console.log('dLength = ' + dLength)

    }
    publishedBounty = extractBounties(submitInfo, address);
    didBounty = extractBounties(did, address)
  }
  console.log(JSON.stringify(did))
})

let publishedQuest = $ref(false)
let publishedBounty = $ref()
let didQuest = $ref(false)
let didBounty = $ref()
const test = async() => {
  console.log("---------")
  const allbounty = extractBounties(submitInfo, address);
  console.log(allbounty)
}

const extractBounties = (data, address) => {
  const allbounty = [];

  data.forEach(item => {
    if (item.address === address) {
      if (item.bounty1) {
        allbounty.push({ bounty: item.bounty1, bountyType: item.bountyType1 });
      }
      if (item.bounty2) {
        allbounty.push({ bounty: item.bounty2, bountyType: item.bountyType2 });
      }
    }
  });
  const result = mergeBounties(allbounty)
  return result;
};

const mergeBounties = (bounties) => {
  const bountyMap = {};

  bounties.forEach(item => {
    const { bounty, bountyType } = item;
    const bountyValue = parseFloat(bounty);

    if (bountyMap[bountyType]) {
      bountyMap[bountyType] += bountyValue;
    } else {
      bountyMap[bountyType] = bountyValue;
    }
  });

  const mergedBounties = Object.keys(bountyMap).map(bountyType => ({
    bounty: bountyMap[bountyType].toFixed(4),
    bountyType: bountyType
  }));

  return mergedBounties;
};

</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard>
      <template #header>
        <UBadge color="white">
          Public Quests
        </UBadge>
      </template>
      <div class="w-1/2">
        <div class="flex justify-center  border-2 mb-1">Published  {{ cLength }}</div>

        <UCard>
          <UTable
            v-model:sort="sort"
            :rows="cRows"
            :columns="rewardcolumns"
            :loading="pending"
            sort-mode="manual"
            class="pl-10"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
          <div class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <UButton color="white" @click="publishedQuest=true">Bounty</UButton>
            <UPagination v-model="pageC" :page-count="pageCount" :total="created.length" />
          </div>
        </UCard>
      </div>
<!--      <UTabs v-if="CommunityCreater" :items="items1" class="w-1/2 mt-10">-->
<!--        <template #Published>-->
<!--          <UCard>-->
<!--            <UTable-->
<!--              v-model:sort="sort"-->
<!--              :rows="created"-->
<!--              :columns="rewardcolumns"-->
<!--              :loading="pending"-->
<!--              sort-mode="manual"-->
<!--              class="pl-10"-->
<!--              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"-->
<!--            />-->
<!--            <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">-->
<!--              <UPagination v-model="pageC" :page-count="pageCount" :total="created.length" />-->
<!--            </div>-->
<!--          </UCard>-->
<!--        </template>-->
<!--      </UTabs>-->
<!--      <div class="flex pl-10 mt-6">-->
<!--        {{ $t('task.allsum')}}：111U-->
<!--      </div>-->
      <div class="my-10"/>
      <div class="w-1/2">
        <div class="flex justify-center  border-2 mb-1">Awarded  {{dLength}}</div>
        <UCard>
          <UTable
            v-model:sort="sort"
            :rows="didRows"
            :columns="rewardcolumns"
            :loading="pending"
            sort-mode="manual"
            class="pl-10"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
          <div class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <UButton color="white" @click="didQuest=true">Bounty</UButton>
            <UPagination v-model="page" :page-count="pageCount" :total="did.length" />
          </div>
        </UCard>
      </div>

      <UModal v-model="publishedQuest">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="publishedBounty"
            :columns="rewardcolumns2"
            :loading="pending"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
        </div>
      </UModal>
      <UModal v-model="didQuest">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="didBounty"
            :columns="rewardcolumns2"
            :loading="pending"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
        </div>
      </UModal>
<!--      <template #footer>-->
<!--        <div class="flex pl-10">-->
<!--          {{ $t('task.allsum')}}：111U-->
<!--        </div>-->
<!--      </template>-->
    </UCard>
  </UDashboardPanelContent>
</template>
