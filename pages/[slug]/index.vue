<script setup lang="ts">
const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const { communityList, userInfo, getInfo, getCommunitylist, joinCommunity, getLocalcommunityInfo } = $(aocommunityStore())
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
</script>

<template>
  <div class="min-h-screen bg-red-1900 w-full">
    <UDashboardNavbar title="Explore">
      <template #right>
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
        <UColorModeButton />
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
                    <UButton class="absolute right-0 w-[60px]" block :ui="{ font: 'font-medium'}" color="white" variant="outline" @click="() => communityJoin(community.uuid)">
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
  </div>
</template>
