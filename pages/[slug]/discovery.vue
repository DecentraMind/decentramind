<script setup lang="ts">


const route = useRoute()
const slug = $computed(() => route.params.slug)

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
const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

onMounted(init)

const { getCommunity } = $(aocommunity())
let cList = $ref('')
let cListj = $ref({})
const getCommunitylist = async() => {
  
  cList = await getCommunity()

  const jsonData = cList.Messages[0].Data; // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g); // 使用正则表达式匹配字符串中的 JSON 对象
  cListj = jsonObjects.map(item => JSON.parse(item)); // 解析每个 JSON 对象并存储到数组中

  console.log(cListj)
  console.log("goods")
  console.log(cListj)
}
getCommunitylist()
</script>

<template>
  <div class="min-h-screen bg-red-1900 w-full overflow-y-auto h-full pl-20 pt-20">
    <UButton color="white" @click="doLogin">Arconnect</UButton>
    <UButton color="white" @click="getCommunitylist">test</UButton>
    <UBlogList orientation="horizontal">
      <UBlogPost 
        v-for="blogPost in cListj" 
        :key="blogPost.id" 
        image="https://picsum.photos/id/10/640/360" 
        :description="blogPost.decs"
        :to="`/${slug}/community-details`"
        class="w-5/6"
      >
        <template #title>
          <div class="flex items-center">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="Avatar"
              size="md"
            />
            <Text class="mx-3">{{ blogPost.communityName }}</Text>
          </div>
        </template>
        <template #description>
          <div class="flex flex-col space-y-2">
            <Text class="text-blue-300">builder: 100</Text>
            <Text class="text-blue-900">{{ blogPost.decs }}</Text>
          </div>
        </template>
        <UButton class="absolute right-0" color="primary" variant="outline" >加入社区</UButton>
      </UBlogPost>
    </UBlogList>
  </div>
</template>
