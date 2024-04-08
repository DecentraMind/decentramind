<script setup lang="ts">
definePageMeta({
  layout: "wip",
});

const blogPost = {
  id: 1,
  name: "Task 1",
  image: "https://picsum.photos/640/360",
  description:
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more." +
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more." +
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more." +
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more." +
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more." +
    "Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.",
  reward: "100 Token + 200 USDT",
  taskTime: "2024/03/02-2024/06/06",
  rewardSessions: 200,
  submittedSessions: 195,
  taskRule:
    "任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则" +
    "任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则" +
    "任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则",
  builderNum: 100,
  status: "进行中",
  isJoin: "未参与",
};

const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "wallet",
    label: "钱包地址",
  },
  {
    key: "brandEffect",
    label: "品牌效应",
  },
  {
    key: "inviteFriends",
    label: "呼朋引伴",
  },
  {
    key: "audience",
    label: "听众",
  },
  {
    key: "url",
    label: "url",
  },
  {
    key: "score",
    label: "分数",
  },
];

const people = [
  {
    id: 1,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: "twitter.com/space/1",
    score: 100,
  },
  {
    id: 2,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: "twitter.com/space/1",
    score: 100,
  },
  {
    id: 3,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: "twitter.com/space/1",
    score: 100,
  },
  {
    id: 4,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: "twitter.com/space/1",
    score: 100,
  },
  {
    id: 5,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: "twitter.com/space/1",
    score: 100,
  },
  {
    id: 6,
    wallet: "0x120xxxxxx00xxxxxxxxx",
    brandEffect: 10,
    inviteFriends: 10,
    audience: 11,
    url: "twitter.com/space/1",
    score: 100,
  },
];

const q = ref("");

const filteredRows = computed(() => {
  if (!q.value) {
    return people;
  }

  return people.filter((person) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<template>
  <UBlogPost
    :key="blogPost.id"
    :image="blogPost.image"
    :description="blogPost.description"
    }
  >
    <template #title>
      <div class="flex justify-start...">
        <Text class="mx-3">{{ blogPost.name }}</Text>
        <div class="mx-8"><UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge></div>
        <div class="mx-8"><UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge></div>
        <!-- <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
        <UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge> -->
      </div>
    </template>
    <template #description>
      <div class="flex flex-col space-y-2">
        <Text class="text-blue-900">{{ blogPost.description }}</Text>
        <div class="flex justify-start ...">
          <div><Text class=" mr-20 text-blue-300">任务时间:</Text></div>
          <div>
            <Text class="text-blue-300">{{ blogPost.taskTime }}</Text>
          </div>
        </div>
        <div class="flex justify-start ...">
          <div><Text class=" mr-20 text-blue-300">任务奖励:</Text></div>
          <div>
            <Text class="text-blue-300">{{ blogPost.reward }}</Text>
          </div>
        </div>
        <div class="flex justify-start ...">
          <div><Text class=" mr-20 text-blue-300">奖励场次:</Text></div>
          <div>
            <Text class="text-blue-300">{{ blogPost.rewardSessions }}</Text>
          </div>
        </div>
        <div class="flex justify-start ...">
          <div><Text class=" mr-16 text-blue-300">已提交场次:</Text></div>
          <div>
            <Text class="text-blue-300">{{ blogPost.submittedSessions }}</Text>
          </div>
        </div>
        <div class="grid grid-rows-2 grid-flow-col gap-4">
          <div class="mr-16 row-span-2"><Text class="text-blue-300">任务规则:</Text></div>
          <div class="col-span-2 ...">
            <Text class="text-blue-300">{{ blogPost.taskRule }}</Text>
          </div>
        </div>
      </div>
      <div>
        <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
        <Text class=" mr-8 text-blue-300">任务提交排名:</Text>
          <UInput v-model="q" placeholder="Filter people..." />
        </div>

        <UTable :rows="filteredRows" :columns="columns" />
      </div>
    </template>
  </UBlogPost>
</template>
