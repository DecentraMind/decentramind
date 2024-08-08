<script lang="ts" setup>
import { getCommunityBannerUrl } from '~/utils/arAssets'

const { joinCommunity, getCommunity, getUserByAddress } = $(aoCommunityStore())

const { doLogin } = $(aoStore())

const { showError, showSuccess } = $(notificationStore())

const props = defineProps({
  sortedCommunities: Array
})
</script>

<template>
  <UBlogPost
    :image="getCommunityBannerUrl(community.banner)"
    class="mb-2"
    :ui="{
      wrapper: 'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
      container: 'group-hover:bg-dot pt-4',
      inner: 'flex-1 px-4 overflow-hidden',
      image: {
        wrapper: 'ring-0 rounded-none'
      }
    }"
    @click="community.isJoined && $router.push('/community/' + community.uuid)"
  >
    <template #title>
      <div class="flex items-center">
        <UAvatar :src="Logo || arUrl(communityLogo)" :alt="community.name" class="ring-1 ring-gray-100" />
        <div class="mx-3 text-xl">
          {{ community.name }}
        </div>
      </div>
    </template>
    <template #description>
      <div class="flex flex-col space-y-2 pb-4">
        <div class="flex flex-col min-h-[50px]">
          <div class="text-lg font-semibold">
            builder: {{ community.buildnum }}
          </div>
          <div class="text-base overflow-hidden whitespace-nowrap overflow-ellipsis">
            {{ community.desc }}
          </div>
        </div>
        <div class="self-end">
          <UButton
            v-if="community.isJoined"
            class="w-[65px] text-slate-400"
            size="md"
            color="white"
            variant="ghost"
          >
            {{ $t('community.list.isjoin') }}
          </UButton>
          <!-- Show UButton Component -->
          <UButton
            v-else
            class="self-end right-0 w-[65px] ring-gray-200 hover:ring-gray-400"
            block
            :ui="{ font: 'font-medium' }"
            color="white"
            size="md"
            variant="outline"
            @click="() => joinToCommunity(community.uuid)"
          >
            {{ $t('community.list.join') }}
          </UButton>
        </div>
      </div>
    </template>
  </UBlogPost>
</template>


<style>

</style>
