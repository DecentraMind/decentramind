<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import type { InviteCodeInfo, RelatedUserMap } from '~/types'
import { arUrl, defaultUserAvatar, defaultCommunityLogo } from '~/utils/arAssets'
import { shortString } from '~/utils'

const { getLocalCommunity } = $(communityStore())
const { getInvitesByInviter } = useTaskStore()
const { address } = $(aoStore())
const { showError } = $(notificationStore())

let loading = $ref(true)

const communities = $ref<{
  uuid: string
  logo: string
  name: string
}[]>([])

let isDetailModalOpen = $ref(false)
/** invites data of a community for detail modal */
let inviteDetails = $ref<InviteCodeInfo[]>([])

const invitedByMe  = $ref<Record<string, InviteCodeInfo[]>>({})

let invites = $ref<InviteCodeInfo[]>([])
let users = $ref<RelatedUserMap>()
onMounted( async () => {
  try {
    const {invites: allInviteInfo, relatedUsers} = await getInvitesByInviter(address)
    invites = allInviteInfo
    users = relatedUsers
  } catch (error) {
    const message = error instanceof Error ? error.message : error
    showError('Error fetching data:' + message)
    loading = false
    return
  }

  const communityIDs = []
  for (const inviteInfo of invites) {
    if(inviteInfo.inviterAddress !== address){
      continue
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [invitee, _] of Object.entries<{ joinTime: number }>(inviteInfo.invitees)) {
      if(invitee === address){
        continue
      }
      const { communityUuid } = inviteInfo
      if(!invitedByMe[communityUuid]){
        invitedByMe[communityUuid] = []
      }
      invitedByMe[communityUuid].push(inviteInfo)
      communityIDs.push(communityUuid)
    }
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
  for (const inviteInfo of invites) {
    if(inviteInfo.inviterAddress === address && inviteInfo.communityUuid === communityID){
      console.log('found user invited by me:', inviteInfo)
      inviteDetails.push(inviteInfo)
    }
  }
  console.log({ communityID, invites: inviteDetails })
}

</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}">
      <div v-if="loading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>

      <div v-if="!loading && !communities.length" class="flex">
        No user invited by me.
      </div>

      <div v-for="community in communities" :key="community.uuid">
        <div v-if="invitedByMe[community.uuid] && community.name" class="flex items-center justify-start mt-5">
          <div class="flex items-center">
            <img :src="arUrl(community.logo) || arUrl(defaultCommunityLogo)" class="h-[70px] w-[70px] rounded-lg border">
            <div class="ml-10 text-xl w-[160px] overflow-hidden">{{ community.name }}</div>
            <div class="ml-20 text-xl w-[250px] overflow-hidden text-nowrap">{{ $t('setting.invited') }}{{ invitedByMe[community.uuid].length }} </div>
          </div>
          <div class="flex">
            <UAvatarGroup v-if="users" size="sm" :max="2" class="ml-10">
              <div v-for="(invite, index) in invitedByMe[community.uuid]" :key="index">
                <div v-for="(_, inviteeAddress) in invite.invitees" :key="inviteeAddress">
                  <ArAvatar v-if="users[inviteeAddress]" :src="users[inviteeAddress].avatar || defaultUserAvatar" :alt="users[inviteeAddress].name || inviteeAddress" />
                </div>
              </div>
            </UAvatarGroup>
            <UButton color="white" class="ml-4" @click="findInvitedByCommunityID(community.uuid)">{{ $t('setting.invite.check') }}</UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UModal v-model="isDetailModalOpen">
      <div class="flex justify-center min-h-[300px] pt-10 px-6">
        <div v-if="users" class="border h-full px-2 py-2 mb-2">
          <div v-for="(invite, index) in inviteDetails" :key="index" class="flex items-center space-x-3">
            <div v-for="(_, inviteeAddress) in invite.invitees" :key="inviteeAddress">
              <UAvatar :hash="users[inviteeAddress]?.avatar || defaultUserAvatar" alt="user avatar" />
              <div class="w-fit">{{ users[inviteeAddress]?.name || shortString(inviteeAddress) }}</div>
              <div class="w-90">{{ inviteeAddress }}</div>
            </div>
          </div>
        </div>
      </div>
    </UModal>
  </UDashboardPanelContent>
</template>
