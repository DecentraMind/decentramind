<script setup lang="ts">

import CommonAlert from '~/components/CommonAlert.vue'
import {taskStore} from '../../../stores/taskStore'
const { t } = useI18n()
const { getTaskById, joinSpaceTask } = $(taskStore())

const route = useRoute()
const taskId = $computed(() => route.params.taskId)

let blogPost = await getTaskById(taskId)
console.log('blogPost = ' + JSON.stringify(blogPost))
// onMounted(async () => {
//
//   blogPost = await getTaskById(taskId)
//   console.log('blogPost = ' + JSON.stringify(blogPost))
//   console.log(blogPost.name)
// })
// const blogPost = {
//   id: 1,
//   name: 'Task 1',
//   image: 'https://picsum.photos/640/360',
//   description:
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.' +
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.' +
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.' +
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.' +
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.' +
//       'Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, a new loading API and more.',
//   reward: '100 Token + 200 USDT',
//   taskTime: '2024/03/02-2024/06/06',
//   rewardSessions: 200,
//   submittedSessions: 195,
//   taskRule:
//       '任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则' +
//       '任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则' +
//       '任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则任务规则',
//   builderNum: 100,
//   status: '进行中',
//   isJoin: '已参与',
// }

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'wallet',
    label: t('Wallet'),
  },
  {
    key: 'brandEffect',
    label: t('Brand'),
  },
  {
    key: 'inviteFriends',
    label: t('Friends'),
  },
  {
    key: 'audience',
    label: t('Popularity'),
  },
  {
    key: 'url',
    label: t('URL'),
  },
  {
    key: 'score',
    label: t('Total Score'),
  },
]

const people = [
  {
    id: 1,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: 'twitter.com/space/1',
    score: 100,
  },
  {
    id: 2,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: 'twitter.com/space/1',
    score: 100,
  },
  {
    id: 3,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: 'twitter.com/space/1',
    score: 100,
  },
  {
    id: 4,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: 'twitter.com/space/1',
    score: 100,
  },
  {
    id: 5,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 120,
    url: 'twitter.com/space/1',
    score: 100,
  },
  {
    id: 6,
    wallet: '0x120xxxxxx00xxxxxxxxx',
    brandEffect: 10,
    inviteFriends: 10,
    audience: 11,
    url: 'twitter.com/space/1',
    score: 100,
  },
]

const q = ref('')

function switchDisable() {
  // return blogPost.status == '进行中' && blogPost.isJoin == '已参与'
  return true
}
const filteredRows = computed(() => {
  if (!q.value) {
    return people
  }

  return people.filter((person) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

const toast = useToast()
const modal = useModal()

const userinfo = {
  userId: 1,
  userName: 'gqz',
  userTwitter: 'xx',
}
const error_msg = '感谢你对社区的支持~经系统检测，你还没有绑定twitter账号哦！'
let isOpen = $ref(false)
let isOpenJoin = $ref(false)
function openModal() {
  if (isNullOrEmpty(userinfo.userTwitter)) {
    modal.open(CommonAlert, { message: error_msg })
  } else {
    isOpen = true
  }
}
function openJoin() {
  if (isNullOrEmpty(userinfo.userTwitter)) {
    modal.open(CommonAlert, { message: error_msg })
  } else {
    isOpenJoin = true
  }
}
function onClick() {
  //  调用参与任务方法，只计数不提交
  joinSpaceTask('20c1f625-9fcf-4113-83f6-19e63b2a9d6c', addr, url)
  isOpenJoin = false
}
function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.length === 0 || str.length == undefined
}


const emit = defineEmits(['success'])



const addr = $ref('')
const url = $ref('')
function joinTask() {
  // TODO 调用提交space链接并解析方法
  // joinSpaceTask('20c1f625-9fcf-4113-83f6-19e63b2a9d6c', addr, url)
  isOpen = false
}

</script>

<template>
  <UDashboardPage>
    <UPage class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full ">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg" />
          </div>
        </div>
        <div class="mx-10">
          <UColorModeImage :light="blogPost.image" :dark="blogPost.image" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>

        <UBlogPost :key="blogPost.id" :description="blogPost.description" class="p-10">
          <template #title>
            <div class="flex justify-start...">
              <Text>{{ blogPost.name }}</Text>
              <div class="mx-8">
                <UBadge color="green" variant="solid">
                  {{ blogPost.status }}
                </UBadge>
              </div>
              <div class="mx-8">
                <UBadge color="green" variant="solid">
                  {{ blogPost.isJoin }}
                </UBadge>
              </div>
              <!-- <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
              <UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge> -->
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-2">
              <Text class="text-blue-900">
                {{ blogPost.description }}
              </Text>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <Text class=" text-blue-300">
                    {{ $t("Time") }}:
                  </Text>
                </div>
                <div>
                  <Text class="text-blue-300">
                    {{ blogPost.startTime }} - {{ blogPost.endTime }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text class="text-blue-300">
                    {{ $t("Bounty") }}:
                  </Text>
                </div>
                <div>
                  <Text class="text-blue-300">
                    {{ blogPost.reward }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text class=" text-blue-300">
                    {{ $t("Total Chances") }}:
                  </Text>
                </div>
                <div>
                  <Text class="text-blue-300">
                    {{ blogPost.rewardTotal }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text class="text-blue-300">
                    {{ $t("builders now") }}:
                  </Text>
                </div>
                <div>
                  <Text class="text-blue-300">
                    {{ blogPost.buildNumber }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start">
                <div class="flex-none w-60 ">
                  <Text class="text-blue-300">
                    {{ $t("Rules of the Quest") }}:
                  </Text>
                </div>
                <div>
                  <Text class="text-blue-300">
                    {{ blogPost.taskRule }}
                  </Text>
                </div>
              </div>
              <div v-if="switchDisable()" class="flex justify-center ">
                <UButton :label="$t('Join Task')" @click="openJoin" />
              </div>
            </div>
            <div>
              <div class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex ">
                  <Text class=" mr-8 text-blue-300">
                    {{ $t("Quests Form") }}:
                  </Text>
                  <UInput v-model="q" placeholder="Filter..." />
                </div>
<!--                <div v-if="switchDisable()" class="flex justify-center ">-->
<!--                  <UButton :label="$t('Join Task')" @click="openModal" />-->
<!--                </div>-->
              </div>
              <UTable :rows="filteredRows" :columns="columns" />
            </div>
            <div v-if="switchDisable()" class="flex justify-center my-8">
              <div class="mx-4">
                <UButton :label="$t('Submit')" @click="openModal" />
              </div>
              <div class="mx-4">
                <UButton :label="$t('Send Bounty')" />
              </div>

            </div>
            <div class="flex ...">
              <div class="flex-none w-60">
                <Text class=" text-blue-300">
                  {{ $t("Rules of Judgment") }}:
                </Text>
              </div>
              <div>
                <Text class="text-blue-300">
                  <p> 1 Total score is 100 including Brand 10%, Friends 40%, Audience 50% </p>

                  <p> 2 Brand is decided by your avatar,  change it you’ll get 10, not change get 0 </p>

                  <p> 3 Friends is decided by the amount of new friends you invited </p>

                  <p> 4 Popularity is decided by the amount of audience in your Twitter Space </p>

                  <p> 5 The person with the highest data gets the maximum scores including Brand, Friends and Popularity </p>

                  <p> 6 Everyone will have a total score, it decide the amount of your bounty </p>

                  <p> 7 If the total chances are 20 but you are in 21st, sorry you can get nothing </p>

                  <p> 8 You can only participate this Quests once </p>
                </Text>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </UPage>
    <UModal v-model="isOpenJoin">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Join Task") }}
            </h3>
            <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="isOpenJoin = false"
            />
          </div>
        </template>
        <div v-if="!isSettlementOpen" class="space-y-2">
          <p>
            {{ $t("We appreciate your support,Please follow the rules of the quest and submit the URL back to this page") }}
          </p>
          <UButton @click="onClick">
            {{ $t('I have read all rules') }}
          </UButton>
        </div>
      </UCard>
    </UModal>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t("Join Task") }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>
        <div>
          <div class="my-8">
            <UInput v-model="addr" color="primary" variant="outline" :placeholder="$t('Wallet Address')" />
          </div>
          <div class="my-8">
            <UInput v-model="url" color="primary" variant="outline" :placeholder="$t('Space Url')" />
          </div>
          <div class="flex justify-center my-8">
            <UButton @click="joinTask">
              {{ $t("Submit") }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
