<script setup lang="ts">
import type { Community, Task, InviteCodeInfo, UserInfo, CommunityMember } from '~/types'
import { shortString } from '~/utils'
import LoginModal from '~/components/users/LoginModal.vue'
import ArAvatar from '~/components/ArAvatar.vue'
import { getCommunityBannerUrl, defaultUserAvatar } from '~/utils/arAssets'
import { getUserByAddress } from '~/utils/community/community'

definePageMeta({
  layout: 'landing',
  ssr: false
})

const { joinCommunity, getCommunityUser, loadCommunityList } = $(communityStore())
const { getInviteByCode } = useTaskStore()
// const runtimeConfig = useRuntimeConfig()

const { address } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen } = $(aoStore())

const { showError, showSuccess } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const code = route.params.code as string

let isJoinLoading = $ref(false)
async function join() {
  isJoinLoading = true

  try {
      if (
        (!task?.communityUuid && !community?.uuid) ||
      !inviteInfo?.inviterAddress ||
      !community
    ) {
      showError('Failed to load related data, please try refresh this page.')
      isJoinLoading = false
      return
    }

    if (!address) {
      isLoginModalOpen = true
      isJoinLoading = false
      return
    }

    await joinCommunity(community.uuid, code)

    isJoinLoading = false
    showSuccess(`Successfully joined ${community.name}!`)

    await loadCommunityList(address)
    await router.push({ path: '/community/' + community.uuid })
  } catch (error) {
    console.error(error)
    showError('Failed to join community.', error as Error)
  } finally {
    isJoinLoading = false
  }
}

let invitee = $ref<UserInfo | null>(null)
watch(() => address, async () => {
  if (address) {
    const { userInfo } = useUserInfo()
    invitee = userInfo.value
  }
})

let inviter = $ref<UserInfo>()
let inviteInfo = $ref<InviteCodeInfo>()
let task = $ref<Task>()
let community = $ref<Community>()
let communityMembers = $ref<CommunityMember[]>([])
let unsettledTasks = $ref<Task[]>([])
let isLoading = $ref(true)
onMounted(async () => {
  if (!code) {
    showError('URL not valid.')
    isLoading = false
    return
  }

  const {
    invite,
    task: taskInfo,
    community: communityInfo,
  } = await getInviteByCode(code)
  inviteInfo = invite
  task = taskInfo
  community = communityInfo
  console.log('invite info', invite, task)

  
  // Run remaining get calls in parallel
  const [unsettledTasksResult, userMapResult, inviterResult] = await Promise.all([
    getUnsettledTasksByCommunityUuid(community.uuid),
    getCommunityUser(community.uuid),
    getUserByAddress(invite.inviterAddress)
  ])

  unsettledTasks = unsettledTasksResult
  const userMap = userMapResult
  communityMembers = Object.values(userMap).sort((a, b) => {
    if (a.avatar === defaultUserAvatar && b.avatar !== defaultUserAvatar) return 1
    if (b.avatar === defaultUserAvatar && a.avatar !== defaultUserAvatar) return -1
    return b.joinTime - a.joinTime
  })
  inviter = inviterResult
  isLoading = false
})
</script>

<template>
  <div>
    <UMain class="flex flex-col justify-center items-center p-2">
      <UCard
        class="w-full md:w-2/3 max-w-md"
        :ui="{
          base: 'flex flex-col justify-between',
          background: 'bg-zinc-50',
          ring: 'ring-0',
          divide: 'divide-y-0',
          footer: {
            padding: 'py-0'
          }
        }"
      >
        <div
          v-if="community && inviteInfo"
          class="flex-center flex-col gap-2"
        >
          <ArAvatar :src="inviter ? inviter.avatar : defaultUserAvatar" size="2xl" />
          <p class="text-center">
            <template v-if="inviter">
              <span class="font-bold">{{ inviter.name }}</span>
              ({{ shortString(inviteInfo.inviterAddress, 4, 4) }})
            </template>
            <template v-else>
              <span class="font-bold">{{ shortString(inviteInfo.inviterAddress, 4, 4) }}</span>
            </template>
            has invited you to join <br><b>{{ community.name }}</b>
          </p>
        </div>

        <div v-if="community" class="flex-center flex-col gap-3 mt-4 p-4 rounded-md bg-white">
          <img :src="getCommunityBannerUrl(community.banner)" :alt="community.name" class="object-cover w-full h-52">
          <div class="flex-center gap-2 self-start">
            <ArAvatar :src="community.logo" size="md" />
            <span class="font-bold text-lg">{{ community.name }}</span>
          </div>

          <p class="text-left text-sm text-gray-400">
            {{ community.desc }}
          </p>

          <div class="w-full flex justify-between items-between gap-2">
            <div v-if="communityMembers.length" class="flex flex-col justify-center items-start gap-2">
              <span class="text-sm text-gray-400">Builders</span>
              <UAvatarGroup size="sm" :max="4">
                <ArAvatar v-for="member in communityMembers" :key="member.address" :src="member.avatar" :alt="member.name" />
              </UAvatarGroup>
            </div>
            <div v-if="unsettledTasks.length" class="flex flex-col justify-center items-start gap-2">
              <span class="text-sm text-gray-400">Active Quests</span>
              <b class="block h-8 leading-8">{{ unsettledTasks.length }}</b>
            </div>
          </div>
        </div>

        <template #footer>
          <div v-if="!isLoading" class="h-20 flex-center flex-col gap-2">
            <UButton
              v-if="address"
              :color="inviteInfo && community ? 'primary' : 'white'"
              label="Join"
              :loading="isJoinLoading"
              :disabled="isJoinLoading || !inviteInfo || !community"
              @click="join"
            />
            <UButton
              v-else
              label="Connect Wallet"
              @click="isLoginModalOpen = true"
            />
            <p v-if="address" class="text-center text-sm text-gray-400">
              continue as {{ invitee?.name || shortString(address, 4, 4) }}
            </p>
            <p v-else class="text-center text-sm text-gray-400">
              connect your wallet to join
            </p>
          </div>
          <div v-else class="h-16 w-full flex justify-center">
            <UIcon name="svg-spinners:3-dots-fade" size="xl" />
          </div>
        </template>
      </UCard>

      <LoginModal @login="join" />
    </UMain>
  </div>
</template>
