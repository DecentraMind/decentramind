<script setup lang="ts">
import { communityStore } from '~/stores/communityStore'
import { aoStore } from '~/stores/aoStore'
import CommunityCard from '~/components/community/CommunityCard.vue'
import { useCommunitiesQuery } from '~/composables/community/communityQuery'
import { orderBy } from 'lodash-es'
import { breadcrumbStore } from '~/stores/breadcrumbStore'

const { setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())
const { setBreadcrumbs } = $(breadcrumbStore())

const { data: communityList } = useCommunitiesQuery(address, {
  refetchOnMount: address ? 'always' : false,
  refetchOnWindowFocus: address ? 'always' : false,
})
const sortedCommunities = $computed(() => {
  // don't use communityList.value?.sort() directly, because it will mutate the original array
  return orderBy(communityList.value || [], ['buildnum', 'timestamp'], ['desc', 'desc'])
})

onMounted(async () => {
  setCurrentCommunityUuid(undefined)
  
  // 设置首页面包屑
  setBreadcrumbs([{
    labelKey: 'Explore',
    label: 'Explore'
  }])
})
</script>

<template>
  <div class="h-[calc(100vh-var(--header-height))] overflow-y-auto">
    <div
      v-if="sortedCommunities && sortedCommunities.length > 0"
      class="pt-5 pb-20 px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-8"
    >
      <CommunityCard
        v-for="community in sortedCommunities"
        :key="community.uuid"
        :community="community"
      />
    </div>
  </div>
</template>
