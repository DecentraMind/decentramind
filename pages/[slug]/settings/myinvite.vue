<script setup lang="ts">

import {taskStore} from '~/stores/taskStore'

const { userInfo, communityUser, getCommunityuser, joincommunityList, getCommunitylist } = $(aocommunityStore())
const { getAllInviteInfo, allInviteInfo } = $(taskStore())
const { address } = $(aoStore())
const state = $ref<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})


async function onChange() {
  // Do something with data
  console.log(state)
}

const communityForm = $ref({
  showAll: true,
  communityName: '',
  showCommunitynum: true,
})


const taskForm = $ref({
  showTasknum: true,
})
function onSubmit() {
  console.log('Submitted form:', taskForm)
}
const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'



let communityLoading = $ref(true)

let result = $ref()
const getCommunity = async () => {
  result = await getCommunitylist()
  // console.log('getCommunitylist = ' + JSON.stringify(result))
  communityLoading = false
}

onMounted(async () => {
  try {
    if (Array.isArray(joincommunityList) && joincommunityList.length !== 0) {
      communityLoading = false
    }
    // console.log(JSON.stringify(joincommunityList))
    await getCommunity()
    // const res = getCommunityuser(joincommunityList[0].uuid)
    console.log('getCommunityuser = ' + JSON.stringify(communityUser))
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  await getAllInviteInfo()
  console.log('allInviteInfo = ' + allInviteInfo)
  console.log('userInfo = ' + userInfo)
  console.log('joincommunityList = ' + JSON.stringify(joincommunityList))
});

let inviteDetail = $ref(false)
const detail = () => {
  inviteDetail = true
}


type InviteData = {
  invited: string;
  communityId: string;
  inviteTime: string;
  userId: string;
};

type GroupedData = {
  [communityId: string]: InviteData[];
};

function groupByCommunityId(data: InviteData[]): GroupedData {
  return data.reduce((acc, item) => {
    if (!acc[item.communityId]) {
      acc[item.communityId] = [];
    }
    acc[item.communityId].push(item);
    return acc;
  }, {} as GroupedData);
}
const findInvitedById = () => {
  let result = []
  for (let index = 0; index < allInviteInfo.length; index++) {
    const temp = allInviteInfo[index]
    if(temp.invited === address){
      result.push(temp)
    }
  }
  const groupedData = groupByCommunityId(result);
  console.log('result = ' + JSON.stringify(groupedData))
}
</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard @submit.prevent="onSubmit">
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div v-for="(item, index) in joincommunityList" :key="index" class="flex items-center justify-between pr-[120px]">
        <div class="flex items-center mt-5">
          <UColorModeImage :src="item.logo" :light="light" :dark="dark" class="h-[70px] w-[70px] rounded-lg border" />
          <div class="ml-10 text-xl w-[100px]">{{ item.name }}</div>
          <div class="ml-10 text-xl">{{ $t('setting.invited') }}</div>
          <UAvatarGroup size="sm" :max="2" class="ml-10">
            <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="benjamincanac" />
            <UAvatar src="https://avatars.githubusercontent.com/u/904724?v=4" alt="Atinux" />
            <UAvatar src="https://avatars.githubusercontent.com/u/7547335?v=4" alt="smarroufin" />
          </UAvatarGroup>
        </div>
        <UButton class="flex-end text-xl text-center" @click="detail">{{ $t('setting.invite.check') }}</UButton>
      </div>
    </UCard>
    <UModal v-model="inviteDetail" :ui="{ width: w-full }">
      <div class="flex min-h-[300px] min-w-[600px] pt-10 pl-6">
        <div class="mr-6">{{ $t('setting.invited') }}</div>
        <div class="border h-full pl-6 pb-2 pr-10">
          <div class="flex items-center space-x-3">
            <UAvatar src="https://avatars.githubusercontent.com/u/904724?v=4" alt="Atinux" />
            <Text>0x9A....775c37897Csad89798798SD</Text>
          </div>
        </div>
      </div>
    </UModal>
  </udashboardpanelcontent>
</template>
