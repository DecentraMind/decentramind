<script setup lang="ts">
import { arUrl, defaultCommunityLogo, defaultUserAvatar, exploreLogo } from '~/utils/arAssets'
import { cn, delay } from '~/utils/util'
import CommunitySettingForm from '~/components/community/CommunitySettingForm.vue'
import LoginModal from '~/components/users/LoginModal.vue'
import VouchModal from '~/components/users/VouchModal.vue'
import { useJoinedCommunitiesQuery } from '~/composables/community/communityQuery'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { useUserInfo } from '~/composables/useUserInfo'
import TopNav from '~/components/TopNav.vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { JoinedCommunity } from '~/types'
import { getJoinedCommunities } from '~/utils/community/community'

const router = useRouter()

const selectModal = $ref<0 | 1 | 2>(0)

const { checkIsActiveWallet, addSwitchListener } = $(aoStore())
let { address } = $(aoStore())
const { updateVouchData, twitterVouched, redirectUrlAfterLogin } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen, isVouchModalOpen } = $(aoStore())
const { currentUuid } = $(communityStore())
const { userInfo, isLoading: isUserInfoLoading, error: userInfoError, refetchUserInfo } = $(useUserInfo())

let joinedCommunities = $ref<JoinedCommunity[]>([])
const { isLoading, error: communityListError, data } = useJoinedCommunitiesQuery({
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
  staleTime: 0,
  refetchOnReconnect: 'always'
})

watch(() => data.value, (newData) => {
  console.log('new joinedCommunities', newData)
  if (newData) {
    joinedCommunities = newData
  }
}, { immediate: true })


const queryClient = useQueryClient()
const refetchJoinedCommunities = async () => {
  const newData = await queryClient.fetchQuery({
    queryKey: ['community', 'joinedCommunities', address],
    queryFn: () => getJoinedCommunities(address),
    staleTime: 0
  })
  joinedCommunities = newData || []
  console.log('new joinedCommunities', joinedCommunities.length)
}

const isCreateModalOpen = $ref(false)
onMounted(async () => {
  try {
    // if not address, show login modal
    if (!address) {
      if (window.arweaveWallet) {
        await window.arweaveWallet.disconnect()
      }
    } else {
      if (!await checkIsActiveWallet()) {
        console.log('not active wallet')
        address = ''
        isLoginModalOpen = true
        return
      }
      addSwitchListener()

      await updateVouchData()

      if (!twitterVouched) {
        // TODO remove vouch modal from this layout if all users are vouched
        isVouchModalOpen = true
        return
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

const refetch = async () => {
  try {
    await refetchJoinedCommunities()
    await delay(1000)
    await refetchUserInfo()
  } catch (error) {
    console.error('Error refetching data:', error)
  }
}

const afterLogin = async () => {
  console.log('after login triggered')
  console.log('address', address)
  console.log('communityListError', communityListError)
  console.log('userInfoError', userInfoError)
  if (redirectUrlAfterLogin) {
    console.log('redirect after login:', redirectUrlAfterLogin)
    if (typeof redirectUrlAfterLogin === 'string') {
      router.push(redirectUrlAfterLogin)
    } else {
      if (redirectUrlAfterLogin.path === router.currentRoute.value.path) {
        redirectUrlAfterLogin.force = true
        router.push(redirectUrlAfterLogin)
      } else {
        router.push(redirectUrlAfterLogin)
      }
    }

    await refetch()
  } else {
    reloadNuxtApp()
  }
}
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel class="w-12 sm:w-16" :ui="{border:'lg:w-16 border-b-0'}">
      <UDashboardSidebar
        :ui="{
          wrapper: 'bg-gray-100 pt-0',
          container: 'pt-0 gap-y-0',
          body: 'px-0 py-0 gap-y-0',
          header: 'flex-center px-0 h-[calc(var(--header-height)-1px)]',
          footer: 'px-0 gap-x-0 justify-center'
        }"
      >
        <template #header>
          <UPopover
            mode="hover"
            :popper="{ arrow: true, placement: 'right', strategy: 'fixed', offsetDistance: 0 }"
            :ui="{
              wrapper: 'flex-center',
              container: 'w-fit',
              background: 'bg-gray-50',
              base: 'font-bold py-0.5',
              ring: 'ring-0',
              arrow: {
                base: 'before:z-50',
                ring: 'before:ring-0 before:border-b before:border-l before:border-white',
                background: 'before:bg-gray-50',
                shadow: 'before:shadow-none',
                placemennt: '!top-0 !left-1'
              }
            }"
          >
            <UButton
              to="/discovery"
              variant="ghost"
              class="w-full px-1 py-0 hover:bg-transparent border-0 rounded-full text-white transition duration-300 ease-in-out transform"
            >
              <img :src="arUrl(exploreLogo)" class="h-full w-full">
            </UButton>
            <template #panel>
              <div class="flex-center px-2 py-1">
                <span>Explore</span>
              </div>
            </template>
          </UPopover>
        </template>

        <UDivider />

        <div class="overflow-y-auto h-full py-2 px-1 sm:px-2 pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
          <div
            v-for="community in joinedCommunities"
            :key="community.uuid"
          >
            <UPopover
              mode="hover"
              :popper="{ arrow: true, placement: 'right', strategy: 'fixed', offsetDistance: 8 }"
              :ui="{
                container: 'w-fit !top-0',
                background: 'bg-gray-50',
                base: 'font-bold py-0.5',
                ring: 'ring-0',
                arrow: {
                  ring: 'before:ring-0 before:border-b before:border-l before:border-white',
                  background: 'before:bg-gray-50 before:z-50',
                  shadow: 'before:shadow-none',
                  placemennt: '!top-0 !left-1'
                }
              }"
            >
              <UButton
                variant="link"
                :to="`/community/${community.uuid}`"
                class="group w-full block p-0 mt-1 relative ring-0"
              >
                <!-- indicator of current community -->
                <div
                  :class="cn(
                    'transition-all ease-in-out duration-500 rounded-sm bg-gray-900 absolute left-[-6px]',
                    'w-0 group-hover:w-1 h-3 sm:h-4 top-4 sm:top-4 bg-opacity-0 group-hover:bg-opacity-60',
                    {
                      'w-1 h-6 sm:h-6 top-2 sm:top-3 bg-opacity-80': community.uuid === currentUuid
                    }
                  )"
                />

                <CuteRadius>
                  <img
                    :src="community.logo ? arUrl(community.logo) : arUrl(defaultCommunityLogo)"
                    class="w-full h-full object-cover bg-white"
                  >
                </CuteRadius>
              </UButton>
              <template #panel>
                <div class="flex-center px-2 py-1">
                  <span>{{ community.name }}</span>
                </div>
              </template>
            </UPopover>
          </div>


          <UButton
            v-if="userInfo && address"
            class="w-full mt-2 aspect-square"
            variant="soft"
            :ui="{
              variant: {
                soft: 'bg-{color}-100 hover:brightness-95'
              }
            }"
            @click="selectModal=0; isCreateModalOpen = true"
          >
            <UIcon name="heroicons:plus" class="h-full w-full" />
          </UButton>
        </div>

        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <!-- <UserDropdownMini /> -->
          <UPopover mode="hover" :to="userInfo && address ? '/settings' : '#'" class="w-10 h-12 sm:w-12 sm:h-14">
            <UButton variant="ghost" class="px-0 py-2" @click="userInfo && address ? router.push('/settings') : isLoginModalOpen = true">
              <template v-if="!userInfo || !address">
                <ArAvatar :src="defaultUserAvatar" alt="User Settings" class="w-full h-full" avatar-class="w-10 h-10 sm:w-12 sm:h-12" :ui="{ size: {sm: 'w-10 h-10 sm:w-12 sm:h-12'} }" />
              </template>
              <template v-else>
                <ArAvatar :src="userInfo.avatar || defaultUserAvatar" alt="User Settings" class="w-full h-full" avatar-class="w-10 h-10 sm:w-12 sm:h-12" :ui="{ size: {sm: 'w-10 h-10 sm:w-12 sm:h-12'} }" />
              </template>
            </UButton>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <UDashboardPage v-if="isLoading || isUserInfoLoading" class="flex-center w-full h-full">
      <UIcon name="svg-spinners:blocks-scale" dynamic class="w-16 h-16 opacity-50" />
    </UDashboardPage>
    <UDashboardPage v-else-if="communityListError || (address && !isUserInfoLoading && userInfoError)" class="flex-col-center h-full w-full">
      <UCard>
        <div class="flex-center text-center whitespace-pre-line text-xl text-gray-500">
          <div class="flex-col-center gap-y-4">
            <p>Failed to load data.</p>
            <UButton variant="soft" class="block" @click="refetch()">Retry</UButton>
          </div>
        </div>
      </UCard>
    </UDashboardPage>

    <div v-else class="relative h-screen w-[calc(100vw-48px)] sm:w-[calc(100vw-64px)]">
      <TopNav class="sticky top-0 z-10" />
      <slot />
    </div>

    <UModal v-model="isCreateModalOpen" :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }">
      <div v-if="selectModal === 0" class="flex justify-between gap-8 p-4">
        <UButton color="white" @click="selectModal=1">Create Community</UButton>
        <UButton color="white" @click="selectModal=2">Create Token</UButton>
      </div>
      <CommunitySettingForm
        v-if="selectModal === 1"
        @saved="refetchJoinedCommunities()"
        @close-modal="isCreateModalOpen = false"
      />
      <TokenCreate v-if="selectModal === 2" @close-modal="selectModal = 0; isCreateModalOpen = false" />
    </UModal>
    
    <LoginModal @login="afterLogin" />

    <VouchModal />

    <!-- TODO notifications from /api/notifications, such as task submission winning, task ended, new task created, etc. -->
    <!-- <NotificationsSlideover /> -->
  </UDashboardLayout>
</template>
