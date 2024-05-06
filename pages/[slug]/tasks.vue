<script setup lang="ts">
const {t} = useI18n()
const { createTask, getAllTasks } = $(taskStore())
const blogPosts = await getAllTasks("GetAllTasks")
const blogPosts1 = [
  {
    id: 1,
    name: "Task 1",
    image: "https://picsum.photos/640/360",
    description:
      "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
  {
    id: 2,
    name: "Task 2",
    image: "https://picsum.photos/640/360",
    description: "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
  {
    id: 3,
    name: "Task 3",
    image: "https://picsum.photos/640/360",
    description: "Nuxt DevTools v1.0 is out, generally available to all Nuxt projects!",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
  {
    id: 4,
    name: "Task 4",
    image: "https://picsum.photos/640/360",
    description: "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
  {
    id: 5,
    name: "Task 5",
    image: "https://picsum.photos/640/360",
    description:
      "Nuxt 3.8 is out, bringing built-in DevTools, automatic Nuxt Image install, a new app...",
    reward: "100 Token + 200 USDT",
    builderNum: 1000,
    status: "未开始",
  },
  {
    id: 6,
    name: "Task 6",
    image: "https://picsum.photos/640/360",
    description: "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
  {
    id: 7,
    name: "Task 6",
    image: "https://picsum.photos/640/360",
    description: "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5",
    reward: "100 Token + 200 USDT",
    builderNum: 100,
    status: "未开始",
  },
];
console.log("blogPosts = " + blogPosts)
const items = [
  {
    label: t('Open Mission Area'),
    content: "",
  },
  {
    label: t('Unopened mission area'),
    content: "",
  },
];

function onChange(index) {
  const item = items[index];

  alert(`${item.label} was clicked!此处应该刷新下方列表数据，重新渲染，待完善`);
}
</script>

<template>
  <UDashboardPage>
    <UPage class="overflow-y-auto h-full w-full">
      <div class="   mx-10 mt-10  ">
        <div class="flex justify-between mb-4">
          <div>
            <UTabs :items="items" @change="onChange" />
          </div>
          <div class="flex justify-end ...">
            <UButton to="/${slug}/create-task/" color="black" variant="solid" size="2xs" >{{ $t("Create Task") }}</UButton>
          </div>
        </div>
        <UBlogList orientation="horizontal">
          <UBlogPost
            v-for="blogPost in blogPosts"
            :key="blogPost.id"
            :image="blogPost.image"
            :description="blogPost.description"
          >
            <template #title>
              <div class="flex justify-between ...">
                <Text >{{ blogPost.name }}</Text>
                <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
              </div>
            </template>
            <template #description>
              <div class="flex flex-col space-y-2">
                <Text class="text-blue-900">{{ blogPost.description }}</Text>
                <div class="flex justify-between ...">
                  <div><Text class="text-blue-300">{{ $t("Task Reward") }}:</Text></div>
                  <div><Text class="text-blue-300">{{ blogPost.reward }}</Text></div>
                </div>
                <div class="flex justify-between ...">
                  <div><Text class="text-blue-300">{{ $t("Number participated") }}:</Text></div>
                  <div><Text class="text-blue-300">{{ blogPost.builderNum }}</Text></div>
                </div>
              </div>
            </template>
            <UButton to="/signup/detail-task/" class="absolute right-0" color="primary" variant="outline">{{ $t("Explore Detail") }}</UButton>
          </UBlogPost>
        </UBlogList>
      </div>
    </UPage>
  </UDashboardPage>

</template>
