<script setup lang="ts">
definePageMeta({
  layout: "wip",
});

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

</script>

<template>
  <div class="min-h-screen bg-red-1900 w-full">
    discovery
    <UBlogList orientation="horizontal">
      <UBlogPost v-for="blogPost in blogPosts" :key="blogPost.id" :image="blogPost.image" :description="blogPost.description">
        <template #title>
          <div class="flex items-center">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="Avatar"
              size="md"
            />
            <Text class="mx-3">{{ blogPost.title }}</Text>
          </div>
        </template>
        <template #description>
          <div class="flex flex-col space-y-2">
            <Text class="text-blue-300">builder: 100</Text>
            <Text class="text-blue-900">{{ blogPost.description }}</Text>
          </div>
        </template>
        <UButton class="absolute right-0" color="primary" variant="outline" >加入社区</UButton>
      </UBlogPost>
    </UBlogList>
  </div>
</template>
