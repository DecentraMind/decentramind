<script setup lang="ts">
import type { Community, Task, InviteCodeInfo, UserInfo } from '~/types'
import { shortString } from '~/utils'
import VouchModal from '~/components/users/VouchModal.vue'

definePageMeta({
  layout: 'landing',
})

const { joinCommunity, getUserByAddress, vouch } = $(communityStore())
const { getInviteByCode, joinTask } = useTaskStore()
const runtimeConfig = useRuntimeConfig()

const { doLogin } = $(aoStore())

const { showError, showSuccess } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const code = route.params.code as string

let vouchModalOpen = $ref(false)

let isJoinLoading = $ref(false)
async function join() {
  isJoinLoading = true

  if((!task?.communityUuid && !community?.uuid) || !inviteInfo?.inviterAddress || !community) {
    showError('Failed to load related data, please try refresh this page.')
    isJoinLoading = false
    return
  }

  await doLogin()
  const isVouched = await checkVouch()
  if (!isVouched && !runtimeConfig.public.debug) {
    vouchModalOpen = true
    isJoinLoading = false
    return
  }

  if (inviteInfo.type === 'community' && community) {
    await joinCommunity(community.uuid, code)
  } else if (inviteInfo.type === 'task' && task) {
    await joinCommunity(task.communityUuid, code)
    await joinTask(task.processID, code)
  }

  isJoinLoading = false
  showSuccess(`Successfully joined ${community.name}!`)
  await router.push({path: '/community/' + inviteInfo.communityUuid})
}

let inviter = $ref<UserInfo>()
let inviteInfo = $ref<InviteCodeInfo>()
let task = $ref<Task>()
let community = $ref<Community>()
let isLoading = $ref(true)
onMounted(async () => {
  if(!code) {
    showError('URL not valid.')
    isLoading = false
    return
  }

  const { invite, task: taskInfo, community: communityInfo } = await getInviteByCode(code)
  inviteInfo = invite
  task = taskInfo
  community = communityInfo
  console.log('invite info', invite, task)

  inviter = await getUserByAddress(invite.inviterAddress)
  isLoading = false
})

const checkVouch = async () => {
  const twitterIDs = await vouch()
  return !!twitterIDs.length
}
</script>

<template>
  <UMain class="flex flex-col justify-center items-center p-2">
    <UCard class="w-full md:w-2/3">
      <template #header>
        <h2 class="font-bold text-center">Invitation</h2>
      </template>

      <div v-if="isLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" size="xl" />
      </div>

      <div v-if="!isLoading && community && inviter && inviteInfo" class="flex justify-between">
        <p><span :title="inviteInfo.inviterAddress" class="font-bold">{{ inviter.name ? `${inviter.name} (${shortString(inviteInfo.inviterAddress)})` : shortString(inviteInfo.inviterAddress) }}</span> invited you to join a community:</p>
        <p class="font-bold">{{ community.name }}</p>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton color="white" label="Join" :loading="isJoinLoading" :disabled="isJoinLoading" @click="join" />
        </div>
      </template>
    </UCard>
    
    <VouchModal :is-open="vouchModalOpen" />
  </UMain>
</template>
