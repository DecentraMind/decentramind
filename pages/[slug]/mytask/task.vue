<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'



const items = [{
  slot: 'join',
  label: '已参与 40'
}, {
  slot: 'reward',
  label: '已获取奖励'
}]

const accountForm = reactive({ name: 'Benjamin', username: 'benjamincanac' })
const passwordForm = reactive({ currentPassword: '', newPassword: '' })

function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}

function onSubmitPassword () {
  console.log('Submitted form:', passwordForm)
}




const defaultColumns = [{
  key: 'id',
  label: '',
}, {
  key: 'name',
  label: '名称'
}, {
  key: 'from',
  label: '来自社区'
}]

const rewardColumns = [{
  key: 'id',
  label: '',
}, {
  key: 'name',
  label: '名称'
}, {
  key: 'balance',
  label: '金额',
}, {
  key: 'from',
  label: '来自社区'
}]

const q = ref('')
const selectedColumns = ref(defaultColumns)
const selectedStatuses = ref([])
const selectedLocations = ref([])
const sort = ref({ column: 'id', direction: 'asc' as const })


const columns = computed(() => defaultColumns.filter((column) => selectedColumns.value.includes(column)))

const query = computed(() => ({ q: q.value, statuses: selectedStatuses.value, locations: selectedLocations.value, sort: sort.value.column, order: sort.value.direction }))

const { data: Wallettoken, pending } = await useFetch<Tasks[]>('/api/task', { query, default: () => [] })




const selectedrewardColumns = ref(rewardColumns)
const rewardcolumns = computed(() => rewardColumns.filter((column) => selectedrewardColumns.value.includes(column)))


</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitAccount">
      <template #header>
        <UBadge>
          公开任务区
        </UBadge>
      </template>

      <UTabs :items="items" class="w-1/2">
        <template #join>
          <UCard @submit.prevent="onSubmitAccount">
            <UTable
              v-model:sort="sort"
              :rows="Wallettoken"
              :columns="columns"
              :loading="pending"
              sort-mode="manual"
              class="pl-10"
              :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
            />
          </UCard>
        </template>

        <template #reward>
          <UCard @submit.prevent="onSubmitPassword">
            <UTable
              v-model:sort="sort"
              :rows="Wallettoken"
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
          总金额：111U
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
