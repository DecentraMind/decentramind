<script setup lang="ts">
import { type TokenSupply } from '~/utils/constants'
import { shortString, getDomain, getHandle } from '~/utils'
import type { Community } from '~/types/index'
import { useTaskStore } from '~/stores/taskStore'
import BaseField from '~/components/fields/BaseField.vue'
import * as echarts from 'echarts'

const { getLocalCommunity, setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())
const { getBountiesByCommunityID } = useTaskStore()
const { showError } = $(notificationStore())

const router = useRouter()

const columns = [{
  key: 'name',
  class: 'text-xl'
}, {
  key: 'bountyCount',
}]


const route = useRoute()
const communityID = $computed(() => route.params.uuid) as string

let community = $ref<Community>()

type Rank = {
  receiver: string
  bountyCount: number
}

let rankings = $ref<Rank[]>()
let isLoadingRankings = $ref(true)
const loadRanks = async () => {
  try {
    const bounties = await getBountiesByCommunityID(communityID)
    console.log({bounties})
    return bounties.reduce((ranks, bounty) => {
      if (bounty.recipient === decentraMindReceiver) return ranks

      const index = ranks.findIndex(rank => rank.receiver === bounty.recipient)
      if (index >= 0) {
        ranks[index] = {...ranks[index], bountyCount: ranks[index].bountyCount + 1}
      } else {
        ranks.push({receiver: bounty.recipient, bountyCount: 1})
      }
      return ranks
    }, [] as Rank[]).sort((a, b) => {
      return a.receiver > b.receiver ? 1 : -1
    })
  } catch {
    console.error('Failed to load ranks.')
  } finally {
    isLoadingRankings = false
  }
}

const chart = $ref<HTMLDivElement>()
let isLoading = $ref(true)
onMounted( async () => {
  if (!address) {
    return router.push('/')
  }
  isLoading = true
  rankings = await loadRanks()

  try {
    community = await getLocalCommunity(communityID)
    console.log({community})

    setCurrentCommunityUuid(community.uuid)

    if (community && community.tokensupply) {
      console.log('initialize chart with tokens info:', community.tokensupply)
      const supply = community.tokensupply
      nextTick(() => {
        initChart(supply, chart)
      })
    } else {
      console.error('Failed to initialize chart: TokenSupply data is not available.')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize)
    }
  } catch (e) {
    console.error(e)
    showError('Failed to load data.', e as Error)
  } finally {
    isLoading = false
    isLoadingRankings = false
  }
})

function onResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

let chartInstance: echarts.ECharts

const initChart = (tokenSupply: TokenSupply[], chart?: HTMLDivElement) => {
  if(!chart) {
    nextTick(() => {
      initChart(tokenSupply, chart)
    })
    throw new Error('chart element not ready.')
  }
  chartInstance = echarts.init(chart)

  if (!tokenSupply || tokenSupply.length === 0) {
    console.warn('TokenSupply is not available or is not an array.')
  }
  // Convert communityInfo.supply to the format required by ECharts
  const data = tokenSupply.map(item => ({
    value: item.supply,
    name: item.name
  }))

  const option = {
    title: {
      text: `${community?.alltoken ? 'Total Supply ' + community.alltoken : ''}`,
      left: 'center',
      top: 'bottom',
      textStyle: {
        color: '#444',
        fontSize: 14,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '',
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
  }

  chartInstance.setOption(option)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && chartInstance) {
    window.removeEventListener('resize', onResize)
    chartInstance.dispose()
  }
})

</script>

<template>
  <UDashboardPage>
    <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full flex-center">
      <UIcon
        name="svg-spinners:blocks-scale"
        dynamic
        class="w-16 h-16 opacity-50"
      />
    </div>
    <div else class="w-full px-10 pt-16 overflow-y-auto">
      <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />-->
      <UPage v-if="community" class="xl:m-auto xl:max-w-[1200px]">
        <ULandingCard
          :description="community.desc"
          :links="[{ label: 'GitHub', color: 'white', to: 'https://github.com/nuxt/ui-pro/blob/dev/components/page/PageHeader.vue', target: '_blank', icon: 'i-simple-icons-github' }]"
        >
          <template #title>
            <div class="w-full flex justify-between text-3xl mb-8">
              <div class="self-start flex-center gap-4">
                <CuteRadius :width="64" :height="64">
                  <div class="aspect-square rounded-lg bg-white z-10 overflow-hidden">
                    <img
                      :src="community.logo ? arUrl(community.logo) : arUrl(defaultCommunityLogo)"
                      :title="community.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </CuteRadius>
                {{ community.name }}
              </div>
              <NuxtLink :to="`/community/${community.uuid}`">
                <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg" />
              </NuxtLink>
            </div>
          </template>
        </ULandingCard>

        <UPageBody>
          <ULandingGrid>
            <ULandingCard class="col-span-7 row-span-2" title="Profile" :ui="{title: 'text-lg', body: {base: 'gap-y-5 md:gap-y-7 mb-3'}}">
              <BaseField
                v-if="community.website"
                :name="$t('community.website')"
                :link="community.website"
                :link-text="getDomain(community.website)"
              />

              <BaseField
                v-if="community.twitter"
                :name="$t('community.twitter')"
                :link="community.twitter"
                :link-text="getHandle(community.twitter)"
                link-icon="ri:twitter-fill"
              />

              <BaseField
                v-if="community.github"
                :name="$t('community.github')"
                :link="community.github"
                :link-text="getHandle(community.github)"
                link-icon="ri:github-fill"
              />

              <BaseField :name="$t('TokenOfCommunityDetail')" :values="community.communitytoken.filter(token => token.tokenName) as unknown as Record<string, string>[]" value-key="tokenName" />

              <BaseField :name="$t('community.token.platforms')" :values="community.support as unknown as Record<string, string>[]" />

              <BaseField :name="$t('community.typereward')" :values="community.bounty as unknown as Record<string, string>[]" />
            </ULandingCard>

            <ULandingCard
              class="col-span-5 row-span-4"
              :title="$t('community.detail.contributeRank')"
              :ui="{title: 'text-lg', body: {
                base: 'gap-y-0'
              }}"
            >
              <UTable :columns="columns" :rows="rankings" :loading="isLoadingRankings">
                <template #name-data="{ row }">
                  <div class="flex items-center gap-3">
                    <!-- <ArAvatar :src="row.avatar || defaultUserAvatar" :alt="row.receiver" size="xs" /> -->
                    <span class="text-gray-900 dark:text-white font-medium">{{ shortString(row.receiver, 20) }}</span>
                  </div>
                </template>
                <template #loading-state>
                  <div class="flex items-center justify-center h-32">
                    <i class="loader --6" />
                  </div>
                </template>
              </UTable>
            </ULandingCard>

            <ULandingCard
              v-if="community?.tokensupply"
              title="Token Allocation"
              class="col-span-7 row-span-2"
              :ui="{title: 'text-lg'}"
            >
              <div ref="chart" class="w-full h-96" />
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
