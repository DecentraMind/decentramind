<script setup lang="ts">
import type { BountySendHistory, Task } from '~/types'
import { tokensByProcessID, calcRewardHtml } from '~/utils'
import { useTaskStore } from '~/stores/taskStore'

const questColumns = [
  {
    key: 'name',
    label: 'Quest Name',
    class: 'w-60',
  },
  {
    key: 'rewardHtml',
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

const { getBountiesByAddress, getTasksByOwner } = useTaskStore()
const { address } = $(aoStore())
const { showError } = $(notificationStore())
const { joinedCommunities } = $(communityStore())

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
    [taskPid: string]:  BountySendHistory[]
  }
  sum: { [tokenProcessID: string]: sumRow }
}

let publishedTasks = $ref<Array<Task & { rewardHtml: string }>>([])

let awarded = $ref<Categorized>({
  taskId2BountiesMap: {},
  sum: {},
})

type questRow = {
  name: string // quest name
  rewardHtml: string // reward html
  communityName: string
}
const awardedBounties = $computed<questRow[]>(() => {
  const results = [] as questRow[]
  for (const [_, bounties] of Object.entries(awarded.taskId2BountiesMap)) {
    
    const result = {
      name: bounties[0].taskName,
      rewardHtml: calcRewardHtml(bounties as unknown as Task['bounties'], true).join('&nbsp;+&nbsp;'),
      communityName: joinedCommunities.find(community => community.uuid == bounties[0].communityUuid)?.name || '',
    }
    results.push(result)
  }
  return results
})

const publishedTasksRows = $computed(() => {
  console.log('published rows', publishedTasks, pageC, pageCount)
  return publishedTasks.slice((pageC - 1) * pageCount, pageC * pageCount).map(task => {
    const res = {...task} as Task & { rewardHtml: string, communityName: string }
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

let awardedSums = $ref<sumRow[]>([])

let loadingBounties = $ref(true)
onMounted(async () => {
  try {
    const { awarded: awardedBounties } = await getBountiesByAddress(address)
    publishedTasks = (await getTasksByOwner(address) as unknown as Array<Task & { rewardHtml: string }>).map(task => {
      task.rewardHtml =
        calcRewardHtml(task.bounties, true).join('&nbsp;+&nbsp;')
      return task
    })
    // console.log({ publishedTasks, awardedBounties })

    awarded = categorize(awardedBounties)
    awardedSums = awardedBounties.reduce((acc, bounty) => {
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
      return acc
    }, [] as sumRow[])
    // console.log('categorized awarded sums', awardedSums)
  } catch (e) {
    showError('Failed to load data.', e as Error)
  } finally {
    loadingBounties = false
  }
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
    const tokenName =
      bounty.tokenName || tokensByProcessID[tokenProcessID].label
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
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard>
      <template #header>
        <UBadge variant="soft" size="lg"> Public Quests </UBadge>
      </template>
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
            <template #rewardHtml-data="{ row }">
              <p class="flex justify-start items-center" v-html="row.rewardHtml" />
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
            <template #rewardHtml-data="{ row }">
              <p class="flex justify-start items-center" v-html="row.rewardHtml" />
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
