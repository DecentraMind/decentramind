<script setup lang="ts">
import { tokens, type TokenName } from '~/utils/constants'
import { shortString, getDomain, getHandle } from '~/utils'
import BaseField from '~/components/fields/BaseField.vue'
import { baseFieldClasses } from '~/components/fields'
import TokenAllocationPieChart from '~/components/charts/TokenAllocationPieChart.vue'
import CommunityMembersTable from '~/components/community/CommunityMembersTable.vue'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { notificationStore } from '~/stores/notificationStore'
import { useCommunityFromCommunitiesQuery } from '~/composables/community/communityQuery'
import { useGetBountiesByCommunityIDQuery } from '~/composables/tasks/taskQuery'
import CuteRadius from '~/components/CuteRadius.vue'
import { breadcrumbStore } from '~/stores/breadcrumbStore'

const { setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())
const { showError } = $(notificationStore())
const { setBreadcrumbs } = $(breadcrumbStore())

const columns = [
  {
    key: 'name',
    label: 'Contributor',
  },
  {
    key: 'bountyCount',
    class: 'text-right',
    rowClass: 'font-mono text-right',
    label: 'Bounty Count',
  },
]

const route = useRoute()
const communityID = $computed(() => route.params.uuid) as string
const { data: community, isLoading } =
  useCommunityFromCommunitiesQuery(communityID)
const {
  data: bounties,
  isLoading: isLoadingRankings,
  isError: isErrorBounties,
  error: errorBounties,
} = useGetBountiesByCommunityIDQuery(communityID)

watch(isErrorBounties, newVal => {
  if (newVal) {
    showError('Failed to load ranks.', errorBounties.value as Error)
  }
})
watch(
  () => community.value?.name,
  communityName => {
    if (communityName) {
      setBreadcrumbs([
        {
          labelKey: 'Home',
          label: 'Home',
          to: '/discovery',
        },
        {
          label: communityName,
          to: `/community/${communityID}`,
        },
        {
          labelKey: 'detail',
          label: 'Detail',
          to: `/community/${communityID}/detail`,
        },
      ])
    }
  },
  { immediate: true },
)

const isAdminOrOwner = $computed(
  () =>
    community.value?.owner === address ||
    community.value?.admins.includes(address),
)

type Rank = {
  receiver: string
  bountyCount: number
  recipientName?: string
}

const rankings = $computed(() => {
  if (!bounties.value) return []
  const uniqueBounties = bounties.value?.filter(
    (bounty, index) =>
      bounties.value?.findIndex(
        b => b.recipient === bounty.recipient && b.taskPid === bounty.taskPid,
      ) === index,
  )

  return uniqueBounties
    .reduce((ranks, bounty) => {
      if (bounty.recipient === decentraMindReceiver) return ranks

      const index = ranks.findIndex(rank => rank.receiver === bounty.recipient)
      if (index >= 0) {
        ranks[index] = {
          ...ranks[index],
          bountyCount: ranks[index].bountyCount + 1,
        }
      } else {
        ranks.push({
          receiver: bounty.recipient,
          bountyCount: 1,
          recipientName: bounty.recipientName,
        })
      }
      return ranks
    }, [] as Rank[])
    .sort((a, b) => {
      return a.bountyCount > b.bountyCount ? -1 : 1
    })
})

const decentraMindReceiver = 'rwQW4t4EQGY48iuzPgn9P1gL8j9oBBJwkdSvfEaRYk0'

onMounted(async () => {
  try {
    console.log({ community })

    setCurrentCommunityUuid(community.value?.uuid)

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize)
    }
  } catch (e) {
    console.error(e)
    showError('Failed to load data.', e as Error)
  }
})

function onResize() {
  // Empty resize handler for any future needs
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize)
  }
})
</script>

<template>
  <UDashboardPage class="h-[calc(100vh-var(--header-height))]">
    <div
      v-if="isLoading"
      class="absolute top-0 left-0 w-full h-full flex-center"
    >
      <UIcon
        name="svg-spinners:blocks-scale"
        dynamic
        class="w-16 h-16 opacity-50"
      />
    </div>
    <div v-if="community" class="w-full h-full px-10 pt-16 overflow-y-auto">
      <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />-->
      <UPage class="xl:m-auto xl:max-w-[1200px]">
        <ULandingCard :description="community.desc">
          <template #title>
            <div class="w-full flex justify-between text-3xl mb-8">
              <div class="flex-center gap-4">
                <CuteRadius class="w-12 h-12">
                  <img
                    :src="
                      community.logo
                        ? arUrl(community.logo)
                        : arUrl(defaultCommunityLogo)
                    "
                    :title="community.name"
                    class="w-full h-full object-cover bg-white"
                  >
                </CuteRadius>
                {{ community.name }}
              </div>
            </div>
          </template>
        </ULandingCard>

        <UPageBody>
          <ULandingGrid>
            <ULandingCard
              class="col-span-7 row-span-2"
              title="Profile"
              :ui="{
                title: 'text-lg',
                body: { base: 'gap-y-5 md:gap-y-7 mb-3' },
              }"
            >
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

              <BaseField
                :name="$t('TokenOfCommunityDetail')"
                :values="community.communitytoken.filter(token => token.tokenName) as unknown as Record<string, string>[]"
                value-key="tokenName"
              />

              <BaseField
                :name="$t('community.token.platforms')"
                :values="community.support as unknown as Record<string, string>[]"
              />

              <BaseField
                :name="$t('community.type of bounty')"
                :values="community.bounty as unknown as Record<string, string>[]"
              >
                <template #values="{ values }">
                  <div class="flex space-x-3 cursor-default">
                    <UPopover
                      v-for="(v, index) in values"
                      :key="index"
                      mode="hover"
                      :popper="{ placement: 'top-end' }"
                    >
                      <span
                        :class="cn(baseFieldClasses.tag, 'cursor-default')"
                      >{{ v }}</span>
                      <template #panel>
                        <div class="flex-center px-2 gap-x-1.5">
                          {{ tokens[v as unknown as TokenName].processID }}
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </template>
              </BaseField>
            </ULandingCard>

            <ULandingCard
              class="col-span-5 row-span-4"
              :title="$t('community.detail.contributeRank')"
              :ui="{
                title: 'text-lg',
                //@ts-ignore
                body: {
                  base: 'gap-y-0',
                },
              }"
            >
              <UTable
                :columns="columns"
                :rows="rankings"
                :loading="isLoadingRankings"
                :ui="{
                  wrapper: 'mt-4 px-1 max-h-[676px] overflow-y-auto relative',
                  thead: 'sticky top-0 bg-white',
                  th: {
                    padding: 'px-1',
                  },
                  td: {
                    padding: 'px-1',
                  },
                }"
              >
                <template #name-data="{ row }">
                  <div class="flex items-center gap-3">
                    <!-- <ArAvatar :src="row.avatar || defaultUserAvatar" :alt="row.receiver" size="xs" /> -->
                    <span
                      class="text-gray-900 dark:text-white font-medium"
                      :title="row.receiver"
                    >{{
                      row.recipientName
                        ? `${row.recipientName} (${shortString(
                          row.receiver,
                          14,
                        )})`
                        : shortString(row.receiver, 20)
                    }}</span>
                  </div>
                </template>
              </UTable>
            </ULandingCard>

            <ULandingCard
              v-if="community?.tokensupply"
              title="Token Allocation"
              class="col-span-7 row-span-2"
              :ui="{
                wrapper: 'h-fit',
                title: 'text-lg',
              }"
            >
              <TokenAllocationPieChart 
                :token-supply="community.tokensupply" 
                :total-supply="community.alltoken?.toString()"
              />
            </ULandingCard>

            <ULandingCard
              v-if="isAdminOrOwner"
              title="Community Members"
              class="col-span-12"
              :ui="{
                wrapper: 'h-fit',
                title: 'text-lg',
              }"
            >
              <CommunityMembersTable :community-id="communityID" />
            </ULandingCard>
          </ULandingGrid>
        </UPageBody>
      </UPage>
    </div>
  </UDashboardPage>
</template>
