<script setup lang="ts">
import type { Community, Mail, UserInfoWithAddress } from '~/types'
import { shortString } from '~/utils/util'
import { defaultUserAvatar, arUrl } from '~/utils/arAssets'
import { transpileModule } from 'typescript'

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
          <div
            v-for="user in users"
            :key="user.address"
            class="relative group mb-2 flex items-center justify-between overflow-hidden"
          >
            <div class="flex-center gap-3">
              <UAvatar size="lg" :src="user.avatar || arUrl(defaultUserAvatar)" />
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
