<script setup lang="ts">

import CommonAlert from '~/components/CommonAlert.vue'
const {t} = useI18n()
const { createTask, getAllTasks, joinSpaceTask } = $(taskStore())
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
  isJoin: "已参与",
};

const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "wallet",
    label: t('Wallet Address'),
  },
  {
    key: "brandEffect",
    label: t('Brand Effect'),
  },
  {
    key: "inviteFriends",
    label: t('Invite Friends'),
  },
  {
    key: "audience",
    label: t('Audience'),
  },
  {
    key: "url",
    label: t('Space Url'),
  },
  {
    key: "score",
    label: t('Score'),
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

function switchDisable() {
  return blogPost.status == '进行中' && blogPost.isJoin == '已参与'
}
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

const toast = useToast()
const modal = useModal()

const userinfo = {
  userId: 1,
  userName: "gqz",
  userTwitter: "xx",
};
const error_msg = "感谢你对社区的支持~经系统检测，你还没有绑定twitter账号哦！"
let isOpen = $ref(false)
function openModal () {
  if(isNullOrEmpty(userinfo.userTwitter)){
    modal.open(CommonAlert, {message: error_msg})
  }else{
    isOpen = true
  }
}
function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.length === 0 || str.length == undefined;
}


const emit = defineEmits(['success'])

let isSettlementOpen = $ref(false)
function onClick() {
  isSettlementOpen = true
}
const addr = $ref('')
const url = $ref('')
function joinTask() {
  joinSpaceTask("20c1f625-9fcf-4113-83f6-19e63b2a9d6c", addr, url)
  isOpen = false
}
</script>

<template>
  <UDashboardPage>
    <UPage>
      <div class="w-full overflow-y-auto h-full ">
        <div class="mx-10">
          <UColorModeImage :light="blogPost.image" :dark="blogPost.image" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>

        <UBlogPost
          :key="blogPost.id"
          :description="blogPost.description"
          class="p-10"
        >
          <template #title>
            <div class="flex justify-start...">
              <Text >{{ blogPost.name }}</Text>
              <div class="mx-8"><UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge></div>
              <div class="mx-8"><UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge></div>
              <!-- <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
              <UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge> -->
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-2">
              <Text class="text-blue-900">{{ blogPost.description }}</Text>
              <div class="flex ...">
                <div class="flex-none w-60"><Text class=" text-blue-300">{{ $t("Task Period") }}:</Text></div>
                <div>
                  <Text class="text-blue-300">{{ blogPost.taskTime }}</Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60"><Text class="text-blue-300">{{ $t("Task Reward") }}:</Text></div>
                <div>
                  <Text class="text-blue-300">{{ blogPost.reward }}</Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60"><Text class=" text-blue-300">{{ $t("Total Reward") }}:</Text></div>
                <div>
                  <Text class="text-blue-300">{{ blogPost.rewardSessions }}</Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60"><Text class="text-blue-300">{{ $t("Number participated") }}:</Text></div>
                <div>
                  <Text class="text-blue-300">{{ blogPost.submittedSessions }}</Text>
                </div>
              </div>
              <div class="flex justify-start">
                <div class="flex-none w-60 "><Text class="text-blue-300">{{ $t("Task Rule") }}:</Text></div>
                <div>
                  <Text class="text-blue-300">{{ blogPost.taskRule }}</Text>
                </div>
              </div>
            </div>
            <div>
              <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <Text class=" mr-8 text-blue-300">{{ $t("Submission Rank") }}:</Text>
                <UInput v-model="q" placeholder="Filter..." />
              </div>
              <UTable :rows="filteredRows" :columns="columns" />
            </div>
            <div class="flex justify-center my-8" v-if="switchDisable()">
              <UButton :label="$t('Join Task')" @click="openModal" />
            </div>
          </template>
        </UBlogPost>
      </div>
    </UPage>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Join Task") }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>
        <div v-if="!isSettlementOpen" class="space-y-2">
          <p>{{ $t("Task Hint") }}</p>
          <UButton @click="onClick">
            I know!
          </UButton>
        </div>
        <div v-if="isSettlementOpen">
          <div class="my-8">
            <UInput v-model="addr" color="primary" variant="outline" :placeholder="$t('Wallet Address')" />
          </div>
          <div class="my-8">
            <UInput v-model="url" color="primary" variant="outline" :placeholder="$t('Space Url')" />
          </div>
          <div class="flex justify-center my-8">
            <UButton @click="joinTask">{{ $t("Submit") }}</UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
