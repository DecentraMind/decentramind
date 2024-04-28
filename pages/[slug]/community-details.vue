<script setup lang="ts">

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
  label: '社区贡献排行榜',
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
const pending = ref(true)

const route = useRoute()
watchEffect(() => {
  if (!route.params.pid) return

  console.log(route.params.pid)
})


onMounted(async () => {
  try {
    console.log(route.params.pid)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <UDashboardPage>
    <div class="w-full px-50">
      <UColorModeImage :light="light" :dark="dark" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
      <UPage class="pl-5 pr-20">
        <ULandingCard
          description="Choose a primary and a gray color from your Tailwind CSS color palette. Components will be styled accordingly."
          color="primary"
          :links="[{ label: 'GitHub', color: 'white', to: 'https://github.com/nuxt/ui-pro/blob/dev/components/page/PageHeader.vue', target: '_blank', icon: 'i-simple-icons-github' }]"
        >
          <template #title>
            <div class="text-3xl mb-12 mt-3 px-12">PermaDAO</div>
          </template>
          <template #description>
            <div class="flex flex-col w-5/6 px-12">
              <Text class="mb-3">社区详情</Text>
              <Text>
                对于网页开发或平台设计来说，在工作时可能经常会需要使用一些文字或图片来填充空白区域，
                以设计排版，让他看起来更接近完成时的样貌，也能写作其他人谅解你的构想。这是这样的<br>
                通常测试文字被称为[Lorem Ipsum]，是一篇常用于排版设计领域的拉丁文文章，主要目的是测试文章，
                或是文字在不同排版下看起来的效果，中文则被称为[乱教假文]，因为英文排版跟中文不一样，阅读的感觉也跟中文完全不同
              </Text>
            </div>
          </template>
        </ULandingCard>
        <UPageBody prose>
          <ULandingGrid>
            <ULandingCard class="col-span-4 row-span-2">
              <div 
                v-for="(item, index) in itemsbadge" 
                :key="index" 
                class="flex justify-between px-12"
              >
                <div>{{ item.label }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge v-for="(badge, badgeIndex) in item.badges" :key="badgeIndex">{{ badge }}</UBadge>
                </div>
              </div>
            </ULandingCard>
            <ULandingCard class="col-span-4 row-span-2">
              <div 
                v-for="(item, index) in itemsbadge2" 
                :key="index" 
                class="flex justify-between px-12"
              >
                <div>{{ item.label }}</div>
                <div class="w-32 flex justify-around items-center">
                  <UBadge v-for="(badge, badgeIndex) in item.badges" :key="badgeIndex">{{ badge }}</UBadge>
                </div>
              </div>
            </ULandingCard>
            <ULandingCard class="col-span-4 row-span-4">
              <UTable 
                :columns="columns" 
                :rows="ranks" 
                :loading="pending"
                class="pl-12"
              >
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
                经济模型<br>
                token总量 2100000
              </div>
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
