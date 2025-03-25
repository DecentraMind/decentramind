<script setup lang="ts">
import TopNav from '~/components/TopNav.vue'
import { communityStore } from '~/stores/communityStore'
import { aoStore } from '~/stores/aoStore'
import CommunityCard from '~/components/community/CommunityCard.vue'
import { useCommunitiesQuery } from '~/composables/community/communityQuery'
import { orderBy } from 'lodash-es'

const { setCurrentCommunityUuid } = $(communityStore())
const { address } = $(aoStore())

const { data: communityList } = useCommunitiesQuery(address, {
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
})
const sortedCommunities = $computed(() => {
  // don't use communityList.value?.sort() directly, because it will mutate the original array
  return orderBy(communityList.value || [], ['buildnum', 'timestamp'], ['desc', 'desc'])
})

onMounted(async () => {
  setCurrentCommunityUuid(undefined)
})
</script>

<template>
  <div class="relative bg-grid h-screen w-full">
    <TopNav class="sticky top-0 z-10" />
    <div class="h-[calc(100vh-var(--header-height)-1rem)] overflow-y-auto">
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
  </div>
</template>
