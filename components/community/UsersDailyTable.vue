<script setup lang="ts">
import { getAllUsers, getCommunityUser } from '~/utils/community/community'
import { useQueuedQuery } from '~/composables/useQueuedQuery'

interface GrowthStats {
  period: string
  totalUsers: number
  invitedUsers: number
  organicUsers: number
}

const props = withDefaults(
  defineProps<{
    communityId?: string
  }>(),
  {
    communityId: undefined,
  },
)

const { data: communityMembers, isLoading } = useQueuedQuery(
  ['community', 'communityUser', props.communityId],
  async () => {
    if (props.communityId) {
      const userMap = await getCommunityUser(props.communityId)
      return Object.values(userMap)
    } else {
      const allUsers = await getAllUsers()
      return Object.values(allUsers).map(user => ({
        ...user,
        joinTime: user.createdAt || 1730476100000,
        inviterAddress: ''
      }))
    }
  }
)

const periodType = ref<'daily' | 'monthly'>('daily')

// Process user data into growth statistics
const growthStats = computed<GrowthStats[]>(() => {
  const stats = new Map<string, GrowthStats>()

  communityMembers.value?.forEach(member => {
    const date = new Date(member.joinTime)
    // Format date string based on period type
    const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      ...(periodType.value === 'daily' ? { day: '2-digit' } : {}),
    })
    const period = dateFormatter.format(date)

    if (!stats.has(period)) {
      stats.set(period, {
        period,
        totalUsers: 0,
        invitedUsers: 0,
        organicUsers: 0,
      })
    }

    const periodStats = stats.get(period)!
    periodStats.totalUsers++

    if (member.inviterAddress) {
      periodStats.invitedUsers++
    } else {
      periodStats.organicUsers++
    }
  })

  // Convert to array and sort by period
  return Array.from(stats.values()).sort(
    (a, b) => new Date(b.period).getTime() - new Date(a.period).getTime(),
  )
})

const columns = [
  {
    key: 'period',
    label: 'Time Period',
    sortable: true,
  },
  {
    key: 'totalUsers',
    label: 'Total New Users',
    sortable: true,
  },

  // TODO add invitedUsers and organicUsers when we have the data
  // , {
  //   key: 'invitedUsers',
  //   label: 'Invited Users',
  //   sortable: true
  // }, {
  //   key: 'organicUsers',
  //   label: 'Organic Users',
  //   sortable: true
  // }
]

const tableTitle = computed(() =>
  props.communityId
    ? 'Community Growth Statistics'
    : 'Global User Growth Statistics',
)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold">{{ tableTitle }}</h3>
      <USelect
        v-model="periodType"
        :options="[
          { label: 'Daily', value: 'daily' },
          { label: 'Monthly', value: 'monthly' },
        ]"
        size="sm"
      />
    </div>

    <UTable
      :columns="columns"
      :rows="growthStats"
      :loading="isLoading"
      :sort="{ column: 'period', direction: 'desc' }"
      :ui="{
        wrapper: 'mt-4 px-1 overflow-y-auto relative',
        thead: 'sticky top-0 bg-white dark:bg-gray-900',
        th: { padding: 'px-1' },
        td: { padding: 'px-1' },
      }"
    >
      <template #period-data="{ row }">
        {{ row.period }}
      </template>

      <template #totalUsers-data="{ row }">
        {{ row.totalUsers }}
      </template>

      <template #invitedUsers-data="{ row }">
        {{ row.invitedUsers }}
      </template>

      <template #organicUsers-data="{ row }">
        {{ row.organicUsers }}
      </template>
    </UTable>

    <div class="flex justify-between items-center mt-2">
      <b class="font-medium pl-2">Total Users: {{ communityMembers?.length || 0 }}</b>
    </div>
  </div>
</template>
