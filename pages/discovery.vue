<script setup lang="ts">
import { getCommunityBannerUrl, defaultCommunityLogo, shortString } from '~/utils'

const { address, doLogout, isLoginModalOpen } = $(aoStore())

const { communityList, isCommunityListLoading, communityListError, twitterVouched, loadCommunityList, joinCommunity, setCurrentCommunityUuid } = $(communityStore())
const { userInfo, isLoading: isUserInfoLoading, error: userInfoError, refetchUserInfo } = $(useUserInfo())

const { showError, showSuccess } = $(notificationStore())

const router = useRouter()

let vouchModalOpen = $ref(false)

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
  setCurrentCommunityUuid(undefined)

  try {
    if (!twitterVouched) {
      vouchModalOpen = true
    }
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

const logout = async() => {
  await doLogout()

  router.push('/')
}

let joinLoading = $ref(false)

const joinToCommunity = async(uuid: string, name: string) => {
  if (!twitterVouched) {
    vouchModalOpen = true
    return
  }
  joinLoading = true
  try {
    await joinCommunity(uuid)
    showSuccess(`Joined ${name}!`)
    await loadCommunityList(address)
    router.push('/community/' + uuid)
  } catch (error) {
    showError('Failed to join.', error as Error)
  } finally {
    joinLoading = false
  }

}

const refetch = async () => {
  await Promise.race([loadCommunityList(address), refetchUserInfo()])
}
</script>

<template>
  <div class="min-h-screen w-full relative">
    <UDashboardNavbar title="Explore">
      <template #right>
        <!--<UButton @click="test">test</UButton>-->
        <UBadge color="white">
          <template v-if="address">
            <NuxtLink :to="'/dashboard/quests'">
              <UButton color="white" variant="ghost">{{ $t('wallet.Dashboard') }}</UButton>
            </NuxtLink>
            <span>|</span>
            <UPopover :popper="{ placement: 'bottom-end' }">
              <UButton variant="ghost" color="white" block>
                {{ userInfo?.name || shortString(address) }}
              </UButton>
              <template #panel>
                <UButton color="red" @click="logout">
                  Disconnect
                </UButton>
              </template>
            </UPopover>
          </template>
          <UButton v-else variant="ghost" color="white" @click="isLoginModalOpen = true">
            Connect Wallet
          </UButton>
        </UBadge>
        <UDropdown :items="translate" mode="hover" :popper="{ placement: 'bottom-start' }" class="hidden">
          <UButton color="white" label="English" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
        <!--<UColorModeButton />-->
      </template>
    </UDashboardNavbar>

    <div class="w-full overflow-y-auto h-[calc(100vh-var(--header-height))] pt-5 pb-20 px-10 bg-grid">
      <div v-if="sortedCommunities.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
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
              wrapper: 'ring-0 rounded-none',
              base: 'ease-in-out'
            }
          }"
          @click="community.isJoined && $router.push('/community/' + community.uuid)"
        >
          <template #title>
            <div class="flex items-center">
              <ArAvatar
                :src="community.logo || defaultCommunityLogo"
                :alt="community.name"
              />
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
                  @click="() => joinToCommunity(community.uuid, community.name)"
                >
                  {{ $t('community.list.join') }}
                </UButton>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
      <div v-else class="flex-col-center h-full">
        <div v-if="isCommunityListLoading || isUserInfoLoading">
          <UIcon name="svg-spinners:blocks-scale" dynamic class="w-16 h-16 opacity-50" />
        </div>
        <UCard v-else>
          <div class="flex-center text-center whitespace-pre-line text-xl text-gray-500">
            <div v-if="communityListError || userInfoError" class="flex-col-center gap-y-4">
              <p>Failed to load data.</p>
              <UButton variant="soft" class="block" @click="refetch()">Retry</UButton>
            </div>
            <p v-else>Nothing here，please create the first community.</p>
          </div>
        </UCard>
      </div>
    </div>
    <UModal v-model="vouchModalOpen">
      <div class="h-[200px] flex flex-col items-center justify-center">
        <span class="text-xl">Not Vouched</span>
        <div>
          <NuxtLink to="https://g8way.io/y77FlCnWP7xTxqoMYjc5_ojjeYpkSkjZEzB4e34We5g" target="_blank">
            <UButton color="white" class="mt-10">Get Vouched</UButton>
          </NuxtLink>
        </div>
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
