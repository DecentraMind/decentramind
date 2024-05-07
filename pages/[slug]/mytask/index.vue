<script setup lang="ts">

const {t} = useI18n()

const defaultColumns = [{
  key: 'token',
  label: t('wallet.all')
}, {
  key: 'balance',
  label: t('wallet.balance')
}, {
  key: 'withdraw',
  label: ''
}]

const q = ref('')
const selectedColumns = $ref(defaultColumns)
const selectedStatuses = $ref([])
const selectedLocations = $ref([])
const sort = $ref({ column: 'id', direction: 'asc' as const })


const columns = computed(() => defaultColumns.filter((column) => selectedColumns.includes(column)))

const query = computed(() => ({ q: q.value, statuses: selectedStatuses, locations: selectedLocations, sort: sort.column, order: sort.direction }))

const { data: Wallettoken, pending } = await useFetch<Wallettoken[]>('/api/wallettoken', { query, default: () => [] })


function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}




</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitAccount">
      <template #header>
        <ULandingCard
          description="39.44USD"
          color="primary"
          class="w-[600px]"
        >
          <template #title>
            <div class="text-2xl">{{ $t('wallet.all')}}</div>
          </template>
          <template #description>
            <div class="flex items-center mt-5">
              <div class="text-5xl">39.44</div>
              <div class="text-3xl">USD</div>
            </div>
          </template>
        </ULandingCard>
      </template>

      <UTable
        v-model:sort="sort"
        :rows="Wallettoken"
        :columns="columns"
        :loading="pending"
        sort-mode="manual"
        class="w-1/2 pl-10"
        :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
      >
        <template #token-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar v-bind="row.avatar" :alt="row.name" size="lg" />
            <div class="flex flex-col">
              <span class="text-gray-900 dark:text-white font-medium text-xl">{{ row.token }}</span>
              <span>{{ row.chain }}</span>
            </div>
          </div>
        </template>
        <template #balance-data="{ row }">
          <div class="flex flex-col">
            <span class="text-gray-900 dark:text-white font-medium text-xl">{{ row.balance }}</span>
            <span>{{ row.balance_u }}</span>
          </div>
        </template>
        <template #withdraw-data>
          <UButton>{{ $t('wallet.withdraw')}}</UButton>
        </template>
      </UTable>

      <template #footer>
        <div class="flex pl-10">
          <UButton type="submit" color="black">
            {{ $t('wallet.token')}}
          </UButton>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
