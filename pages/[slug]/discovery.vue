<script setup lang="ts">
const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const toast = useToast()
const route = useRoute()
const slug = $computed(() => route.params.slug)
let isLoading = $ref(false)
let communityLoading = $ref(true)

const blogPosts = [
  {
    id: 1,
    title: 'nxDAO',
    image: 'https://picsum.photos/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.'
  }
]

const { getCommunitylist, joinCommunity } = $(aocommunityStore())
let communityList = $ref({})
let communityListJson = $ref({})


const getCommunity = async() => {
  
  communityList = await getCommunitylist()
  const jsonData = communityList.Messages[0].Data // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g) // 使用正则表达式匹配字符串中的 JSON 对象
  communityListJson = jsonObjects.map((item: any) => JSON.parse(item)) // 解析每个 JSON 对象并存储到数组中
  communityLoading = false
}

const JoinCommunity = async( uuid: any ) => {
  if (isLoading) return
  isLoading = true
  
  await joinCommunity(uuid)

  toast.add({ title: 'joined success' })
  isLoading = false
}

onMounted(async () => {
  try {
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <div class="min-h-screen bg-red-1900 w-full overflow-y-auto h-full pl-20 pt-10">
    <UAlert>
      <template #title>
        <div class="text-3xl p-2">{{ $t('community.list')}}</div>
      </template>
    </UAlert>
    <!--
      测试按钮
      <UButton color="white" @click="doLogin">Arconnect</UButton>
      <UButton color="white" @click="getCommunitylist">test</UButton>
      <UButton color="white" @click="joinC">test2</UButton>
    -->
    <div v-if="communityLoading" class="w-full flex justify-center">
      <UIcon name="svg-spinners:blocks-scale" class="mt-80 w-[250px]" size="xl" dynamic v-bind="$attrs" />
    </div>
    <UBlogList orientation="horizontal">
      <UBlogPost 
        v-for="community in communityListJson" 
        :key="community.uuid" 
        image="https://picsum.photos/640/360" 
        :description="community.decs"
        :to="`/${slug}/community-details/${community.uuid}`"
        class="w-5/6"
      >
        <template #title>
          <div class="flex items-center">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="Avatar"
              size="md"
            />
            <Text class="mx-3">{{ community.name }}</Text>
          </div>
        </template>
        <template #description>
          <div class="flex flex-col space-y-2">
            <Text class="text-blue-300">builder: 100</Text>
            <Text class="text-blue-900">{{ community.desc }}</Text>
          </div>
        </template>
        <template v-if="community.isJoined">
          <!-- 显示文本“已加入” -->
          <UButton
            class="absolute right-0" 
            color="primary" 
            variant="outline" 
            disabled
          >
            {{ $t('community.list.isjoin')}}
          </UButton>
        </template>
        <template v-else>
          <!-- 显示 UButton 组件 -->
          <UButton
            class="absolute right-0" 
            color="primary" 
            variant="outline" 
            @click="() => JoinCommunity(community.uuid)"
          >
            {{ $t('community.list.join')}}
          </UButton>
        </template>
      </UBlogPost>
    </UBlogList>
  </div>
</template>
