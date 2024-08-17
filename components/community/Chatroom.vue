<script setup lang="ts">
import type { Community, Mail, UserInfoWithAddress } from '~/types'
import { shortString } from '~/utils/util'
import { defaultUserAvatar, arUrl } from '~/utils/arAssets'

const props = defineProps<{
  community: Community
  address: string
}>()
const { community, address } = $(toRefs(props))

const { getCommunityUser, mute, unmute, getMutedUsers, setCurrentCommunityUuid, setCurrentCommunityUserMap } = $(communityStore())

const selectedTab = $ref(0)

const { stateArr: mails } = $(inboxStore())

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

const chatID = community.communitychatid

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
    })
  await setCurrentCommunityUserMap(userMap)
  console.log('-------chatroom mounted--------')
  console.log({users})
})

let isMuteModalOpen =$ref(false)
let isUnmuteModalOpen =$ref(false)

let currentUser = $ref<string>()

let isDoingMute = $ref(false)
const OpenMuteModal = (address: string) => {
  isMuteModalOpen = true
  currentUser = address
}
const doMute = async() => {
  if (!currentUser) return
  isDoingMute = true
  await mute(community.uuid, currentUser)

  const index = users.findIndex(user => user.address === currentUser)
  if (index > -1) {
    users[index].muted = true
  }

  isDoingMute = false
  isMuteModalOpen = false
}

let isDoingUnmute = $ref(false)
const OpenUnmuteModal = (address: string) => {
  isUnmuteModalOpen = true
  currentUser = address
}
const doUnmute = async() => {
  if (!currentUser) return
  isDoingUnmute = true
  await unmute(community.uuid, currentUser)
  mutedUsers = await getMutedUsers(community.uuid)

  const index = users.findIndex(user => user.address === currentUser)
  if (index > -1) {
    users[index].muted = false
  }

  isDoingUnmute = false
  isUnmuteModalOpen = false
}

</script>

<template>
  <UPage class="w-full">
    <div class="w-full h-full grid grid-cols-1 sm:grid-cols-[1fr,230px]">
      <div class="flex h-full">
        <InboxMail v-if="chatID" :chat="chatID" />
        <UDivider orientation="vertical" />
      </div>
      <div class="hidden sm:block pt-2 bg-gray-50">
        <UDashboardNavbar title="Users" :ui="{ badge: { size: 'lg'}}" :badge="users.length">
          <template #title>
            <span class="text-2xl mr-2">Users</span>
          </template>
        </UDashboardNavbar>

        <div v-if="community" class="py-4 px-2">
          <div
            v-for="user in users"
            :key="user.address"
            class="relative group py-2 px-2 rounded-md hover:bg-slate-100 p-1 flex items-center justify-between max-w-full overflow-hidden"
          >
            <div class="flex-center gap-2">
              <UAvatar size="sm" :src="user.avatar ? arUrl(user.avatar) : arUrl(defaultUserAvatar)" class="overflow-hidden ring-gray-300 dark:ring-gray-700" />
              <div class="flex text-base">
                <span class="text-center font-medium">{{ user.name || shortString(user.address) }}</span>
              </div>
            </div>

            <UButton
              v-show="community.owner === address"
              :color="user.muted ? 'white' : 'gray'"
              variant="solid"
              size="xs"
              class="absolute right-[-100px] group-hover:right-0 top-1/2 transform -translate-y-1/2 translate-x-full group-hover:translate-x-0 transition-all duration-200 ease-in-out"
              @click="user.muted ? OpenUnmuteModal(user.address) : OpenMuteModal(user.address)"
            >
              {{ user.muted ? 'unmute' : 'mute' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="isMuteModalOpen">
      <UCard class="flex justify-center">
        <div class="w-full flex justify-center text-xl">
          Sure to Mute?
        </div>
        <div v-if="!isDoingMute" class="h-16 w-full flex space-x-10 mt-6 justify-between">
          <UButton
            variant="outline"
            @click="isMuteModalOpen = false"
          >
            No
          </UButton>
          <UButton
            variant="outline"
            @click="doMute"
          >
            Yes
          </UButton>
        </div>
        <div v-else class="h-16 flex flex-col items-center justify-center">
          <span><UIcon name="svg-spinners:12-dots-scale-rotate" />Mute...</span>
        </div>
      </UCard>
    </UModal>

    <UModal v-model="isUnmuteModalOpen">
      <UCard class="flex justify-center">
        <div class="w-full flex justify-center text-xl">
          Sure to Unmute?
        </div>
        <div v-if="!isDoingUnmute" class="h-16 w-full flex space-x-10 mt-6 justify-between">
          <UButton
            variant="outline"
            @click="isUnmuteModalOpen = false"
          >
            No
          </UButton>
          <UButton
            variant="outline"
            @click="doUnmute"
          >
            Yes
          </UButton>
        </div>
        <div v-else class="h-16 flex flex-col items-center justify-center">
          <span><UIcon name="svg-spinners:12-dots-scale-rotate" />Unmute...</span>
        </div>
      </UCard>
    </UModal>
  </UPage>
</template>
