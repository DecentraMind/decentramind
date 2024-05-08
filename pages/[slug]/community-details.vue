<script setup lang="ts">

const { getCommunityInfo } = $(aocommunityStore())

const { t } = useI18n()

const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'


const itemsbadge = [
  { label: '网站', badges: ['ethereum.org'] },
  { label: '社交媒体', badges: ['Twitter'] },
  { label: '社区代币', badges: ['PERMA', 'USDT'] },
  { label: '交易平台', badges: ['Twitter'] },
  { label: '贡献社区代币类型', badges: ['PERMA'] }
]

const itemsbadge2 = [
  { label: 'GitHub', badges: ['ethereum.org'] },
  { label: 'Builder数量', badges: ['514'] },
  { label: '项目已发放激励', badges: ['5000', 'USDT'] }
]


const columns = [{
  key: 'name',
  label: t('community.detail.contribute.rank'),
  class: 'text-xl'
}, {
  key: 'rank',
}]

const ranks = [{
  name: 'Lindsay Walton',
  rank: 1,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}, {
  name: 'Courtney Henry',
  rank: 2,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}, {
  name: 'Tom Cook',
  rank: 3,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}, {
  name: 'Whitney Francis',
  rank: 4,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}, {
  name: 'Leonard Krasner',
  rank: 5,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}, {
  name: 'Floyd Miles',
  rank: 6,
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
}]
const pending = $ref(true)

const route = useRoute()
let communityInfo = $ref({})
let communityInfoJson = $ref({})

let communityLoading = $ref(true)

watchEffect(() => {
  if (!route.params.pid) return

  console.log(route.params.pid)
})


onMounted(async () => {
  await loadCommunityInfo(route.params.pid);
});

watch(() => route.params.pid, async (newPid) => {
  await loadCommunityInfo(newPid);
});

const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getCommunityInfo(pid);
    const jsonData = communityInfo.Messages[0].Data;
    const jsonObjects = jsonData.match(/\{.*?\}/g);
    communityInfoJson = jsonObjects.map((item) => JSON.parse(item));
    communityLoading = false;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
</script>

<template>
  <UDashboardPage>
    <div v-if="communityLoading" class="w-full flex justify-center">
      <UIcon name="svg-spinners:blocks-scale" class="mt-0 w-[250px]" size="xl" dynamic v-bind="$attrs" />
    </div>
    <div v-for="Info in communityInfoJson" :key="Info.uuid" class="w-full px-50">
      <UColorModeImage :light="light" :dark="dark" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
      <UPage class="pl-36 pr-80">
        <ULandingCard
          description="Choose a primary and a gray color from your Tailwind CSS color palette. Components will be styled accordingly."
          color="primary"
          :links="[{ label: 'GitHub', color: 'white', to: 'https://github.com/nuxt/ui-pro/blob/dev/components/page/PageHeader.vue', target: '_blank', icon: 'i-simple-icons-github' }]">
          <template #title>
            <div class="text-3xl mb-12 mt-3 px-12">{{ Info.name }}</div>
          </template>
          <template #description>
            <div class="flex flex-col w-5/6 px-12">
              <Text class="mb-3">{{ $t('community.detail') }}</Text>
              <Text>
                {{ Info.desc }}
              </Text>
            </div>
          </template>
        </ULandingCard>
        <UPageBody prose>
          <ULandingGrid>
            <ULandingCard class="col-span-4 row-span-2">
              <div class="flex justify-between px-12">
                <div>{{ $t('community.website') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.detail.social') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.detail.token') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.token.platforms') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.detail.contribute') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
            </ULandingCard>
            <ULandingCard class="col-span-4 row-span-2">
              <div class="flex justify-between px-12">
                <div>Github</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.buildnum') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
              <div class="flex justify-between px-12">
                <div>{{ $t('community.detail.reward.issued') }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge>{{ Info.website }}</UBadge>
                </div>
              </div>
            </ULandingCard>
            <ULandingCard class="col-span-4 row-span-4">
              <UTable :columns="columns" :rows="ranks" :loading="pending" class="pl-12">
                <template #name-data="{ row }">
                  <div class="flex items-center gap-3">
                    <UAvatar v-bind="row.avatar" :alt="row.name" size="xs" />
                    <span class="text-gray-900 dark:text-white font-medium">{{ row.name }}</span>
                  </div>
                </template>
                <template #loading-state>
                  <div class="flex items-center justify-center h-32">
                    <i class="loader --6" />
                  </div>
                </template>
              </UTable>
            </ULandingCard>
            <ULandingCard class="col-span-8 row-span-2">
              <div class="px-12">
                {{ $t('community.economics') }}<br>
                {{ $t('community.token.all') }} 2100000
              </div>
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
