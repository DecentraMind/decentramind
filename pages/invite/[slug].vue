<script setup lang="ts">
import type { Community, UserInfo } from '~/types'
import { shortString } from '~/utils/util'

definePageMeta({
  layout: 'landing',
})

const { joinCommunity, getCommunity, getUserByAddress } = $(aoCommunityStore())

const { doLogin } = $(aoStore())

const { showError, showSuccess } = $(notificationStore())

const route = useRoute()
const router = useRouter()

const slug = $computed(() => {
  const fullSlug = (route.params.slug as string).split('&')
  return {
    communityID: fullSlug[0] || '',
    inviterAddress: fullSlug[1] || ''
  }
})

async function join() {
  if(!slug.communityID || !slug.inviterAddress) {
    showError('URL not valid.')
    return
  }

  await doLogin()

  await joinCommunity(slug.communityID, slug.inviterAddress)

  showSuccess('join success')
  await router.push({path: '/community/' + slug.communityID})
}

let inviter = $ref<UserInfo>()
let community = $ref<Community>()
let isLoading = $ref(true)
onMounted(async () => {
  if(!slug.communityID || !slug.inviterAddress) {
    showError('URL not valid.')
    isLoading = false
    return
  }

  community = await getCommunity(slug.communityID)
  inviter = await getUserByAddress(slug.inviterAddress)
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

      <div v-if="!isLoading && community && inviter" class="flex justify-between">
        <p><span :title="slug.inviterAddress" class="font-bold">{{ inviter.name ? `${inviter.name} (${shortString(slug.inviterAddress)})` : shortString(slug.inviterAddress) }}</span> invited you to join a community:</p>
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
