<script setup lang="ts">
import type { UserInfo } from '~/types'
import { arUrl, communityLogo, userAvatar } from '~/utils/arAssets'

const router = useRouter()

const selectModal = $ref(0)

const { address } = $(aoStore())
const { joinedCommunities, getBan, getUserByAddress, getCommunityList } = $(aoCommunityStore())

const isCreateModalOpen = $ref(false)

let user = $ref<UserInfo>()

onMounted(async () => {
  try {
    if (!address) {
      router.push('/')
      return
    }
    getBan()
    user = await getUserByAddress(address)
    // this will fetch all communities, ans set joinedCommunities if address is not ''
    getCommunityList()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="96" class="w-24">
      <UDashboardSidebar>
        <template #header>
          <NuxtLink :to="'/discovery'">
            <div class="w-full flex justify-center items-center">
              <img src="/export.png" class="h-4/5 w-4/5 transition duration-300 ease-in-out transform hover:brightness-75">
            </div>
          </NuxtLink>
        </template>

        <UDivider />

        <div class="overflow-y-auto h-full" style="-ms-overflow-style: none; scrollbar-width: none;">
          <NuxtLink
            v-for="community in joinedCommunities"
            :key="community.uuid"
            :to="`/community/${community.uuid}`"
            class="w-full block mt-2 rounded-lg border border-gray-100 overflow-hidden"
          >
            <!--<img src="/logo.png" :title="item.name" class="h-full w-full">-->
            <div class="aspect-square">
              <img
                :src="community.logo || arUrl(communityLogo)"
                :title="community.name"
                class="w-full h-full object-cover transition duration-300 ease-in-out transform hover:brightness-75"
              >
            </div>
          </NuxtLink>

          <UButton class="w-full mt-2 aspect-square" variant="soft" @click="selectModal=0; isCreateModalOpen = true">
            <UIcon name="ion:add" class="h-full w-full" />
          </UButton>
        </div>

        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <!-- <UserDropdownMini /> -->
          <UPopover mode="hover" :to="'/settings'">
            <NuxtLink :to="'/settings'">
              <template v-if="!user">
                <UAvatar
                  size="2xl"
                />
              </template>
              <template v-else>
                <UAvatar :src="user.avatar || arUrl(userAvatar)" alt="User Settings" size="2xl" />
              </template>
            </NuxtLink>
          </UPopover>
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <UModal v-model="isCreateModalOpen" :ui="{ width: w-full }">
      <UCard>
        <div v-if="selectModal === 0" class="flex justify-between w-[300px]">
          <UButton color="white" @click="selectModal=1">Create Community</UButton>
          <UButton color="white" @click="selectModal=2">Create Tokens</UButton>
        </div>
        <CommunityCreate v-if="selectModal === 1" @created="getCommunityList()" @close-modal="isCreateModalOpen = false" />
        <TokenCreate v-if="selectModal === 2" />
      </UCard>
    </UModal>
    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />
  </UDashboardLayout>
</template>
