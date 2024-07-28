<script setup lang="ts">
import {taskStore} from '~/stores/taskStore'
import type { InviteInfo } from '~/types'
import { arUrl, userAvatar, communityLogo } from '~/utils/arAssets'
import { shortString } from '~/utils/util'

const { getLocalCommunity } = $(aoCommunityStore())
const { getAllInviteInfo } = $(taskStore())
const { address } = $(aoStore())
const { showError } = $(notificationStore())


const taskForm = $ref({
  showTasknum: true,
})
function onSubmit() {
  console.log('Submitted form:', taskForm)
}
const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

let loading = $ref(true)

const communities = $ref<{
  uuid: string
  logo: string
  name: string
}[]>([])

let isDetailModalOpen = $ref(false)
/** invites data of a community for detail modal */
let inviteDetails = $ref<InviteInfo[]>([])

const invitedByMe  = $ref<Record<string, InviteInfo[]>>({})

let allInviteInfo = $ref<InviteInfo[]>([])
onMounted( async () => {
  try {
    allInviteInfo = await getAllInviteInfo()
  } catch (error) {
    const message = error instanceof Error ? error.message : error
    showError('Error fetching data:' + message)
    loading = false
    return
  }

  // console.log('allInviteInfo = ' + JSON.stringify(allInviteInfo))

  const communityIDs = []
  for (const inviteInfo of allInviteInfo) {
    if(inviteInfo.userId !== address || inviteInfo.invited === address || inviteInfo.userId === 'none'){
      continue
    }
    const { communityId } = inviteInfo
    if(!invitedByMe[communityId]){
      invitedByMe[communityId] = []
    }
    invitedByMe[communityId].push(inviteInfo)
    communityIDs.push(communityId)
  }
  console.log({invitedByMe})

  console.log('communityIDs = ', communityIDs)

  for (const communityID of communityIDs) {
    const community = await getLocalCommunity(communityID)
    if(community){
      communities.push({
        uuid: community.uuid,
        logo: community.logo,
        name: community.name
      })
    }
  }
  console.log({communities})
  loading = false
})

const findInvitedByCommunityID = (communityID: string) => {
  isDetailModalOpen = true
  inviteDetails = []
  console.log('search for community ' + communityID)
  for (const inviteInfo of allInviteInfo) {
    if(inviteInfo.userId === address && inviteInfo.communityId === communityID){
      console.log('found user invited by me:', inviteInfo)
      inviteDetails.push(inviteInfo)
    }
  }
  console.log({ communityID, invites: inviteDetails })
}

</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}" @submit.prevent="onSubmit">
      <div v-if="loading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>

      <div v-if="!loading && !communities.length" class="flex">
        No user invited by me.
      </div>

      <div v-for="community in communities" :key="community.uuid">
        <div v-if="invitedByMe[community.uuid] && community.name" class="flex items-center justify-start mt-5">
          <div class="flex items-center">
            <UColorModeImage :src="community.logo || arUrl(communityLogo)" :light="light" :dark="dark" class="h-[70px] w-[70px] rounded-lg border" />
            <div class="ml-10 text-xl w-[160px] overflow-hidden">{{ community.name }}</div>
            <div class="ml-20 text-xl w-[250px] overflow-hidden text-nowrap">{{ $t('setting.invited') }}{{ invitedByMe[community.uuid].length }} </div>
          </div>
          <div class="flex">
            <UAvatarGroup size="sm" :max="2" class="ml-10">
              <div v-for="(invite, index) in invitedByMe[community.uuid]" :key="index">
                <UAvatar :src="invite.userInfo?.[0].avatar || arUrl(userAvatar)" :alt="invite.userInfo?.[0].name || invite.userId" />
              </div>
            </UAvatarGroup>
            <UButton color="white" class="ml-4" @click="findInvitedByCommunityID(community.uuid)">{{ $t('setting.invite.check') }}</UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UModal v-model="isDetailModalOpen" :ui="{ width: w-full }">
      <div class="flex justify-center min-h-[300px] pt-10 px-6">
        <div class="border h-full px-2 py-2 mb-2">
          <div v-for="(invite, index) in inviteDetails" :key="index" class="flex items-center space-x-3">
            <UAvatar :src="invite.userInfo?.[0].avatar || arUrl(userAvatar)" alt="user avatar" />
            <div class="w-fit">{{ invite.userInfo?.[0].name }}</div>
            <div class="w-90">{{ invite.invited }}</div>
          </div>
        </div>
      </div>
    </UModal>
  </UDashboardPanelContent>
</template>
