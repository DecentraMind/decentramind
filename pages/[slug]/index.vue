<script setup lang="ts">
const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const toast = useToast()
const route = useRoute()
const router = useRouter();
const slug = $computed(() => route.params.slug)
let communityLoading = $ref(true)

const blogPosts = [
  {
    id: 1,
    title: 'nxDAO',
    image: 'https://picsum.photos/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.'
  }
]
const { communityList, getCommunitylist, joinCommunity, getLocalcommunityInfo } = $(aocommunityStore())
const { gettoken } = $(linktwitter())
let result = $ref()

const getCommunity = async () => {

  result = await getCommunitylist()
  communityLoading = false
}

const communityJoin = async (uuid: any) => {
  const invite = "none"
  await joinCommunity(uuid, invite)

  toast.add({ title: 'joined success' })
  await getCommunity()
}

onMounted(async () => {
  try {
    if (Array.isArray(communityList) && communityList.length !== 0) {
      communityLoading = false
    }
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
const test = async () => {
  const uuidt = "798e6573-7cac-4575-8ed1-e638bd2a4e41"
  const a = await getLocalcommunityInfo(uuidt)
}

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
        <UButton color="white" @click="gettoken">{{ $t('twitter.link')}}</UButton>
        <UDropdown :items="translate" mode="hover" :popper="{ placement: 'bottom-start' }">
          <UButton color="white" label="English" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
        <UColorModeButton />
      </template>
    </UDashboardNavbar>
    <div class=" bg-red-1900 w-full overflow-y-auto h-[90%] pl-20">
      <!--<UButton @click="test">test12</UButton>-->
      <!--
      测试按钮
      <UButton color="white" @click="doLogin">Arconnect</UButton>
      <UButton color="white" @click="getCommunitylist">test</UButton>
      <UButton color="white" @click="joinC">test2</UButton>
    -->
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:blocks-scale" class="mt-80 w-[250px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div class=" mx-auto w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          <UBlogPost v-for="community in communityList" :key="community.uuid" :image="`/task/${community.banner}.jpg`" :description="community.decs" :to="`/${slug}/community-details/${community.uuid}`">
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
                    builder: 100
                  </div>
                  <div class="text-2xl">
                    {{ community.desc }}
                  </div>
                </div>
                <div>
                  <template v-if="community.isJoined">
                    <!-- 显示文本“已加入” -->
                    <UButton class="absolute right-0 w-[65px]" color="white" variant="outline" disabled>
                      {{ $t('community.list.isjoin') }}
                    </UButton>
                  </template>
                  <template v-else>
                    <!-- 显示 UButton 组件 -->
                    <UButton class="absolute right-0 w-[60px]" :ui="{ font: 'font-medium'}" color="white" variant="outline" @click="() => communityJoin(community.uuid)">
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
  </div>
</template>
