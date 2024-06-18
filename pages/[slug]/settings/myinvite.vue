<script setup lang="ts">

import {taskStore} from '~/stores/taskStore'

const { getLocalcommunityInfo } = $(aocommunityStore())
const { getAllInviteInfo, allInviteInfo } = $(taskStore())
const { address } = $(aoStore())


const taskForm = $ref({
  showTasknum: true,
})
function onSubmit() {
  console.log('Submitted form:', taskForm)
}
const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

let communityLoading = $ref(true)

let communities = $ref([])
let invitedByCid = $ref([])
let avas  = $ref({})


onMounted(async () => {
  try {
    await getAllInviteInfo()
    if (Array.isArray(allInviteInfo) && allInviteInfo.length !== 0) {
      communityLoading = false
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  await getAllInviteInfo()
  console.log('allInviteInfo = ' + JSON.stringify(allInviteInfo))
  for(let i = 0; i < allInviteInfo.length; ++i){
    if(allInviteInfo[i].invited === address){
      continue
    }
    if(!avas[allInviteInfo[i].communityId]){
      avas[allInviteInfo[i].communityId] = []
    }
    avas[allInviteInfo[i].communityId].push(allInviteInfo[i])
  }
  console.log('avas = ' + JSON.stringify(avas))
  const cIds = getUniqueCommunityIds()
  console.log('cIds = ' + cIds)
  for(let i = 0; i < cIds.length; ++i){
    const temp = await getLocalcommunityInfo(cIds[i])
    if(temp && temp != 'undefined'){
      console.log('get cInfo = ' + JSON.stringify(temp))
      const cInfo = {
        uuid: temp.uuid,
        logo: temp.logo,
        name: temp.name
      }
      communities.push(cInfo)
    }
  }
})

let inviteDetail = $ref(false)

function getUniqueCommunityIds(): string[] {
  const uniqueCommunityIds = new Set<string>();

  allInviteInfo.forEach(invite => {
    uniqueCommunityIds.add(invite.communityId);
  });

  return Array.from(uniqueCommunityIds);
}
const findInvitedById = (cId: string) => {
  inviteDetail = true
  invitedByCid = []
  console.log('cid = ' + cId)
  for (let index = 0; index < allInviteInfo.length; index++) {
    const temp = allInviteInfo[index]
    if(temp.userId === address && temp.communityId === cId){
      console.log('1111111111111111')
      invitedByCid.push(temp)
    }
  }
  // console.log('result = ' + JSON.stringify(invitedByCid))
}
</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard @submit.prevent="onSubmit">
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div v-for="(item, index) in communities" :key="index" class="flex items-center justify-between pr-[120px]">
        <div class="flex items-center mt-5">
          <UColorModeImage :src="item.logo" :light="light" :dark="dark" class="h-[70px] w-[70px] rounded-lg border" />
          <div class="ml-10 text-xl w-[100px]">{{ item.name }}</div>
          <div class="ml-10 text-xl">{{ $t('setting.invited') }}</div>
          <UAvatarGroup  :key="index" size="sm" :max="2" class="ml-10">
            <div v-for="(inv, index) in avas[item.uuid]">
              <UAvatar :src="inv.userAvatar" alt="benjamincanac" />
            </div>

<!--            <UAvatar :src="inv.userAvatar" alt="benjamincanac" />-->
          </UAvatarGroup>
        </div>
        <UButton color="white" class="flex-endtext-center" @click="findInvitedById(item.uuid)">{{ $t('setting.invite.check') }}</UButton>
      </div>
    </UCard>
    <UModal v-model="inviteDetail" :ui="{ width: w-full }">
      <div class="flex justify-center min-h-[300px] min-w-[600px] pt-10 pl-6">
<!--        <div class="mr-6">{{ $t('setting.invited') }}</div>-->
        <div class="border h-full pl-6 pb-2 pr-10">
          <div v-for="(inv, index) in invitedByCid" :key="index" class="flex items-center space-x-3">
            <UAvatar :src="inv.userAvatar" alt="Atinux" />
            <div>{{inv.userName}}</div>
            <div>{{inv.userId}}</div>
          </div>
        </div>
      </div>
    </UModal>
  </udashboardpanelcontent>
</template>
