<script setup lang="ts">
import type { Community, UserInfoWithAddress } from '~/types'
import { shortString, defaultUserAvatar } from '~/utils'
import ChatArea from '../inbox/ChatArea.vue'
import { notificationStore } from '~/stores/notificationStore'
import { communityStore } from '~/stores/communityStore'
import { useGetCommunityUserQuery } from '~/composables/community/communityQuery'
import Loading from '../Loading.vue'
import { useQueryClient } from '@tanstack/vue-query'

const props = defineProps<{
  community: Community
  address: string
}>()
const { community, address } = $(toRefs(props))

const { mute, unmute, setCurrentCommunityUuid, setCurrentCommunityUserMap } = $(communityStore())
const { showSuccess, showError } = $(notificationStore())

const isAdminOrOwner = (address: string) => community && address ? community.owner === address || community.admins.includes(address) : false

const { data: userMap, isSuccess, isLoading: isLoadingUserMap } = useGetCommunityUserQuery(community.uuid, {
  // refetchOnWindowFocus: true,
  refetchOnMount: true,
  // refetchOnReconnect: true,
  staleTime: 0,
})
watch(isSuccess, (isSuccess) => {
  if (isSuccess && userMap.value) {
    setCurrentCommunityUserMap(userMap.value)
    console.log('userMap', userMap.value)
  }
})
const users = $computed<UserInfoWithAddress[]>(() => {
  return Object.values(userMap.value || {}).sort((a, b) => {
    return a.muted && !b.muted ? 1
    : !a.muted && !b.muted ? 0 : -1
  })
})

onMounted(async () => {
  setCurrentCommunityUuid(community.uuid)
})

const queryClient = useQueryClient()
const muteOrUnmute = async(user: UserInfoWithAddress) => {
  if (!user) return

  try {
    let action
    if (!user.muted) {
      action = 'muted'
      await mute(community.uuid, user.address)
    } else {
      action = 'unmuted'
      await unmute(community.uuid, user.address)
    }

    user.muted = !user.muted

    showSuccess(`You have ${action} ` + user.name || shortString(user.address))

    // invalidate community user query
    queryClient.invalidateQueries({ queryKey: ['community', 'communityUser', community.uuid] })
    // refetch community user query
    queryClient.refetchQueries({ queryKey: ['community', 'communityUser', community.uuid] })
  } catch (e) {
    showError('Failed to mute.', e as Error)
  }
}

</script>

<template>
  <UPage class="w-full">
    <div class="relative w-full grid grid-cols-1 sm:grid-cols-[1fr,230px]">
      <div v-if="community.isJoined" class="flex h-[calc(100vh-var(--header-height))]">
        <ChatArea :chat="community.communitychatid" :community-uuid="community.uuid" />
        <UDivider orientation="vertical" />
      </div>
      <div v-if="community.isJoined" class="hidden sm:block bg-gray-50">
        <UDashboardNavbar title="Users" :badge="users.length">
          <template #title>
            <span class="text-2xl mr-2">Users</span>
          </template>
        </UDashboardNavbar>

        <div v-if="isLoadingUserMap" class="flex-center h-full">
          <Loading />
        </div>
        <div v-else-if="community" class="py-4 px-2 max-h-[calc(100vh-var(--header-height))] overflow-y-auto">
          <div
            v-for="user in users"
            :key="user.address"
            :class="cn('relative group py-2 px-2 rounded-md hover:bg-slate-100 p-1 flex items-center justify-between max-w-full overflow-hidden', {
              'opacity-30 hover:opacity-100': user.muted
            })"
          >
            <div class="flex-center gap-2">
              <ArAvatar size="sm" :src="user.avatar || defaultUserAvatar" />
              <div class="flex text-base">
                <span class="text-center font-medium">{{ user.name || shortString(user.address) }}</span>
              </div>
            </div>

            <Confirm
              v-if="isAdminOrOwner(address) && user.address !== address && (
                user.muted || (!user.muted && !isAdminOrOwner(user.address))
              )"
              :confirm-btn-text="user.muted ? 'Unmute' : 'Mute'"
              :title="`${user.muted ? 'Unmute' : 'Mute'} User`"
              :body="`Are you sure want to ${user.muted ? 'unmute' : 'mute'} ${user.name || shortString(user.address)}?`"
              @confirm="muteOrUnmute(user)"
            >
              <UButton
                :color="user.muted ? 'green' : 'red'"
                variant="soft"
                size="xs"
                class="absolute right-[-100px] group-hover:right-2 top-1/2 transform -translate-y-1/2 translate-x-full group-hover:translate-x-0 transition-all duration-200 ease-in-out"
              >
                {{ user.muted ? 'unmute' : 'mute' }}
              </UButton>
            </Confirm>
          </div>
        </div>
      </div>
      <!-- TODO show modal at click chat room button -->
      <div v-else class="absolute w-full h-screen flex-col-center"><span>Join this community to unlock chatroom.</span></div>
    </div>
  </UPage>
</template>
