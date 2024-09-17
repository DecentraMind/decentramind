<script setup lang="ts">
import type { Community, Task, InviteCodeInfo, UserInfo } from '~/types'
import { shortString } from '~/utils'

definePageMeta({
  layout: 'landing',
})

const { joinCommunity, getCommunity, getUserByAddress } = $(communityStore())
const { getInviteByCode, joinTask } = useTaskStore()

const { doLogin } = $(aoStore())

const { showError, showSuccess } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const code = route.params.code as string

async function join() {
  if(!task?.communityUuid || !inviteInfo?.inviterAddress) {
    showError('Failed to load related data, please try refresh this page.')
    return
  }

  await doLogin()

  if (inviteInfo.type === 'community') {
    await joinCommunity(task.communityUuid, code)
  } else if (inviteInfo.type === 'task') {
    await joinCommunity(task.communityUuid, code)
    await joinTask(task.processID, code)
  }

  showSuccess('join success')
  await router.push({path: '/community/' + task.communityUuid})
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

  const { invite, task: taskInfo } = await getInviteByCode(code)
  inviteInfo = invite
  task = taskInfo
  console.log('invite info', invite, task)

  inviter = await getUserByAddress(invite.inviterAddress)
  community = await getCommunity(task.communityUuid)
  isLoading = false
})
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
          <UButton color="white" label="Join" @click="join" />
        </div>
      </template>
    </UCard>
  </UMain>
</template>
