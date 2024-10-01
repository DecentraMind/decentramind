<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import type { InviteCodeInfo, RelatedUserMap, Task } from '~/types'
import { arUrl, defaultUserAvatar, defaultCommunityLogo } from '~/utils/arAssets'
import { shortString } from '~/utils'

const { getInvitesByInviter } = useTaskStore()
const { address } = $(aoStore())
const { showError } = $(notificationStore())

let loading = $ref(true)

let communities = $ref<Record<string, {
  uuid: string
  logo: string
  name: string
}>>({})

let isDetailModalOpen = $ref(false)

type InviteDetail = InviteCodeInfo & {joinTime: number; inviteeAddress: string}

/** invites data of a community for detail modal */
let inviteDetails = $ref<InviteDetail[]>([])

/** invites data indexed by community uuid */
const invitedByMe  = $ref<Record<string, InviteCodeInfo[]>>({})

let invites = $ref<InviteCodeInfo[]>([])
let users = $ref<RelatedUserMap>()
let tasks = $ref<Record<string, Task>>({})

const tableColumns = $ref([
  { key: 'invitees', label: 'Invited User' },
  { key: 'community', label: 'Community' },
  { key: 'task', label: 'Task' },
  { key: 'joinTime', label: 'Join Time' }
])
onMounted( async () => {
  try {
    const { invites: myInviteCodeInfos, relatedUsers, relatedCommunities, relatedTasks } = await getInvitesByInviter(address)
    invites = myInviteCodeInfos
    users = relatedUsers
    communities = relatedCommunities
    tasks = relatedTasks
    console.log({invites, users, communities, tasks})
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
    
    const { communityUuid } = inviteInfo
    if(!invitedByMe[communityUuid]){
      invitedByMe[communityUuid] = []
    }

    const filteredInviteInfo = Object.entries(inviteInfo.invitees).reduce((acc, [inviteeAddress, {joinTime}]) => {
      if (inviteeAddress === address) {
        return acc
      }
      acc[inviteeAddress] = {joinTime}
      return acc
    }, {} as Record<string, {joinTime: number}>)

    invitedByMe[communityUuid].push({
      ...inviteInfo,
      invitees: filteredInviteInfo
    })
    communityIDs.push(communityUuid)
  }
  console.log({invitedByMe})

  console.log('communityIDs = ', communityIDs)

  loading = false
})

const findInvitedByCommunityID = (communityID: string) => {
  inviteDetails = []
  console.log('search for community ' + communityID)
  for (const inviteInfo of invites) {
    if (inviteInfo.communityUuid !== communityID) continue

    console.log('found user invited by me:', inviteInfo)

    for (const [inviteeAddress, {joinTime}] of Object.entries<{ joinTime: number }>(inviteInfo.invitees)) {
      if (inviteeAddress === address) {
        continue
      }
      inviteDetails.push({
        ...inviteInfo,
        joinTime,
        inviteeAddress,
      })
    }
  }
  isDetailModalOpen = true
  console.log({ communityID, inviteDetails })
}

</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}">
      <div v-if="loading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>

      <div v-if="!loading && !Object.keys(communities).length" class="flex">
        No user invited by me.
      </div>

      <div v-for="community in Object.values(communities)" :key="community.uuid">
        <div v-if="invitedByMe[community.uuid] && community.name" class="flex items-center justify-start mt-5">
          <div class="flex items-center">
            <img :src="community.logo ? arUrl(community.logo) : arUrl(defaultCommunityLogo)" class="h-[70px] w-[70px] rounded-lg border">
            <div class="ml-10 text-xl w-[160px] overflow-hidden">{{ community.name }}</div>
            <div class="ml-10 text-xl w-[200px] overflow-hidden text-nowrap">{{ $t('setting.invited') }}{{ invitedByMe[community.uuid].length }} </div>
          </div>
          <div class="flex">
            <UAvatarGroup v-if="users" size="sm" :max="2" class="ml-10">
              <template v-for="(invite, index) in invitedByMe[community.uuid]" :key="index">
                <template v-for="(inviteeAddress, inviteeIndex) in Object.keys(invite.invitees)" :key="inviteeAddress">
                  <ArAvatar
                    v-if="users[inviteeAddress] && inviteeIndex<2"
                    :src="users[inviteeAddress].avatar || defaultUserAvatar"
                    :alt="users[inviteeAddress].name || inviteeAddress"
                    :data-id="inviteeAddress"
                    class="-me-1.5 first:me-0"
                  />
                </template>
              </template>
            </UAvatarGroup>
            <UButton color="white" class="ml-4" @click="findInvitedByCommunityID(community.uuid)">{{ $t('setting.invite.check') }}</UButton>
          </div>
        </div>
      </div>
    </UCard>

    <UModal v-model="isDetailModalOpen">
      <UTable v-if="users" :rows="inviteDetails" :columns="tableColumns">
        <template #invitees-data="{ row }: {row: InviteDetail}">
          <div class="flex items-center gap-2">
            <ArAvatar :src="users[row.inviteeAddress]?.avatar || defaultUserAvatar" alt="user avatar" />
            <div class="w-fit" :title="row.inviteeAddress">{{ users[row.inviteeAddress]?.name || shortString(row.inviteeAddress) }}</div>
          </div>
        </template>
        <template #community-data="{ row }: {row: InviteDetail}">
          <div class="w-fit">{{ communities[row.communityUuid]?.name }}</div>
        </template>
        <template #task-data="{ row }: {row: InviteDetail}">
          <div class="w-fit">{{ row.taskPid ? tasks[row.taskPid]?.name : '/' }}</div>
        </template>
        <template #joinTime-data="{ row }: {row: InviteDetail}">
          <div class="w-fit">{{ new Date(row.joinTime).toLocaleString() }}</div>
        </template>
      </UTable>
    </UModal>
  </UDashboardPanelContent>
</template>
