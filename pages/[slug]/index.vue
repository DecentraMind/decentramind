<script setup lang="ts">
const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const { communityList, userInfo, updataCommunity, getInfo, getCommunitylist, joinCommunity, getLocalcommunityInfo } = $(aocommunityStore())
const { gettoken } = $(linktwitter())

const toast = useToast()
const route = useRoute()
const router = useRouter();
const slug = $computed(() => route.params.slug)

let communityLoading = $ref(true)
let LinktoTwitter = $ref(false)

let result = $ref()

const getCommunity = async () => {
  result = await getCommunitylist()
  communityLoading = false
}

const communityJoin = async (uuid: any) => {
  if(!userInfo[0].twitter || userInfo[0].twitter !== 'Success'){
    LinktoTwitter = true
  } else {
    const invite = "none"
    await joinCommunity(uuid, invite)
    toast.add({ title: 'joined success' })
    await getCommunity()
  }
}

onMounted(async () => {
  try {
    if (Array.isArray(communityList) && communityList.length !== 0) {
      communityLoading = false
    }
    await getInfo()
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

const translate = [
  [{
    label: '简体中文',
  }, {
    label: 'English'
  }]
]
const { t, locale , defaultLocale } = useI18n()

const Logout = async() => {
  await doLogout()
  router.push('/')
}

let joinLoading = $ref(false)

const jointocommunity = async(uuid: any) => {
  joinLoading = true
  try {
    if(!userInfo[0].twitter || userInfo[0].twitter !== 'Success'){
      LinktoTwitter = true
    } else {
      const invite = "none"
      await joinCommunity(uuid, invite)
      toast.add({ title: 'joined success' })
      // 查找uuid匹配的元素并更新isJoined属性
      await updataCommunity(uuid, "join")
      joinLoading = false
    }
    joinLoading = true
    // 如果 communityJoin 没有抛出异常，则认为操作成功
    console.log('communityJoin 操作成功');
  } catch (error) {
    // 如果 communityJoin 抛出了异常，则在这里处理异常
    alert('communityJoin 操作失败:', error);
    // 可以在这里做一些失败处理，比如显示错误信息、重试等
  } finally {
    // 无论是否成功，都在最后将 loading 状态设为 false
    joinLoading = false;
  }

}
const test = ()=> {
  const a = "06263a46-121b-4027-be33-adbe269ccbd8"
  updataCommunity(a, "join")
  console.log(communityList)
}
</script>

<template>
  <div class="min-h-screen bg-red-1900 w-full">
    <UDashboardNavbar title="Explore">
      <template #right>
        <UButton @click="test">test</UButton>
        <UBadge color="white">
          <NuxtLink :to="`/${slug}/mytask`">
            <UButton color="white" variant="ghost">{{ $t('wallet.Dashboard') }}</UButton>
          </NuxtLink>
          |
          <UPopover v-if="address" :popper="{ placement: 'bottom-end' }">
            <UButton variant="ghost" color="white" block>
              {{ shortAddress(address) }}
            </UButton>
            <template #panel>
              <UButton color="red" @click="Logout">
                Disconnect
              </UButton>
            </template>
          </UPopover>
          <UButton v-else variant="ghost" color="white" @click="doLogin">
            Connect Wallet
          </UButton>
        </UBadge>
        <UDropdown :items="translate" mode="hover" :popper="{ placement: 'bottom-start' }">
          <UButton color="white" label="English" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
        <!--<UColorModeButton />-->
      </template>
    </UDashboardNavbar>
    <div class=" bg-red-1900 w-full overflow-y-auto h-[90%] pl-10 pr-10 pt-3">
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:blocks-scale" class="mt-80 w-[250px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div class=" mx-auto w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          <UBlogPost v-for="community in communityList" :key="community.uuid" :image="`/task/${community.banner}.jpg`" :description="community.decs">
            <template #title>
              <div class="flex items-center">
                <UAvatar :src="community.logo" alt="Avatar" size="md" />
                <div class="mx-3 text-2xl">
                  {{ community.name }}
                </div>
              </div>
            </template>
            <template #description>
              <div class="flex flex-col space-y-2">
                <div class="flex flex-col min-h-[50px]">
                  <div class="text-2xl">
                    builder: {{ community.buildnum }}
                  </div>
                  <div class="text-2xl overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {{ community.desc }}
                  </div>
                </div>
                <div>
                  <template v-if="community.isJoined">
                    <!-- Show text "Added" -->
                    <UButton class="absolute right-0 w-[65px]" color="white" variant="outline" disabled>
                      {{ $t('community.list.isjoin') }}
                    </UButton>
                  </template>
                  <template v-else>
                    <!-- Show UButton Component -->
                    <UButton 
                      class="absolute right-0 w-[60px]" 
                      block 
                      :ui="{ font: 'font-medium'}" 
                      color="white" 
                      variant="outline" 
                      @click="() => jointocommunity(community.uuid)"
                    >
                      {{ $t('community.list.join') }}
                    </UButton>
                  </template>
                </div>
              </div>
            </template>
          </UBlogPost>
        </div>
      </div>
    </div>
    <UModal v-model="LinktoTwitter">
      <div class="h-[200px] flex flex-col items-center justify-center">
        <Text class="text-2xl">No link to twitter</Text>
        <NuxtLink :to="`/${slug}/settings`">
          <UButton class="mt-10">go to link</UButton>
        </NuxtLink>
      </div>
    </UModal>
    <UModal v-model="joinLoading">
      <div class="h-[200px] flex flex-col items-center justify-center">
        <Text class="text-2xl">Join...</Text>
        <UIcon name="svg-spinners:12-dots-scale-rotate" />
      </div>
    </UModal>
  </div>
</template>
