<script setup lang="ts">
import { shortString } from '~/utils'
import type { CommunityMembers } from '~/types'

const props = defineProps<{
  communityId: string
}>()

const { getCommunityUser } = $(communityStore())
const loading = ref(true)
let communityMembers = $ref<CommunityMembers>([])
const search = ref('')

// Debounced search term
const debouncedSearch = refDebounced(search, 300)

// Filtered members based on search
const filteredMembers = computed(() => {
  if (!debouncedSearch.value) return communityMembers
  
  const searchTerm = debouncedSearch.value.toLowerCase()
  return communityMembers.filter(member => {
    const memberMatch = (member.name || member.address).toLowerCase().includes(searchTerm)
    const inviterMatch = (member.inviterName || member.inviterAddress || '').toLowerCase().includes(searchTerm)
    return memberMatch || inviterMatch
  })
})

onMounted(async () => {
  try {
    const userMap = await getCommunityUser(props.communityId)
    communityMembers = Object.entries(userMap).map(([key, user]) => {
      return {
        address: key,
        ...user
      }
    })
  } finally {
    loading.value = false
  }
})

const columns = [{
  key: 'name',
  label: 'Member Name',
  sortable: true,
  search: true
}, {
  key: 'address',
  label: 'Address',
  sortable: true,
  search: true
}, {
  key: 'joinTime',
  label: 'Joined',
  sortable: true,
  sort: (a: number, b: number) => b - a // Default sort newest first
}, {
  key: 'inviter',
  label: 'Invited By',
  sortable: true,
  search: true
}]
</script>

<template>
  <div>
    <UInput
      v-model="search"
      icon="i-heroicons-magnifying-glass-20-solid"
      placeholder="Search members or inviters..."
      size="sm"
      class="mb-4"
    />
    <UTable
      :columns="columns"
      :rows="filteredMembers"
      :loading="loading"
      :sort="{ column: 'joinTime', direction: 'desc' }"
      :ui="{
        wrapper: 'mt-4 px-1 max-h-[676px] overflow-y-auto relative',
        thead: 'sticky top-0 bg-white dark:bg-gray-900',
        th: {
          padding: 'px-1',
        },
        td: {
          padding: 'px-1',
        }
      }"
    >
      <template #name-data="{ row }">
        <div class="flex items-center gap-3">
          <span class="text-gray-900 dark:text-white font-medium" :title="row.address">
            {{ row.name || '/' }}
          </span>
        </div>
      </template>

      <template #address-data="{ row }">
        {{ row.address }}
      </template>

      <template #joinTime-data="{ row }">
        {{ formatDate(row.joinTime) }}
      </template>

      <template #inviter-data="{ row }">
        <span :title="row.inviterAddress">
          {{ row.inviterName ? `${row.inviterName} (${shortString(row.inviterAddress, 4)})` : shortString(row.inviterAddress, 14) }}
        </span>
      </template>
    </UTable>
  </div>
</template> 