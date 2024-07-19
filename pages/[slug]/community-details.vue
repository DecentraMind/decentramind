<script setup lang="ts">
import {tokenProcessIDs} from '~/utils/constants'
const { getLocalcommunityInfo } = $(aocommunityStore())

const { t } = useI18n()

const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

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
  await loadCommunityInfo(route.params.pid)

  if (communityInfo && communityInfo.tokensupply) {
    initChart(communityInfo.tokensupply);
  } else {
    console.error("Failed to initialize chart: Tokensupply data is not available.");
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    });
  }
})

watch(() => route.params.pid, async (newPid) => {
  await loadCommunityInfo(newPid)
})

const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getLocalcommunityInfo(pid)
    //const jsonData = communityInfo.Messages[0].Data
    //const jsonObjects = jsonData.match(/\{.*?\}/g)
    //communityInfoJson = jsonObjects.map((item) => JSON.parse(item))
    communityLoading = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const tokenMap = $ref(tokenProcessIDs)

import * as echarts from 'echarts';

const chart = ref(null);
let chartInstance = null;

const initChart = (tokensupply) => {
  if (chart.value) {
    chartInstance = echarts.init(chart.value);

    if (tokensupply && Array.isArray(tokensupply)) {
      // Convert communityInfo.supply to the format required by ECharts
      const a = JSON.parse(JSON.stringify(communityInfo.tokensupply))

      const data = a.map(item => ({
        value: item.supply,
        name: item.name
      }));

      const option = {
        title: {
          text: `Token Allocation\nTotal Supply ${communityInfo.alltoken}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      chartInstance.setOption(option);
    } else {
      console.warn("Tokensupply is not available or is not an array.");
    }
  }
};



onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && chartInstance) {
    window.removeEventListener('resize', chartInstance.resize);
    chartInstance.dispose();
  }
});

const formatTwitter = (twitter: string | undefined): string => {
  if (!twitter || twitter.length <= 12) {
    return twitter || '';
  }
  return `${twitter.slice(0, 3)}...${twitter.slice(-3)}`;
};

const formattedTwitterLink = (twitter) => {
  const link = twitter;
  // Add https:// prefix if the link doesn't start with http:// or https://
  if (!/^(http|https):\/\//.test(link)) {
    return `https://${link}`;
  }
  return link;
}
</script>

<template>
  <UDashboardPage>
    <!--<div v-for="Info in communityInfoJson" :key="Info.uuid" class="w-full px-50">-->
    <div class="w-full px-50 pt-16 overflow-y-auto">
      <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />-->
      <UPage class="pl-10 pr-80 min-w-[1720px]">
        <ULandingCard
          description="Choose a primary and a gray color from your Tailwind CSS color palette. Components will be styled accordingly."
          color="primary"
          :links="[{ label: 'GitHub', color: 'white', to: 'https://github.com/nuxt/ui-pro/blob/dev/components/page/PageHeader.vue', target: '_blank', icon: 'i-simple-icons-github' }]">
          <template #title>
            <div class="w-full flex justify-between text-3xl mb-12 mt-3 px-12">
              {{ communityInfo.name }}
              <NuxtLink :to="`/${slug}/community/${communityInfo.uuid}`">
                <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg"/>
              </NuxtLink>
            </div>
          </template>
          <template #description>
            <div class="flex flex-col w-5/6 px-12">
              <Text class="mb-3">
                {{ $t('community.detail') }}
              </Text>
              <Text>
                {{ communityInfo.desc }}
              </Text>
            </div>
          </template>
        </ULandingCard>
        <UPageBody prose>
          <ULandingGrid>
            <ULandingCard class="col-span-8 row-span-2 flex">
              <div class="flex justify-between w-full">
                <div class="" style="flex: 1; height: 100%;">
                  <div class="flex justify-between px-6">
                    <div>{{ $t('community.website') }}</div>
                    <div class="w-48 flex justify-around items-center">
                      <div class="flex justify-center border rounded-lg w-[350px]">
                        <ULink
                          :to="formattedTwitterLink(communityInfo.website)"
                          active-class="text-primary"
                          target="_blank"
                          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {{ formatTwitter(communityInfo.website) }}
                        </ULink>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between px-6 pt-2">
                    <div><!--{{ $t('community.detail.social') }}-->Twitter</div>
                    <div class="w-48 flex justify-around items-center">
                      <div class="flex justify-center border rounded-lg w-[350px]">
                        <ULink
                          :to="formattedTwitterLink(communityInfo.twitter)"
                          active-class="text-primary"
                          target="_blank"
                          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {{ formatTwitter(communityInfo.twitter) }}
                        </ULink>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between px-6 pt-2">
                    <div>{{ $t('community.detail.token') }}</div>
                    <div v-if="communityInfo.communitytoken && communityInfo.communitytoken.length > 0" class="w-48 flex justify-around items-center space-x-1">
                      <div
                        v-for="(token, index) in communityInfo.communitytoken.slice(0,2)"
                        :key="index"
                        class="flex justify-center border rounded-lg w-[350px]"
                      >
                        <UPopover mode="hover">
                          {{ token.tokenName }}
                          <template #panel>
                            <div
                              v-for="(tokenname, tokenindex) in communityInfo.communitytoken"
                              :key="index"
                              class="flex flex-col pr-5 pl-5"
                            >
                              {{ tokenname.tokenName }}:
                              {{ tokenMap[tokenname.tokenName] }}
                            </div>
                          </template>
                        </UPopover>
                      </div>
                    </div>
                  </div>
                  <div v-if="communityInfo.support && communityInfo.support.length > 0" class="flex justify-between px-6 pt-2">
                    <div>{{ $t('community.token.platforms') }}</div>
                    <div class="w-48 flex justify-around items-center space-x-1">
                      <div
                        v-for="(token, index) in communityInfo.support.slice(0,2)"
                        :key="index"
                        class="flex justify-center border rounded-lg w-[350px]"
                      >
                        <UPopover mode="hover" :popper="{ placement: 'top' }">
                          {{ token }}
                          <template #panel>
                            <div
                              v-for="(tokenname, tokenindex) in communityInfo.support"
                              :key="tokenindex"
                              class="flex flex-col pr-5 pl-5"
                            >
                              {{ tokenname }}
                            </div>
                          </template>
                        </UPopover>
                      </div>
                    </div>
                  </div>
                  <div v-if="communityInfo.bounty && communityInfo.bounty.length > 0" class="flex justify-between px-6 pt-2">
                    <div>{{ $t('community.typereward') }}</div>
                    <div class="w-48 flex justify-around items-center space-x-1">
                      <div
                        v-for="(token, index) in communityInfo.bounty.slice(0,2)"
                        :key="index"
                        class="flex justify-center border rounded-lg w-[350px]"
                      >
                        <UPopover mode="hover" :popper="{ placement: 'top' }">
                          {{ token }}
                          <template #panel>
                            <div
                              v-for="(tokenname, tokenindex) in communityInfo.bounty"
                              :key="tokenindex"
                              class="flex flex-col pr-5 pl-5"
                            >
                              {{ tokenname }}:
                              {{ tokenMap[tokenname] }}
                            </div>
                          </template>
                        </UPopover>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="" style="flex: 1;">
                  <div class="flex justify-between px-6">
                    <div>Github</div>
                    <div class="w-48 flex justify-around items-center">
                      <div class="flex justify-center border rounded-lg w-[300px]">
                        <ULink
                          :to="formattedTwitterLink(communityInfo.github)"
                          active-class="text-primary"
                          target="_blank"
                          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {{ formatTwitter(communityInfo.github) }}
                        </ULink>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between px-6 pt-2">
                    <div>{{ $t('community.buildnum') }}</div>
                    <div class="w-48 flex justify-around items-center">
                      <div class="flex justify-center border rounded-lg w-[300px]">
                        {{ communityInfo.buildnum }}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between px-6 pt-2">
                    <div>{{ $t('community.allreward') }}</div>
                    <div class="max-w-48 flex justify-around items-center">
                      <div class="flex justify-center border rounded-lg w-[300px]">
                        {{ communityInfo && communityInfo.bounty ? communityInfo.bounty.length : 0 }}
                      </div>
                    </div>
                  </div>
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
              <div ref="chart" :style="{ width: '100%', height: '400px' }"></div>
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
