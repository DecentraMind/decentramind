<script setup lang="ts">
import type { Bounty } from '~/types'
import { tokens, tokensByProcessID, type TokenName } from '~/utils/constants'

const questColumns = [{
  key: 'taskName',
  label: 'Name',
}, {
  key: 'amount',
  label: 'Amount',
}, {
  key: 'communityName',
  label: 'From Community',
}]

const bountyColumns = [
  { label: 'Bounty Type', key: 'label' },
  { label: 'Amount', key: 'sum' }
]

const sort = $ref({ column: 'id', direction: 'asc' as const })

const { getAllBounty} = $(taskStore())
const { address } = $(aoStore())

const page = $ref(1)
const pageC = $ref(1)
const pageCount = 5


type Categorized = {
  bounties: Record<string, Bounty & {amount: string}>,
  sum: Record<string, {label: string; sum: number}> // bounty sum of each token
}

const published = reactive<Categorized>({
  bounties: {},
  sum: {}
})

const awarded = reactive<Categorized>({
  bounties: {},
  sum: {}
})

const publishedBounties = $computed(() => Object.values(published.bounties))
const awardedBounties = $computed(() => Object.values(awarded.bounties))

const publishedBountyRows = $computed(() => {
  return publishedBounties.slice((pageC - 1) * pageCount, (pageC) * pageCount)
})
const awardedBountyRows = $computed(() => {
  return awardedBounties.slice((page - 1) * pageCount, (page) * pageCount)
})

const publishedSums = $computed(() => Object.values(published.sum))
const awardedSums = $computed(() => Object.values(awarded.sum))

/**
 * TODO 清理 bounty.tokenType 和 bounty.tokenType1 为 tokenName 的旧数据后，
 * 此处不需要考虑输入参数为 tokenName 的情况
 **/
function getToken(processID: string | TokenName) {
  console.log({tokenType: processID})
  const token = tokensByProcessID[processID] || tokens[processID]

  console.log({foundToken: token})
  return {
    label: token ? token.label : processID,
    denomination: token ? Math.pow(10, token.denomination) : 1e12,
    processID: token.processID
  }
}

let loadingBounties = $ref(true)
onMounted(async () => {
  const allBounties = (await getAllBounty()).reverse()

  function categorize(bounty: Bounty, categorized: Categorized) {
    const token = getToken(bounty.tokenType)

    const bounties = categorized.bounties
    if (!bounties[bounty.taskId]) {
      bounties[bounty.taskId] = {...bounty, amount: ''}
    }
    bounties[bounty.taskId].amount +=
      (bounties[bounty.taskId].amount === '' ? '' : ' + ')
      + (bounty.tokenNumber / token.denomination) + ' ' + token.label

    if (!categorized.sum[token.processID]) {
      categorized.sum[token.processID] = {
        label: token.label,
        sum: bounty.tokenNumber / token.denomination
      }
    }
    categorized.sum[token.processID].sum += bounty.tokenNumber / token.denomination

    return categorized
  }

  for (const bounty of allBounties){
    if (bounty.send === address) {
      categorize(bounty, published)
    }
    if (bounty.receive === address) {
      categorize(bounty, awarded)
    }
  }
  console.log({published, awarded})

  loadingBounties = false
})

// eslint-disable-next-line prefer-const
let isPublishedBountyModalOpen = $ref(false)
// eslint-disable-next-line prefer-const
let isAwardedBountyModalOpen = $ref(false)

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
        <div class="flex justify-center  border-2 mb-1">Published  {{ publishedBounties.length }}</div>

        <UCard>
          <UTable
            v-model:sort="sort"
            :rows="publishedBountyRows"
            :columns="questColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="pl-10"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
          <div class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <UButton color="white" @click="isPublishedBountyModalOpen=true">Bounty</UButton>
            <UPagination v-model="pageC" :page-count="pageCount" :total="publishedBounties.length" />
          </div>
        </UCard>
      </div>

      <div class="my-10" />

      <div class="w-1/2">
        <div class="flex justify-center  border-2 mb-1">Awarded  {{ awardedBounties.length }}</div>
        <UCard>
          <UTable
            v-model:sort="sort"
            :rows="awardedBountyRows"
            :columns="questColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="pl-10"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
          <div class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <UButton color="white" @click="isAwardedBountyModalOpen=true">Bounty</UButton>
            <UPagination v-model="page" :page-count="pageCount" :total="awardedBounties.length" />
          </div>
        </UCard>
      </div>

      <UModal v-model="isPublishedBountyModalOpen">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="publishedSums"
            :columns="bountyColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
        </div>
      </UModal>

      <UModal v-model="isAwardedBountyModalOpen">
        <div class="p-4 flex justify-center items-center">
          <UTable
            v-model:sort="sort"
            :rows="awardedSums"
            :columns="bountyColumns"
            :loading="loadingBounties"
            sort-mode="manual"
            class="border"
            :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
          />
        </div>
      </UModal>
    </UCard>
  </UDashboardPanelContent>
</template>
