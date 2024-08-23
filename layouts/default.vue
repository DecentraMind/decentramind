<script setup lang="ts">
import { arUrl, defaultCommunityLogo, defaultUserAvatar } from '~/utils/arAssets'
import { cn } from '~/utils/util'
import CommunityForm from '~/components/community/CommunityForm.vue'

const router = useRouter()

const selectModal = $ref(0)

const { address, checkIsActiveWallet } = $(aoStore())
const { joinedCommunities, currentUuid, userInfo, getUser, loadCommunityList } = $(communityStore())

const isCreateModalOpen = $ref(false)

onMounted(async () => {
  console.log({router})
  try {
    if (!address || !await checkIsActiveWallet()) {
      router.push('/')
      return
    }

    Promise.all([loadCommunityList(address), getUser()])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
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
            mode="click"
            :popper="{ arrow: true, placement: 'right', strategy: 'fixed', overflowPadding: 990, offsetDistance: 8, offsetSkid: 700 }"
            :ui="{
              container: 'w-fit !top-[-46px]',
              background: 'bg-gray-200',
              base: 'static border-0',
              shadow: 'shadow-none',
              ring: 'ring-0',
              arrow: {
                ring: 'before:ring-0 before:border-1 before:border-gray-900',
                shadow: 'before:shadow-none',
                background: 'before:z-50',
                placemennt: '!top-3'
              }
            }"
          >
            <UButton
              variant="outline"
              class="w-16 h-16 p-0 bg-white hover:bg-white border-0 rounded-full text-white transition duration-300 ease-in-out transform"
            >
              <img :src="arUrl(decentraMindLogo)" class="h-full w-full">
            </UButton>
            <template #panel>
              <div class="flex-center px-2 py-1 top-[2px]">
                <span>Discover</span>
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
              :popper="{ arrow: true, placement: 'right', strategy: 'fixed', overflowPadding: 990, offsetDistance: 8, offsetSkid: 700 }"
              :ui="{
                container: 'w-fit !top-[-40px]',
                arrow: {
                  shadow: 'before:shadow-none',
                  background: 'before:bg-white dark:before:bg-gray-800',
                  placemennt: '!top-3 !left-1'
                }
              }"
            >
              <NuxtLink
                :to="`/community/${community.uuid}`"
                class="group w-full block mt-2 relative"
              >
                <!-- indicator of current community -->
                <div
                  :class="cn(
                    'transition-all ease-in-out duration-500 rounded-sm bg-gray-900 absolute left-[-6px]',
                    'w-0 group-hover:w-1 h-8 top-4 bg-opacity-0 group-hover:bg-opacity-60',
                    {
                      'w-1 h-12 top-2 bg-opacity-80': community.uuid === currentUuid
                    }
                  )"
                />

                <CuteRadius :width="64" :height="64">
                  <div class="aspect-square rounded-lg bg-white z-10 overflow-hidden">
                    <img
                      :src="community.logo ? arUrl(community.logo) : arUrl(defaultCommunityLogo)"
                      :title="community.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </CuteRadius>
              </NuxtLink>
              <template #panel>
                <div class="flex-center px-2 py-1 top-[2px]">
                  <span>{{ community.name }}</span>
                </div>
              </template>
            </UPopover>
          </div>


          <UButton
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
            <NuxtLink :to="'/settings'">
              <template v-if="!userInfo">
                <UAvatar size="2xl" />
              </template>
              <template v-else>
                <ArAvatar :src="userInfo.avatar || defaultUserAvatar" alt="User Settings" size="2xl" />
              </template>
            </NuxtLink>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <UModal v-model="isCreateModalOpen" :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }">
      <div v-if="selectModal === 0" class="flex justify-between gap-8 p-4">
        <UButton color="white" @click="selectModal=1">Create Community</UButton>
        <UButton color="white" @click="selectModal=2">Create Token</UButton>
      </div>
      <CommunityForm
        v-if="selectModal === 1"
        @saved="loadCommunityList(address)"
        @close-modal="isCreateModalOpen = false"
      />
      <TokenCreate v-if="selectModal === 2" @close-modal="selectModal = 0; isCreateModalOpen = false" />
    </UModal>
    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />
  </UDashboardLayout>
</template>
