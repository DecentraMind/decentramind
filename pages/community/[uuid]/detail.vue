<script setup lang="ts">
import { type TokenSupply } from '~/utils/constants'
import { shortString, getDomain, getHandle } from '~/utils/util'
import type { Community } from '~/types/index'

const { getLocalCommunity, setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())
const { getBountiesByCommunityID } = $(taskStore())
const { showError } = $(notificationStore())
import * as echarts from 'echarts'

const { t } = useI18n()
const router = useRouter()

const columns = [{
  key: 'name',
  label: t('community.detail.contributeRank'),
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
      nextTick(() => {
        initChart(chart, community?.tokensupply)
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

const initChart = (chart: HTMLDivElement, tokenSupply: TokenSupply[]) => {
  if(!chart) {
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
      text: `Token Allocation\n${community?.alltoken ? 'Total Supply ' + community.alltoken : ''}`,
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
  }

  chartInstance.setOption(option)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && chartInstance) {
    window.removeEventListener('resize', onResize)
    chartInstance.dispose()
  }
})

const classes = {
  field: {
    wrapper: 'flex justify-between',
    value: 'flex justify-center border rounded-lg px-2',
    shortValues: 'flex justify-end items-center space-x-1'
  },
  tag: 'inline-block py-1 px-2 rounded-md bg-gray-200'
}
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
            <ULandingCard class="col-span-7 row-span-2" :ui="{wrapper: '', body: {base: 'gap-y-7 mb-3'}}">
              <div v-if="community.website" :class="classes.field.wrapper">
                <div class="font-medium">{{ $t('community.website') }}</div>

                <ULink
                  :to="community.website"
                  active-class="hover:text-primary"
                  target="_blank"
                  :inactive-class="classes.tag"
                >
                  {{ getDomain(community.website) }}
                </ULink>
              </div>

              <div v-if="community.twitter" :class="classes.field.wrapper">
                <div class="font-medium">Twitter</div>

                <ULink
                  :to="community.twitter"
                  active-class="hover:text-primary"
                  target="_blank"
                  :inactive-class="classes.tag"
                >
                  {{ getHandle(community.twitter) }}
                </ULink>
              </div>

              <div v-if="community.github" :class="classes.field.wrapper">
                <div class="font-medium">Github</div>

                <ULink
                  :to="community.github"
                  active-class="text-primary"
                  target="_blank"
                  :inactive-class="classes.tag"
                >
                  {{ getHandle(community.github) }}
                </ULink>
              </div>

              <div :class="classes.field.wrapper">
                <div class="font-medium">{{ $t('community.buildnum') }}</div>
                <div>
                  {{ community.buildnum }}
                </div>
              </div>

              <div v-if="community.communitytoken && community.communitytoken.filter(token => token.tokenName).length > 0" :class="classes.field.wrapper">
                <div class="font-medium">{{ $t('community.detail.token') }}</div>

                <div :class="classes.field.shortValues">
                  <span
                    v-for="(token, index) in community.communitytoken.filter(token => token.tokenName)"
                    :key="index"
                    :class="classes.field.value"
                  >{{ token.tokenName }}</span>
                </div>
              </div>

              <div v-if="community.support && community.support.length > 0" :class="classes.field.wrapper">
                <div class="font-medium">{{ $t('community.token.platforms') }}</div>
                <UPopover
                  mode="hover"
                  :popper="{ placement: 'top' }"
                >
                  <div :class="classes.field.shortValues">
                    <span
                      v-for="(token, index) in community.support.slice(0, 2)"
                      :key="index"
                      :class="classes.field.value"
                    >{{ token }}</span>
                  </div>
                  <template #panel>
                    <div v-if="community.support.length > 2" class="flex-center gap-x-1">
                      <div
                        v-for="(tokenName, tokenIndex) in community.support"
                        :key="tokenIndex"
                        class="px-2"
                      >
                        {{ tokenName }}
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>

              <div v-if="community.bounty && community.bounty.length > 0" :class="classes.field.wrapper">
                <div class="font-medium">{{ $t('community.typereward') }}</div>
                <div :class="classes.field.shortValues">
                  <div
                    v-for="(token, index) in community.bounty.slice(0, 2)"
                    :key="index"
                    :class="classes.tag"
                  >
                    {{ token }}
                  </div>
                </div>
              </div>
            </ULandingCard>

            <ULandingCard
              class="col-span-5 row-span-4"
              :ui="{body: {
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

            <ULandingCard v-if="community?.tokensupply" class="col-span-7 row-span-2">
              <div ref="chart" class="w-full h-96" />
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
