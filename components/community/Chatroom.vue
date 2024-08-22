<script setup lang="ts">
import type { Community, Mail, UserInfoWithAddress } from '~/types'
import { shortString } from '~/utils/util'
import { defaultUserAvatar } from '~/utils/arAssets'
import InboxMail from '../inbox/InboxMail.vue'

const props = defineProps<{
  community: Community
  address: string
}>()
const { community, address } = $(toRefs(props))

const { getCommunityUser, mute, unmute, getMutedUsers, setCurrentCommunityUuid, setCurrentCommunityUserMap } = $(communityStore())
const { stateArr: mails } = $(inboxStore())
const { showSuccess, showError } = $(notificationStore())

const selectedTab = $ref(0)


// Filter mails based on the selected tab
const filteredMails = $computed(() => {
  if (selectedTab === 1) {
    return mails.filter(mail => !!mail.unread)
  }

  return mails
})

let selectedMail = $ref<Mail>()

watchEffect(() => {
  if (!filteredMails?.find(mail => mail.id === selectedMail?.id)) {
    selectedMail = null
  }
})

let users = $ref<UserInfoWithAddress[]>([])

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mutedUsers = $ref<string[]>([])
onMounted(async () => {
  setCurrentCommunityUuid(community.uuid)
  mutedUsers = await getMutedUsers(community.uuid)
  const userMap = await getCommunityUser(community.uuid)
  users = Object.entries(userMap).map((
      [key, user]
    ) => {
      return {
        address: key,
        ...user
      }
    }).sort((a, b) => {
      return a.muted && !b.muted ? 1
      : !a.muted && !b.muted ? 0 : -1
    })
  await setCurrentCommunityUserMap(userMap)
  console.log('-------chatroom mounted--------')
  console.log({users})
})

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

    showSuccess(`You have ${action} ` + user.name || shortAddress(user.address))
  } catch (e) {
    showError('Failed to mute.', e as Error)
  }
}

</script>

<template>
  <UPage class="w-full">
    <div class="relative w-full h-full grid grid-cols-1 sm:grid-cols-[1fr,230px]">
      <div v-if="community.isJoined" class="flex h-screen ">
        <InboxMail :chat="community.communitychatid" />
        <UDivider orientation="vertical" />
      </div>
      <div v-if="community.isJoined" class="hidden sm:block bg-gray-50">
        <UDashboardNavbar title="Users" :ui="{ badge: { size: 'lg'}}" :badge="users.length">
          <template #title>
            <span class="text-2xl mr-2">Users</span>
          </template>
        </UDashboardNavbar>

        <div v-if="community" class="py-4 px-2">
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
              v-if="community.owner === address && user.address !== community.owner"
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
