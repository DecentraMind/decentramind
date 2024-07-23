<script setup lang="ts">

const {t} = useI18n()
let did = $ref([])
let created = $ref([])
let cLength = $ref(0)
let dLength = $ref(0)
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
const rewardcolumns2 = [
  { label: 'Bounty Type', key: 'bountyType' },
  { label: 'Amount', key: 'bounty' }
]


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

const sort = $ref({ column: 'id', direction: 'asc' as const })

const cols = [
  {
    key: 'taskName',
    label: 'Name',
  },
  {
    key: 'show',
    label: 'Amount',
  },
  {
    key: 'communityName',
    label: 'From Community',
  }
]
const { getAllBounty} = $(taskStore())
const { address } = $(aoStore())
let bounties = $ref([])



const page = ref(1)
const pageC = ref(1)
const pageCount = 5
const didRows = computed(() => {
  return did.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})
const cRows = computed(() => {
  return created.slice((pageC.value - 1) * pageCount, (pageC.value) * pageCount)
})

// TODO add categorizeByCommunityID
// TODO move to utils
function categorizeByTaskId(data: TaskData[]): Record<string, TaskData[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.taskId]) {
      acc[item.taskId] = []
    }
    acc[item.taskId].push(item)
    return acc
  }, {} as Record<string, TaskData[]>)
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
  publishedBounty = cori
  didBounty = dori
  // 根据任务分类好的，将含有两种bounty的加和在一起
  const categorizedC = categorizeByTaskId(cori)
  const categorizedD = categorizeByTaskId(dori)
  for (const taskId in categorizedC) {
    if (categorizedC.hasOwnProperty(taskId)) {
      const taskArray = categorizedC[taskId]
      if(taskArray.length > 1){
        // TODO use token.denotation
        const b = (taskArray[0].tokenNumber / 1e12) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / 1e12) + ' ' + taskArray[1].tokenType

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
        const b = (taskArray[0].tokenNumber / 1e12) + ' ' + taskArray[0].tokenType
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
        const b = (taskArray[0].tokenNumber / 1e12) + ' ' + taskArray[0].tokenType + ' + ' + (taskArray[1].tokenNumber / 1e12) + ' ' + taskArray[1].tokenType
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
        const b = (taskArray[0].tokenNumber / 1e12) + ' ' + taskArray[0].tokenType
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
  cLength = created.length
  dLength = did.length
  console.log(JSON.stringify(did))
})

let publishedQuest = $ref(false)
let publishedBounty = $ref([])
let didQuest = $ref(false)
let didBounty = $ref([])

const mergeBounties = (bounties) => {
  const bountyMap = {}

  bounties.forEach(item => {
    const { tokenNumber, tokenType } = item
    const bountyValue = parseFloat(tokenNumber / 1e12)

    if (bountyMap[tokenType]) {
      bountyMap[tokenType] += bountyValue
    } else {
      bountyMap[tokenType] = bountyValue
    }
  })

  const mergedBounties = Object.keys(bountyMap).map(tokenType => ({
    bounty: bountyMap[tokenType].toFixed(4),
    bountyType: tokenType
  }))

  return mergedBounties
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
            :columns="cols"
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
            :columns="cols"
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
            :rows="mergeBounties(publishedBounty)"
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
            :rows="mergeBounties(didBounty)"
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
