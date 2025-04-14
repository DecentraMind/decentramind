<script setup lang="ts">
import { useJoinedCommunitiesQuery } from '~/composables/community/communityQuery'
import { arUrl, defaultCommunityLogo } from '~/utils/arAssets'
import { aoStore } from '~/stores/aoStore'

const { address } = $(aoStore())
const { data: joinedCommunities } = useJoinedCommunitiesQuery(address)

</script>

<template>
  <UDashboardPanelContent :ui="{wrapper: 'overflow-y-auto p-0'}">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none', base: 'p-4 h-[calc(100vh-var(--header-height)-48px)]'}">
      <template #header>
        <div class="text-xl flex items-center pl-5">
          <h3 class="w-[420px]">
            {{ $t('setting.community.isjoin') }}： {{ joinedCommunities?.length }}
          </h3>
        </div>
      </template>
      <div v-if="!joinedCommunities?.length" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div class="flex flex-wrap">
        <div v-for="(community, index) in joinedCommunities" :key="index" class="w-1/2 pl-5">
          <NuxtLink :to="`/community/${community.uuid}`" class="flex items-center mb-5 gap-2">
            <img :src="community.logo ? arUrl(community.logo) : arUrl(defaultCommunityLogo)" class="h-[64px] w-[64px] rounded-lg border">

            <div class="text-xl max-w-40 max-h-14 break-all overflow-hidden" :title="community.name">
              {{ community.name }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </UCard>
  </UDashboardPanelContent>
</template>
