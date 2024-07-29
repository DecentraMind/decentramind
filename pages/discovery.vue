<script setup lang="ts">
import { getCommunityBannerUrl, arUrl, communityLogo } from '~/utils/arAssets'

const { address, doLogout, doLogin } = $(aoStore())

const { communityList, vouch, linkTwitter, getCommunityList, joinCommunity } = $(aoCommunityStore())

const { showError } = $(notificationStore())

const toast = useToast()
const router = useRouter()

let linkToTwitter = $ref(false)

let communityLoading = $ref(true)
watch(communityList, async () => {
  if(communityList.length) {
    communityLoading = false
  }
})

const sortedCommunities = $computed(() => {
  // TODO if buildnum of a, b are equal, sort by create time (community.timestamp)

  return communityList.sort((a, b) => {
    return a.buildnum <= b.buildnum ? 1 : -1
  })
})

onMounted(async () => {
  if (!address) {
    router.push('/')
  }

  try {
    await getVouchInfo()
  } catch (error) {
    const message = error instanceof Error ? error.message : error
    showError('Error fetching data:' + message)
    console.error('Error fetching data:', message)
  }
})

const translate = [
  [
  //   {
  //   label: '简体中文',
  // },
  {
    label: 'English'
  }]
]

const Logout = async() => {
  await doLogout()
  router.push('/')
}

let joinLoading = $ref(false)

const joinToCommunity = async(uuid: any) => {
  if (!linkTwitter) {
    linkToTwitter = true
    return
  }
  joinLoading = true
  try {
    const invite = 'none'
    await joinCommunity(uuid, invite)
    toast.add({ title: 'joined success' })
    // 查找uuid匹配的元素并更新isJoined属性
    await getCommunityList()
    joinLoading = false

    // joinLoading = true
    console.log('communityJoin 操作成功')
  } catch (error) {
    alert('communityJoin 操作失败')
  } finally {
    joinLoading = false
  }

}
const getVouchInfo = async () => {
  const res = await vouch()
  if (!res) {
    linkToTwitter = true
  }
}
const test = async() => {
  const res = await vouch()
  console.log('-test')
  console
}
</script>

<template>
  <div class="min-h-screen w-full relative">
    <UDashboardNavbar title="Explore">
      <template #right>
        <!--<UButton @click="test">test</UButton>-->
        <UBadge color="white">
          <NuxtLink :to="'/dashboard/quests'">
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

    <div class="w-full overflow-y-auto h-[calc(100%-var(--header-height))] p-10 pb-20 bg-grid">
      <div v-if="!communityList.length && communityLoading" class="absolute top-0 left-0 w-full h-screen flex justify-center items-center">
        <UIcon name="svg-spinners:blocks-scale" dynamic class="w-16 h-16 opacity-50" />
      </div>

      <div class=" mx-auto w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
          <UBlogPost
            v-for="community in sortedCommunities"
            :key="community.uuid"
            :image="getCommunityBannerUrl(community.banner)"
            class="mb-2"
            :ui="{
              wrapper: 'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
              container: 'group-hover:bg-dot pt-4',
              inner: 'flex-1 px-4 overflow-hidden',
              image: {
                wrapper: 'ring-0 rounded-none'
              }
            }"
            @click="community.isJoined && $router.push('/community/' + community.uuid)"
          >
            <template #title>
              <div class="flex items-center">
                <UAvatar :src="community.logo || arUrl(communityLogo)" :alt="community.name" class="ring-1 ring-gray-100" />
                <div class="mx-3 text-xl">
                  {{ community.name }}
                </div>
              </div>
            </template>
            <template #description>
              <div class="flex flex-col space-y-2 pb-4">
                <div class="flex flex-col min-h-[50px]">
                  <div class="text-lg font-semibold">
                    builder: {{ community.buildnum }}
                  </div>
                  <div class="text-base overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {{ community.desc }}
                  </div>
                </div>
                <div class="self-end">
                  <UButton
                    v-if="community.isJoined"
                    class="w-[65px] text-slate-400"
                    size="md"
                    color="white"
                    variant="ghost"
                  >
                    {{ $t('community.list.isjoin') }}
                  </UButton>
                  <!-- Show UButton Component -->
                  <UButton
                    v-else
                    class="self-end right-0 w-[65px] ring-gray-200 hover:ring-gray-400"
                    block
                    :ui="{ font: 'font-medium' }"
                    color="white"
                    size="md"
                    variant="outline"
                    @click="() => joinToCommunity(community.uuid)"
                  >
                    {{ $t('community.list.join') }}
                  </UButton>
                </div>
              </div>
            </template>
          </UBlogPost>
        </div>
      </div>
    </div>
    <UModal v-model="linkToTwitter">
      <div class="h-[200px] flex flex-col items-center justify-center">
        <Text class="text-2xl">Not Vouched</Text>
        <NuxtLink to="https://vouch-twitter.g8way.io/" target="_blank" rel="noopener noreferrer">
          <UButton color="white" class="mt-10">Get Vouched</UButton>
        </NuxtLink>
      </div>
    </UModal>
    <UModal v-model="joinLoading">
      <div class="h-[200px] flex flex-col items-center justify-center">
        <div>Join...</div>
        <UIcon name="svg-spinners:12-dots-scale-rotate" />
      </div>
    </UModal>
  </div>
</template>
