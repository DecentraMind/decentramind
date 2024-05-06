<script setup lang="ts">

const toast = useToast()
const route = useRoute()
const slug = $computed(() => route.params.slug)
let isLoading = $ref(false)
let cLoading = $ref(true)

const blogPosts = [
  {
    id: 1,
    title: 'nxDAO',
    image: 'https://picsum.photos/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.'
  },
  {
    id: 2,
    title: 'nxDAO',
    image: 'https://picsum.photos/id/10/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5'
  },
  {
    id: 3,
    title: 'tedDAO',
    image: 'https://picsum.photos/640/360',
    description: 'Nuxt DevTools v1.0 is out, generally available to all Nuxt projects!'
  },
  {
    id: 4,
    title: 'Nuxt 3.9',
    image: 'https://picsum.photos/id/10/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5'
  },
  {
    id: 5,
    title: 'Nuxt 3.8',
    image: 'https://picsum.photos/640/360',
    description: 'Nuxt 3.8 is out, bringing built-in DevTools, automatic Nuxt Image install, a new app...'
  },
  {
    id: 6,
    title: 'Nuxt 3.9',
    image: 'https://picsum.photos/id/10/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5'
  },
  {
    id: 7,
    title: 'Nuxt 3.9',
    image: 'https://picsum.photos/id/10/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5'
  },
  {
    id: 8,
    title: 'Nuxt 3.9',
    image: 'https://picsum.photos/id/10/640/360',
    description: 'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5'
  }
]

const { getCommunitylist, joinCommunity } = $(aocommunity())
let cList = $ref({})
let cListj = $ref({})


const getCommunity = async() => {
  
  cList = await getCommunitylist()
  console.log("nogoods")
  console.log(cList.Messages)
  const jsonData = cList.Messages[0].Data; // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g); // 使用正则表达式匹配字符串中的 JSON 对象
  cListj = jsonObjects.map(item => JSON.parse(item)); // 解析每个 JSON 对象并存储到数组中
  cLoading = false
  console.log(cListj)
  console.log("goods")
  console.log(cListj)
}

const joinC = async(cuuid) => {
  if (isLoading) return
  isLoading = true
  
  await joinCommunity(cuuid)

  toast.add({ title: 'joined success' })
  isLoading = false
}

const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

onMounted(init)

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
        <div class="text-3xl p-2">社 区 列 表</div>
      </template>
    </UAlert>
    <!--
      测试按钮
      <UButton color="white" @click="doLogin">Arconnect</UButton>
      <UButton color="white" @click="getCommunitylist">test</UButton>
      <UButton color="white" @click="joinC">test2</UButton>
    -->
    <div v-if="cLoading" class="w-full flex justify-center">
      <UIcon name="svg-spinners:blocks-scale" class="mt-80 w-[250px]" size="xl" dynamic v-bind="$attrs" />
    </div>
    <UBlogList orientation="horizontal">
      <UBlogPost 
        v-for="blogPost in cListj" 
        :key="blogPost.uuid" 
        image="https://picsum.photos/640/360" 
        :description="blogPost.decs"
        :to="`/${slug}/community-details/${blogPost.uuid}`"
        class="w-5/6"
      >
        <template #title>
          <div class="flex items-center">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="Avatar"
              size="md"
            />
            <Text class="mx-3">{{ blogPost.name }}</Text>
          </div>
        </template>
        <template #description>
          <div class="flex flex-col space-y-2">
            <Text class="text-blue-300">builder: 100</Text>
            <Text class="text-blue-900">{{ blogPost.desc }}</Text>
          </div>
        </template>
        <template v-if="blogPost.isJoined">
          <!-- 显示文本“已加入” -->
          <UButton
            class="absolute right-0" 
            color="primary" 
            variant="outline" 
            disabled
          >
            已加入
          </UButton>
        </template>
        <template v-else>
          <!-- 显示 UButton 组件 -->
          <UButton
            class="absolute right-0" 
            color="primary" 
            variant="outline" 
            @click="() => joinC(blogPost.uuid)"
          >
            加入社区
          </UButton>
        </template>
      </UBlogPost>
    </UBlogList>
  </div>
</template>
