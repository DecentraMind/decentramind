<script lang="ts" setup>
import type { Community } from '~/types'
import { getCommunityBannerUrl } from '~/utils/arAssets'
import { notificationStore } from '~/stores/notificationStore'
import { aoStore } from '~/stores/aoStore'
import { useJoinMutation } from '~/composables/community/communityQuery'

const { showError, showSuccess } = $(notificationStore())
const { address, twitterVouched } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen, isVouchModalOpen } = $(aoStore())
const router = useRouter()

const props = defineProps<{
  community: Community
}>()

const { mutateAsync: joinMutateAsync, isPending, isSuccess } = useJoinMutation(() => {
  showError('Failed to join.')
})

watch(isSuccess, () => {
  showSuccess(`Joined ${props.community.name}!`)
})

const joinToCommunity = async () => {
  if (!address) {
    isLoginModalOpen = true
    return
  }
  if (address && !twitterVouched) {
    isVouchModalOpen = true
    return
  }
  try {
    await joinMutateAsync({communityToJoin: props.community, address})
    router.push('/community/' + props.community.uuid)
  } catch (error) {
    showError('Failed to join.', error as Error)
  }
}
</script>

<template>
  <UBlogPost
    :image="getCommunityBannerUrl(community.banner)"
    class="mb-2"
    :ui="{
      wrapper:
        'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
      container: 'group-hover:bg-dot pt-4',
      inner: 'flex-1 px-4 overflow-hidden',
      image: {
        wrapper: 'ring-0 rounded-none',
        base: 'ease-in-out',
      },
    }"
    @click="community.isJoined && $router.push('/community/' + community.uuid)"
  >
    <template #title>
      <div class="flex items-center">
        <ArAvatar
          :src="community.logo || defaultCommunityLogo"
          :alt="community.name"
        />
        <div class="mx-3 text-xl">
          {{ community.name }}
        </div>
      </div>
    </template>
    <template #description>
      <div class="flex flex-col space-y-2 pb-4">
        <div class="flex flex-col min-h-[50px]">
          <div class="font-medium">
            {{ community.buildnum }}
            {{ community.buildnum > 1 ? $t('community.builders') : 'builder' }}
          </div>
          <div
            class="text-base overflow-hidden whitespace-nowrap overflow-ellipsis"
          >
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
            :loading="isPending"
            @click="() => joinToCommunity()"
          >
            {{ $t('community.list.join') }}
          </UButton>
        </div>
      </div>
    </template>
  </UBlogPost>
</template>

<style></style>
