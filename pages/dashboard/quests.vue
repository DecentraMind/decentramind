<script setup lang="ts">
import type { BountySendHistory, Task } from '~/types'
import { tokensByProcessID } from '~/utils'
import Bounties from '~/components/task/Bounties.vue'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { notificationStore } from '~/stores/notificationStore'
import { breadcrumbStore } from '~/stores/breadcrumbStore'
import PrivateQuests from '~/components/dashboard/PrivateQuests.vue'
import { useGetBountiesByAddressQuery, useGetTasksByOwnerQuery } from '~/composables/tasks/taskQuery'

const questColumns = [
  {
    key: 'name',
    label: 'Quest Name',
    class: 'w-60',
  },
  {
    key: 'bounties',
    label: 'Amount',
    class: 'w-20',
  },
  {
    key: 'communityName',
    label: 'From Community',
    class: 'w-16',
  },
]

const bountyColumns = [
  { label: 'Bounty Type', key: 'label' },
  { label: 'Amount', key: 'sum' },
]

const sort = $ref({ column: 'id', direction: 'asc' as const })

const { address } = $(aoStore())
const { showError } = $(notificationStore())
const { joinedCommunities, setCurrentCommunityUuid } = $(communityStore())
const { setBreadcrumbs } = $(breadcrumbStore())

setBreadcrumbs([
  { label: 'Home', to: '/discovery' },
  { label: 'Dashboard' },
])

const page = $ref(1)
const pageC = $ref(1)
const pageCount = 5

type sumRow = {
  label: string
  tokenProcessID: string
  sum: number
}
type Categorized = {
  taskId2BountiesMap: {
    [taskPid: string]: (BountySendHistory & { tokenName: string })[]
  }
  sum: { [tokenProcessID: string]: sumRow }
}

const { data: bountiesByAddress, isLoading: bountiesByAddressIsLoading } = useGetBountiesByAddressQuery(address)
const { data: tasksByOwner, isLoading: tasksByOwnerIsLoading } = useGetTasksByOwnerQuery(address)

const publishedTasks = $computed<Array<Task>>(() => {
  return tasksByOwner.value || []
})

const awarded = $computed<Categorized>(() => {
  if (!bountiesByAddress.value) return { taskId2BountiesMap: {}, sum: {} }
  return categorize(bountiesByAddress.value.awarded)
})

type questRow = {
  name: string // quest name
  bounties: Task['bounties']
  communityName: string
}
const awardedBounties = $computed<questRow[]>(() => {
  const results = [] as questRow[]
  // eslint-disable-next-line no-unused-vars
  for (const [_, bounties] of Object.entries(awarded.taskId2BountiesMap)) {
    
    const result = {
      name: bounties[0].taskName,
      bounties: bounties as unknown as Task['bounties'],
      communityName: joinedCommunities.find(community => community.uuid == bounties[0].communityUuid)?.name || '',
    }
    results.push(result)
  }
  return results
})

const publishedTasksRows = $computed(() => {
  console.log('published rows', publishedTasks, pageC, pageCount)
  return publishedTasks.slice((pageC - 1) * pageCount, pageC * pageCount).map(task => {
    const res = {...task} as Task & { communityName: string }
    res.communityName = joinedCommunities.find(community => community.uuid == task.communityUuid)?.name || ''
    return res
  })
})

const publishedSums = $computed<sumRow[]>(() => {
  return publishedTasks.reduce((acc, task) => {
    for (const bounty of task.bounties) {
      if (!bounty.tokenProcessID) continue
      const index = acc.findIndex(
        sum => sum.tokenProcessID === bounty.tokenProcessID,
      )
    
      if (index === -1) {
        acc.push({
          label: bounty.tokenName || tokensByProcessID[bounty.tokenProcessID].label,
          tokenProcessID: bounty.tokenProcessID,
          sum: bounty.amount,
        })
      } else {
        acc[index].sum += bounty.amount
      }
    }
    console.log('published sums', acc)

    return acc
  }, [] as sumRow[])
})

const awardedBountyRows = $computed(() => {
  console.log('awarded rows', awardedBounties, page, pageCount)
  return awardedBounties.slice((page - 1) * pageCount, page * pageCount)
})

const awardedSums = $computed<sumRow[]>(() => {
  if (!bountiesByAddress.value) return []
  return bountiesByAddress.value.awarded.reduce((acc, bounty) => {
      const index = acc.findIndex(
        sum => sum.tokenProcessID === bounty.tokenProcessID,
      )
    
      if (index === -1) {
        acc.push({
          label: tokensByProcessID[bounty.tokenProcessID].label,
          tokenProcessID: bounty.tokenProcessID,
          sum: bounty.amount,
        })
      } else {
        acc[index].sum += bounty.amount
      }
      return acc
    }, [] as sumRow[])
})

const loadingBounties = $computed(() => {
  return tasksByOwnerIsLoading.value || bountiesByAddressIsLoading.value
})
onMounted(async () => {
  setCurrentCommunityUuid(null)
})

// eslint-disable-next-line prefer-const
let isPublishedBountyModalOpen = $ref(false)
// eslint-disable-next-line prefer-const
let isAwardedBountyModalOpen = $ref(false)

function categorize(bounties: BountySendHistory[]) {
  const categorized = {
    taskId2BountiesMap: {},
    sum: {},
  } as Categorized

  for (const bounty of bounties) {
    const { tokenProcessID, amount } = bounty
    const tokenName = tokensByProcessID[tokenProcessID].label
    const taskId2BountiesMap = categorized.taskId2BountiesMap
    if (!taskId2BountiesMap[bounty.taskPid]) {
      taskId2BountiesMap[bounty.taskPid] = []
    }
    taskId2BountiesMap[bounty.taskPid].push({...bounty, tokenName})

    if (!categorized.sum[tokenProcessID]) {
      categorized.sum[tokenProcessID] = {
        tokenProcessID,
        label: tokenName,
        sum: amount,
      }
    }
    categorized.sum[tokenProcessID].sum += amount
  }

  return categorized
}

const selectedTaskVisibleType = $ref(0)
const taskVisibleTabs = $ref([
  { label: 'Public Quests', value: 0 },
  { label: 'Private Quests', value: 1 },
])

</script>

<template>
  <UDashboardPanelContent class="pb-10">
    <UCard class="w-fit">
      <template #header>
        <UTabs
          v-model="selectedTaskVisibleType"
          :items="taskVisibleTabs"
          :ui="{ wrapper: 'space-y-0 w-80' }"
        />
      </template>

      <PrivateQuests v-if="selectedTaskVisibleType === 1" class="mb-10" />
      <div v-else>
        <div class="w-full lg:w-[800px]">
          <UCard
            :ui="{
              header: {
                padding: 'px-4 py-2 sm:px-6',
              },
            }"
          >
            <template #header>
              <div class="text-center font-semibold">
                Published&emsp;<UBadge variant="soft" size="lg">
                  {{ publishedTasks.length }}
                </UBadge>
              </div>
            </template>
            <UTable
              v-model:sort="sort"
              :rows="publishedTasksRows"
              :columns="questColumns"
              :loading="loadingBounties"
              sort-mode="manual"
              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
            >
              <template #bounties-data="{ row }">
                <Bounties :bounties="row.bounties" :show-plus="false" wrapper-class="flex flex-col gap-y-1" />
              </template>
            </UTable>
            <div class="flex justify-between mt-2 pt-3.5">
              <UButton
                color="white"
                @click="isPublishedBountyModalOpen = true"
              >
                Total Bounty
              </UButton>
              <UPagination
                v-model="pageC"
                :page-count="pageCount"
                :total="publishedTasks.length"
              />
            </div>
          </UCard>
        </div>

        <div class="my-10" />

        <div class="w-full lg:w-[800px]">
          <UCard
            :ui="{
              header: {
                padding: 'px-4 py-2 sm:px-6',
              },
            }"
          >
            <template #header>
              <div class="text-center font-semibold">
                Awarded&emsp;<UBadge variant="soft" size="lg">
                  {{ awardedBounties.length }}
                </UBadge>
              </div>
            </template>
            <UTable
              v-model:sort="sort"
              :rows="awardedBountyRows"
              :columns="questColumns"
              :loading="loadingBounties"
              sort-mode="manual"
              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
            >
              <template #bounties-data="{ row }">
                <Bounties :bounties="row.bounties" :show-plus="false" wrapper-class="flex flex-col gap-y-2" />
              </template>
            </UTable>
            <div class="flex justify-between mt-2 pt-3.5">
              <UButton color="white" @click="isAwardedBountyModalOpen = true">Total Bounty</UButton>
              <UPagination
                v-model="page"
                :page-count="pageCount"
                :total="awardedBounties.length"
              />
            </div>
          </UCard>
        </div>
      </div>

      <UModal v-model="isPublishedBountyModalOpen" :ui="{base: '!w-fit'}">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="publishedSums"
            :columns="bountyColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          >
            <template #caption>
              <caption class="font-semibold text-lg px-4 py-2 min-w-60">Published Bounties</caption>
            </template>
            <template #sum-data="{ row }">
              <div class="text-center">
                {{ row.sum.toFixed(2) }}
              </div>
            </template>
          </UTable>
        </div>
      </UModal>

      <UModal v-model="isAwardedBountyModalOpen" :ui="{base: '!w-fit'}">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="awardedSums"
            :columns="bountyColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          >
            <template #caption>
              <caption class="font-semibold text-lg px-4 py-2 min-w-60">Awarded Bounties</caption>
            </template>
            <template #sum-data="{ row }">
              <div class="text-center">
                {{ row.sum.toFixed(2) }}
              </div>
            </template>
          </UTable>
        </div>
      </UModal>
    </UCard>
  </UDashboardPanelContent>
</template>
