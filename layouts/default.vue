<script setup lang="ts">
import { arUrl, defaultCommunityLogo, defaultUserAvatar } from '~/utils/arAssets'
import { normalizeClass } from 'vue'

const router = useRouter()
const communityID = $computed(() => {
  const params = router.currentRoute.value.params
  return params.communityId || ''
})

const selectModal = $ref(0)

const { address } = $(aoStore())
const { joinedCommunities, getBan, userInfo, getUser, getCommunityList } = $(aoCommunityStore())

const isCreateModalOpen = $ref(false)

onMounted(async () => {
  console.log({router})
  try {
    if (!address) {
      router.push('/')
      return
    }

    Promise.all([getCommunityList(), getUser(), getBan()])
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
          wrapper: 'bg-slate-50',
          body: 'px-0 py-0 gap-y-0',
          footer: 'px-0 gap-x-0 justify-center'
        }"
      >
        <template #header>
          <NuxtLink :to="'/discovery'">
            <div class="w-full flex justify-center items-center">
              <img src="/export.png" class="h-full w-full transition duration-300 ease-in-out transform hover:brightness-200">
            </div>
          </NuxtLink>
        </template>

        <UDivider />

        <div class="overflow-y-auto h-full px-2 pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
          <NuxtLink
            v-for="community in joinedCommunities"
            :key="community.uuid"
            :to="`/community/${community.uuid}`"
            class="group w-full block mt-2 relative"
          >
            <div
              :class="normalizeClass([
                'transition-all ease-in-out duration-500 rounded-sm bg-gray-900 absolute left-[-6px]',
                community.uuid === communityID ? 'w-1 h-12 top-2 bg-opacity-80' : 'w-0 group-hover:w-1 h-8 top-4 bg-opacity-0 group-hover:bg-opacity-60'
              ])"
            />
            <!--<img src="/logo.png" :title="item.name" class="h-full w-full">-->

            <CuteRadius :width="64" :height="64">
              <div class="aspect-square rounded-lg bg-white z-10 overflow-hidden">
                <img
                  :src="community.logo || arUrl(defaultCommunityLogo)"
                  :title="community.name"
                  class="w-full h-full object-cover"
                >
              </div>
            </CuteRadius>
          </NuxtLink>

          <UButton
            class="w-full mt-2 aspect-square"
            variant="soft"
            :ui="{
              variant: {
                soft: 'bg-{color}-100'
              }
            }"
            @click="selectModal=0; isCreateModalOpen = true"
          >
            <UIcon name="ion:add" class="h-full w-full" />
          </UButton>
        </div>

        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <!-- <UserDropdownMini /> -->
          <UPopover mode="hover" :to="'/settings'">
            <NuxtLink :to="'/settings'">
              <template v-if="!userInfo.length">
                <UAvatar
                  size="2xl"
                />
              </template>
              <template v-else>
                <UAvatar :src="userInfo[0].avatar || arUrl(defaultUserAvatar)" alt="User Settings" size="2xl" />
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
