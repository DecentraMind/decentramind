<script setup lang="ts">
import RuleModal from '~/components/RuleModal.vue'
import CommonAlert from '~/components/CommonAlert.vue'

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
const singles = ['单人', '多人']
const isSingle = ref(singles[0])
let isSettlementOpen = $ref(false)
function onClick() {
  isSettlementOpen = true
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
              <div class="w-full grid grid-rows-2 grid-flow-col gap-4">
                <div class="mr-16 row-span-2"><Text class="text-blue-300">任务规则:</Text></div>
                <div class="col-span-2">
                  <Text class="text-blue-300">{{ blogPost.taskRule }}</Text>
                </div>
              </div>
            </div>
            <div>
              <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <Text class=" mr-8 text-blue-300">任务提交排名:</Text>
                <UInput v-model="q" placeholder="Filter..." />
              </div>
              <UTable :rows="filteredRows" :columns="columns" />
            </div>
            <div class="flex justify-center my-8" v-if="switchDisable()">
              <UButton label="结算任务" @click="openModal" />
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
            任务结算
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="isOpen = false" />
        </div>
      </template>
      <div v-if="!isSettlementOpen" class="space-y-2">
        <p>感谢你对社区的支持~请你按照任务规则完成任务，并且将任务URL提交至表格的加号处哦！如果没有遵循任何一条任务规则那么你可能会白费力气喔~</p>
        <UButton @click="onClick">
          I know!
        </UButton>
      </div>
      <div v-if="isSettlementOpen">
        <div class="my-8 flex flex-row">
          <div class="mr-4 basis-2/3">
            <UInput color="primary" variant="outline" placeholder="钱包地址2" />
          </div>
          <div class="ml-4 basis-1/3">
            <UInput color="primary" variant="outline" placeholder="奖励占比" />
          </div>
        </div>
        <div class="my-8">
          <UInput color="primary" variant="outline" placeholder="URL" />
        </div>
        <div class="flex justify-center my-8">
          <UButton>确认提交</UButton>
        </div>
      </div>
    </UCard>
  </UModal>
  </UDashboardPage>

</template>
