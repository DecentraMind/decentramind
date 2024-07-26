<script setup lang="ts">
import {taskStore} from '~/stores/taskStore'
import type { InviteInfo } from '~/types'
import { arUrl, userAvatar, communityLogo } from '~/utils/arAssets'

const { getLocalCommunity } = $(aoCommunityStore())
const { getAllInviteInfo } = $(taskStore())
const { address } = $(aoStore())


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
let invites = $ref<InviteInfo[]>([])
const invitedByMe  = $ref<Record<string, InviteInfo[]>>({})

let allInviteInfo = $ref<InviteInfo[]>([])
onMounted( async () => {
  try {
    allInviteInfo = await getAllInviteInfo()
    loading = false
  } catch (error) {
    loading = false
    console.error('Error fetching data:', error)
  }

  // console.log('allInviteInfo = ' + JSON.stringify(allInviteInfo))

  for (const invite of allInviteInfo) {
    if(invite.invited === address || invite.userId === 'none'){
      continue
    }
    if(!invitedByMe[invite.communityId]){
      invitedByMe[invite.communityId] = []
    }
    invitedByMe[invite.communityId].push(invite)
  }
  console.log({invitedByMe})

  const communityIDs = Array.from(allInviteInfo.reduce((uniqueIDs, invite) => {
    if (!uniqueIDs.has(invite.communityId)) {
      uniqueIDs.add(invite.communityId)
    }
    return uniqueIDs
  }, new Set<string>))
  console.log('communityIDs = ', communityIDs)

  for (const communityID of communityIDs) {
    const temp = await getLocalCommunity(communityID)
    if(temp){
      const community = {
        uuid: temp.uuid,
        logo: temp.logo,
        name: temp.name
      }
      communities.push(community)
    }
  }
  console.log({communities})
})

let inviteDetail = $ref(false)

const findInvitedByCommunityID = (communityID: string) => {
  inviteDetail = true
  invites = []
  console.log('cid = ' + communityID)
  for (let index = 0; index < allInviteInfo.length; index++) {
    const temp = allInviteInfo[index]
    if(temp.userId === address && temp.communityId === communityID){
      console.log('1111111111111111')
      invites.push(temp)
    }
  }
  console.log({ communityID, invites })
}

</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}" @submit.prevent="onSubmit">
      <div v-if="loading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>

      <div v-for="(community, index) in communities" :key="index" class="flex items-center justify-between pr-[120px]">
        <div v-if="invitedByMe[community.uuid] && community.name" class="flex items-center mt-5">
          <UColorModeImage :src="community.logo || arUrl(communityLogo)" :light="light" :dark="dark" class="h-[70px] w-[70px] rounded-lg border" />
          <div class="ml-10 text-xl w-[100px]">{{ community.name }}</div>
          <div class="ml-10 text-xl">{{ $t('setting.invited') }}{{ invitedByMe[community.uuid].length }} </div>
          <UAvatarGroup :key="index" size="sm" :max="2" class="ml-10">
            <div v-for="(invite, index) in invitedByMe[community.uuid]" :key="index">
              <UAvatar :src="invite.userInfo?.avatar || arUrl(userAvatar)" :alt="invite.userInfo?.name || invite.userId" />
            </div>
          </UAvatarGroup>
          <UButton color="white" class="flex-endtext-center" @click="findInvitedByCommunityID(community.uuid)">{{ $t('setting.invite.check') }}</UButton>
        </div>
      </div>
    </UCard>

    <UModal v-model="inviteDetail" :ui="{ width: w-full }">
      <div class="flex justify-center min-h-[300px] min-w-[600px] pt-10 pl-6">
        <div class="border h-full pl-6 pb-2 pr-10">
          <div v-for="(invite, index) in invites" :key="index" class="flex items-center space-x-3">
            <UAvatar :src="invite.userAvatar" alt="user avatar" />
            <div>{{ invite.userName }}</div>
            <div>{{ invite.invited }}</div>
          </div>
        </div>
      </div>
    </UModal>
  </UDashboardPanelContent>
</template>
