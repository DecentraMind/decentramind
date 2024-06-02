<script setup lang="ts">

import CommonAlert from '~/components/CommonAlert.vue'
import {taskStore} from '../../../stores/taskStore'
import {createDataItemSigner, spawn} from "@permaweb/aoconnect";
import {shortAddress} from "../../../utils/web3";
const { t } = useI18n()
const { getTaskById, submitSpaceTask, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo } = $(taskStore())
const { userInfo } = $(aocommunityStore())
// 用户钱包地址
const { address } = $(aoStore())
const route = useRoute()
const taskId = $computed(() => route.params.taskId)

let blogPost = await getTaskById(taskId)
let communityId = blogPost.communityId
let isOwner = blogPost.ownerId === address
let taskJoinRecord = await getTaskJoinRecord(taskId)
let isJoined = () => {
  for (let index = 0; index < taskJoinRecord.length; index++) {
    let element = taskJoinRecord[index]
    if(element.joinedAddress === address){
      return true
    }
  }
  return false
}
let joinStatus = isJoined ? t("task.isjoin") : t("Not Join")
let spaceTaskSubmitInfo = $ref()
spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
// let chatProcessId = await makecommunityChat()
// console.log('spaceTaskSubmitInfo = ' + JSON.stringify(spaceTaskSubmitInfo))
console.log('blogPost = ' + JSON.stringify(blogPost))
// console.log('taskJoinRecord = ' + JSON.stringify(taskJoinRecord))
// console.log('isJoined = ' + isJoined)
// console.log('chatProcessId = ' + chatProcessId)
console.log('userInfo = ' + JSON.stringify(userInfo))

// onMounted(async () => {
//
//   blogPost = await getTaskById(taskId)
//   console.log('blogPost = ' + JSON.stringify(blogPost))
//   console.log(blogPost.name)
// })

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'address',
    label: t('Wallet'),
  },
  {
    key: 'brandEffect',
    label: t('Brand'),
  },
  {
    key: 'getPerson',
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
  {
    key: 'bounty',
    label: t('Bounty'),
  },
]

const q = ref('')


const filteredRows = computed(() => {
  if (!q.value) {
    return spaceTaskSubmitInfo
  }

  return spaceTaskSubmitInfo.filter((info) => {
    return Object.values(info).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

const modal = useModal()

const userinfo = {
  userId: 1,
  userName: 'gqz',
  userTwitter: 'xx',
}
let isSettlementOpen = userinfo.userTwitter
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
async function onClick() {
  //  调用参与任务方法，只计数不提交
  await joinTask(taskId, address)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isOpenJoin = false
}
function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.length === 0 || str.length == undefined
}


const emit = defineEmits(['success'])



const addr = $ref('')
const url = $ref('')
async function submitTask() {
  // TODO 调用提交space链接并解析方法
  submitSpaceTask(taskId, address, url)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isOpen = false
}
async function sendBountyByAo() {
  await sendBounty(["Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg", "jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU"],
    "10",
    "4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw"
  );
}
const selected = $ref([])

function select (row) {
  const index = selected.findIndex((item) => item.id === row.id)
  if (index === -1) {
    selected.push(row)
  } else {
    selected.splice(index, 1)
  }
  console.log("selected = " + JSON.stringify(selected))

}
function returnBackPage() {
  route.back()
}
</script>

<template>
  <UDashboardPage>
    <UPage class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full ">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg" @click="returnBackPage"/>
          </div>
        </div>
        <div class="mx-10">
          <UColorModeImage :src="`/task/${blogPost.image}.jpg`" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>

        <UBlogPost :key="blogPost.id" :description="blogPost.description" class="p-10">
          <template #title>
            <div class="flex justify-start">
              <div class="flex-none w-60"><Text>{{ blogPost.name }}</Text></div>
              <div class="flex justify-start">
                <div>
                  <UBadge color="black" variant="solid">
                    {{ blogPost.status == 'Y'? $t('Ing') : $t('End')}}
                  </UBadge>
                </div>
                <div class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ joinStatus }}
                  </UBadge>
                </div>
                <div v-if="isOwner" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ blogPost.isSettle == 'Y'? $t('Settled') : $t('Unsettled')}}
                  </UBadge>
                </div>
              </div>

              <!-- <UBadge color="green" variant="solid">{{ blogPost.status }}</UBadge>
              <UBadge color="green" variant="solid">{{ blogPost.isJoin }}</UBadge> -->
            </div>
          </template>
          <template #description>
            <div class="flex flex-col space-y-2">
              <Text>
                {{ blogPost.description }}
              </Text>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <Text>
                    {{ $t("Time Zone") }}:
                  </Text>
                </div>
                <div>
                  <Text>
                    {{ blogPost.zone }}
                  </Text>
                </div>
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <Text>
                    {{ $t("Time") }}:
                  </Text>
                </div>
                <div>
                  <Text>
                    {{ blogPost.startTime }} - {{ blogPost.endTime }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text>
                    {{ $t("Bounty") }}:
                  </Text>
                </div>
                <div>
                  <Text>
                    {{ blogPost.reward }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text>
                    {{ $t("Total Chances") }}:
                  </Text>
                </div>
                <div>
                  <Text>
                    {{ blogPost.rewardTotal }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <Text>
                    {{ $t("builders now") }}:
                  </Text>
                </div>
                <div>
                  <Text>
                    {{ blogPost.joined }}
                  </Text>
                </div>
              </div>
              <div class="flex justify-start">
                <div class="flex-none w-60 ">
                  <Text>
                    {{ $t("Rules of the Quest") }}:
                  </Text>
                </div>
                <div>
                  <Text style="white-space: pre-line">
                    {{ blogPost.taskRule }}
                  </Text>
                </div>
              </div>
              <div v-if="!isJoined" class="flex justify-center ">
                <UButton :label="$t('Join Task')" @click="openJoin" />
              </div>
            </div>
<!--            <UDivider class="mt-4" />-->
            <div class="mt-8">
              <div class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex ">
                  <Text class=" mr-8">
                    {{ $t("Quests Form") }}:
                  </Text>
                  <UInput v-model="q" placeholder="Filter..." />
                </div>
              </div>
              <UTable v-model="selected" :rows="filteredRows" :columns="columns" @select="select">
                <template #address-data="{ row }">
                   {{ isOwner ? row.address : shortAddress(row.address)}}
                </template>
              </UTable>
            </div>
            <div v-if="isJoined" class="flex justify-center my-8">
              <div class="mx-4">
                <UButton color="white" :label="$t('Submit')" @click="openModal" />
              </div>
              <div v-if="isOwner" class="mx-4">
                <UButton color="white" :label="$t('Send Bounty')" @click="sendBountyByAo"/>
              </div>
            </div>
            <div class="flex ...">
              <div class="flex-none w-60">
                <Text>
                  {{ $t("Rules of Judgment") }}:
                </Text>
              </div>
              <div>
                <Text>
                  <p> 1 Total score is 100 including Brand 10%, Friends 40%, Audience 50% </p>

                  <p> 2 Brand is decided by your avatar,  change it you’ll get 10, not change get 0 </p>

                  <p> 3 Friends is decided by the amount of new friends you invited </p>

                  <p> 4 Popularity is decided by the amount of audience in your Twitter Space </p>

                  <p> 5 The person with the highest data gets the maximum scores including Brand, Friends and Popularity </p>

                  <p> 6 Everyone will have a total score, it decide the amount of your bounty </p>

                  <p> 7 If the total chances are 20 but you are in 21st, sorry you can get nothing </p>

                  <p> 8 Yout only have 1 chance for this quest </p>
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
        <div class="space-y-2">
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
              {{ $t("Submit Quest") }}
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
<!--          <div class="my-8">-->
<!--            <UInput v-model="addr" color="primary" variant="outline" :placeholder="$t('Wallet Address')" />-->
<!--          </div>-->
          <div class="my-8">
            <UInput v-model="url" color="primary" variant="outline" :placeholder="$t('Space Url')" />
          </div>
          <div class="flex justify-center my-8">
            <UButton @click="submitTask">
              {{ $t("Submit") }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
