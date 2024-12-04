<script setup lang="ts">
import { arUrl, defaultCommunityLogo, defaultUserAvatar, exploreLogo } from '~/utils/arAssets'
import { cn } from '~/utils/util'
import CommunitySettingForm from '~/components/community/CommunitySettingForm.vue'
import LoginModal from '~/components/users/LoginModal.vue'
import VouchModal from '~/components/users/VouchModal.vue'

const router = useRouter()

const selectModal = $ref(0)

const { checkIsActiveWallet, addSwitchListener } = $(aoStore())
let { address } = $(aoStore())
const { updateVouchData, twitterVouched } = $(aoStore())
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let { isLoginModalOpen, isVouchModalOpen } = $(aoStore())
const { joinedCommunities, currentUuid, loadCommunityList, communityListError } = $(communityStore())
const { userInfo, isLoading: isUserInfoLoading, error: userInfoError, refetchUserInfo } = $(useUserInfo())

const isCreateModalOpen = $ref(false)
let isLoading = $ref(true)
onMounted(async () => {
  try {
    // if not address, show login modal
    if (!address) {
      if (window.arweaveWallet) {
        await window.arweaveWallet.disconnect()
      }
      await loadCommunityList()
    } else {
      if (!await checkIsActiveWallet()) {
        console.log('not active wallet')
        address = ''
        isLoginModalOpen = true
        return
      }
      addSwitchListener()

      await Promise.all([
        updateVouchData(),
        loadCommunityList(address)
      ])

      if (!twitterVouched) {
        // TODO remove vouch modal from this layout if all users are vouched
        isVouchModalOpen = true
        return
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading = false
  }
})

const refetch = async () => {
  isLoading = true
  try {
    await Promise.race([
      loadCommunityList(address),
      refetchUserInfo()
    ])
  } catch (error) {
    console.error('Error refetching data:', error)
  } finally {
    isLoading = false
  }
}

const afterLogin = () => {
  console.log('after login triggered')
  console.log('address', address)
  console.log('communityListError', communityListError)
  console.log('userInfoError', userInfoError)
  router.push('/')
}
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="80" class="w-20">
      <UDashboardSidebar
        :ui="{
          wrapper: 'bg-gray-100',
          body: 'px-0 py-0 gap-y-0',
          header: 'flex-center',
          footer: 'px-0 gap-x-0 justify-center'
        }"
      >
        <template #header>
          <UPopover
            mode="hover"
            :popper="{ arrow: true, placement: 'right', strategy: 'fixed', offsetDistance: 0 }"
            :ui="{
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
              class="w-16 h-16 p-0 hover:bg-transparent border-0 rounded-full text-white transition duration-300 ease-in-out transform"
            >
              <img :src="arUrl(exploreLogo)" class="h-full w-full scale-110">
            </UButton>
            <template #panel>
              <div class="flex-center px-2 py-1">
                <span>Explore</span>
              </div>
            </template>
          </UPopover>
        </template>

        <UDivider />

        <div class="overflow-y-auto h-full px-2 pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
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
                class="group w-full block p-0 mt-2 relative ring-0"
              >
                <!-- indicator of current community -->
                <div
                  :class="cn(
                    'transition-all ease-in-out duration-500 rounded-sm bg-gray-900 absolute left-[-6px]',
                    'w-0 group-hover:w-1 h-8 top-4 bg-opacity-0 group-hover:bg-opacity-60',
                    {
                      'w-1 h-10 top-3 bg-opacity-80': community.uuid === currentUuid
                    }
                  )"
                />

                <CuteRadius :width="64" :height="64">
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
          <UPopover mode="hover" :to="'/settings'">
            <NuxtLink :to="userInfo && address ? '/settings' : '#'">
              <template v-if="!userInfo || !address">
                <ArAvatar :src="defaultUserAvatar" alt="User Settings" size="2xl" />
              </template>
              <template v-else>
                <ArAvatar :src="userInfo.avatar || defaultUserAvatar" alt="User Settings" size="2xl" />
              </template>
            </NuxtLink>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <div v-if="isLoading || isUserInfoLoading" class="flex-center w-full h-full">
      <UIcon name="svg-spinners:blocks-scale" dynamic class="w-16 h-16 opacity-50" />
    </div>
    <div v-else-if="communityListError || (address && !isUserInfoLoading && userInfoError)" class="flex-col-center h-full w-full">
      <UCard>
        <div class="flex-center text-center whitespace-pre-line text-xl text-gray-500">
          <div class="flex-col-center gap-y-4">
            <p>Failed to load data.</p>
            <UButton variant="soft" class="block" @click="refetch()">Retry</UButton>
          </div>
        </div>
      </UCard>
    </div>

    <main v-else class="w-full">
      <slot />
    </main>

    <UModal v-model="isCreateModalOpen" :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }">
      <div v-if="!userInfo?.canCreateCommunity" class="flex-center text-center whitespace-pre-line text-xl text-gray-500">
        <div class="flex-col-center gap-y-4 p-4">
          <p class="text-base leading-loose">Being cooked!<br>Please contact with us through the group.<br><a href="https://t.me/+n18CxBJlGMg0Y2U5" target="_blank" class="text-primary">https://t.me/+n18CxBJlGMg0Y2U5</a></p>
        </div>
      </div>
      <template v-else>
        <div v-if="selectModal === 0" class="flex justify-between gap-8 p-4">
          <UButton color="white" @click="selectModal=1">Create Community</UButton>
          <UButton color="white" @click="selectModal=2">Create Token</UButton>
        </div>
        <CommunitySettingForm
          v-if="selectModal === 1"
          @saved="loadCommunityList(address)"
          @close-modal="isCreateModalOpen = false"
        />
        <TokenCreate v-if="selectModal === 2" @close-modal="selectModal = 0; isCreateModalOpen = false" />
      </template>
    </UModal>
    
    <LoginModal @login="afterLogin" />

    <VouchModal />

    <!-- TODO notifications from /api/notifications, such as task submission winning, task ended, new task created, etc. -->
    <!-- <NotificationsSlideover /> -->
  </UDashboardLayout>
</template>
