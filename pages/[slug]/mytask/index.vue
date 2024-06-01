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

let arbalance = $ref('0')


const Wallettokens = ref<WalletToken[]>([]);

function convertTokenBalances() {
  const tokens: WalletToken[] = [];
  for (const [token, balance] of Object.entries(tokenBalances)) {
    tokens.push({
      token,
      balance,
      balance_u: `$${balance.toFixed(3)}`,
      avatar: {
        src: `https://i.pravatar.cc/128?u=${token}`
      },
      status: 'subscribed'
    });
  }
  Wallettokens.value = tokens;
  console.log("~~~~~~~~~",Wallettokens)
}
/*
const Wallettoken = ref<Wallettoken[]>([
  {
    id: 1,
    token: 'AR',
    chain: 'Arweave',
    balance: arbalance,
    balance_u: '$0.000',
    avatar: {
      src: 'https://i.pravatar.cc/128?u=1'
    },
    status: 'subscribed'
  }, 
  // 可以添加更多的初始数据
]);
*/

function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}
const { init, tokenBalances, totalBalance, getarbalance } = $(aoStore())

const test = async() => {
  console.log("nnnnnnnngggggg")
  convertTokenBalances()
    await init()
    convertTokenBalances()
    console.log("-----gggg",tokenBalances)
}
onMounted(async () => {
  try {
    convertTokenBalances()
    await init()
    convertTokenBalances()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitAccount">
      <UButton @click="test">test</UButton>
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
              <div class="text-5xl">{{ parseFloat(totalBalance).toFixed(3) }}</div>
              <div class="text-3xl">USD</div>
            </div>
          </template>
        </ULandingCard>
      </template>

      <UTable
        v-model:sort="sort"
        :rows="Wallettokens"
        :columns="columns"
        :loading="pending"
        sort-mode="manual"
        class="w-1/2 pl-10"
        :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
      >
        <template #token-data="{ row }">
          <div class="flex items-center gap-3">
            <!--<UAvatar v-bind="row.avatar" :alt="row.name" size="lg" />-->
            <UAvatar :alt="row.name" size="lg" />
            <div class="flex flex-col">
              <span class="text-gray-900 dark:text-white font-medium text-xl">{{ row.token }}</span>
              <span>{{ row.chain }}</span>
            </div>
          </div>
        </template>
        <template #balance-data="{ row }">
          <div class="flex flex-col">
            <span class="text-gray-900 dark:text-white font-medium text-xl">{{ parseFloat(row.balance).toFixed(3) }}</span>
            <!--<span>{{ parseFloat(arbalance).toFixed(3) }}</span>-->
          </div>
        </template>
        <!--
        <template #withdraw-data>
          <UButton>{{ $t('wallet.withdraw')}}</UButton>
        </template>
        -->
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
