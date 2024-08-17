<script setup lang="ts">
import type { Community, Mail, UserInfo } from '~/types'
import { shortString } from '~/utils/util'
import { defaultUserAvatar, arUrl } from '~/utils/arAssets'

const props = defineProps<{
  community: Community
  address: string
}>()
const { community, address } = $(toRefs(props))

const { getCommunityUser, mute, unmute, getMutedUsers } = $(communityStore())

const selectedTab = $ref(0)

const { stateArr: mails } = $(inboxStore())

// Filter mails based on the selected tab
const filteredMails = $computed(() => {
  if (selectedTab === 1) {
    return mails.filter(mail => !!mail.unread)
  }

  return mails
})

let selectedMail = $ref<Mail | null>()

watchEffect(() => {
  if (!filteredMails?.find(mail => mail.id === selectedMail?.id)) {
    selectedMail = null
  }
})


let users = $ref<Array<UserInfo & { address: string }>>([])

const chatID = community.communitychatid

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mutedUsers = $ref<string[]>([])
onMounted(async () => {
  mutedUsers = await getMutedUsers(community.uuid)
  users = await getCommunityUser(community.uuid)
  console.log('-------chatroom mounted--------')
  console.log({users})
})

let isMuteModalOpen =$ref(false)
let isUnmuteModalOpen =$ref(false)

let currentUser = $ref('')

const showMuteOrUnmute = $ref(false)

let isDoingMute = $ref(false)
const OpenMuteModal = (index: string) => {
  isMuteModalOpen = true
  currentUser = index
}
const doMute = async() => {
  isDoingMute = true
  await mute(community.uuid, currentUser)
  isDoingMute = false
  isMuteModalOpen = false
}

let isDoingUnmute = $ref(false)
const OpenUnmuteModal = (index: string) => {
  isUnmuteModalOpen = true
  currentUser = index
}
const doUnmute = async() => {
  isDoingUnmute = true
  await unmute(community.uuid, currentUser)
  mutedUsers = await getMutedUsers(community.uuid)
  isDoingUnmute = false
  isUnmuteModalOpen = false
}

const isUserBanned = (userAddress: string) => {
  return mutedUsers.includes(userAddress)
}

</script>

<template>
  <UPage class="w-full">
    <UPageGrid class="w-full h-full">
      <div class="flex col-span-2 w-full h-full ml-6">
        <div v-if="chatID" class="w-full mr-2">
          <InboxMail :chat="chatID" />
        </div>
        <UDivider orientation="vertical" />
      </div>
      <div class="pt-2 pr-10 pl-2">
        <UDashboardNavbar title="Users" :ui="{ badge: { size: 'lg'}}" :badge="users.length">
          <template #title>
            <Text class="text-3xl">
              User
            </Text>
          </template>
        </UDashboardNavbar>
        <div v-if="community" class="pt-2 pl-2">
          <div v-for="user in users" :key="user.address" class="flex items-center justify-between pr-20">
            <div
              class="relative flex items-center justify-between overflow-hidden"
              @mouseenter="showMuteOrUnmute = true"
              @mouseleave="showMuteOrUnmute = false"
            >
              <div class="flex items-center">
                <div class="mr-3">
                  <UAvatar size="lg" :src="user.avatar || arUrl(defaultUserAvatar)" />
                </div>
                <div class="flex text-2xl">
                  <div class="text-center">{{ user.name || shortString(user.address) }}</div>
                </div>
              </div>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-300 ease-in"
                enter-from-class="translate-x-full opacity-0"
                enter-to-class="translate-x-0 opacity-100"
                leave-from-class="translate-x-0 opacity-100"
                leave-to-class="translate-x-full opacity-0"
              >
                <UButton
                  v-show="showMuteOrUnmute && community.owner === address"
                  :color="isUserBanned(user.address) ? 'gray' : 'gray'"
                  variant="solid"
                  class="absolute right-0 top-1/2 transform -translate-y-1/2"
                  @click="isUserBanned(user.address) ? OpenUnmuteModal(user.address) : OpenMuteModal(user.address)"
                >
                  {{ isUserBanned(user.address) ? 'unmute' : 'mute' }}
                </UButton>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </UPageGrid>

    <UModal v-model="isMuteModalOpen">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to Mute?
        </div>
        <div v-if="!isDoingMute" class="w-full flex space-x-10 mt-6 justify-between">
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
        <div v-else class="h-[80px] flex flex-col items-center justify-center">
          <Text>Mute...</Text>
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>

    <UModal v-model="isUnmuteModalOpen">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to Unmute?
        </div>
        <div v-if="!isDoingUnmute" class="w-full flex space-x-10 mt-6 justify-between">
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
        <div v-else class="h-[80px] flex flex-col items-center justify-center">
          <Text>Unmute...</Text>
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>
  </UPage>
</template>
