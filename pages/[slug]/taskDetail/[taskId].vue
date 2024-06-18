<script setup lang="ts">

import CommonAlert from '~/components/CommonAlert.vue'
import {taskStore} from '../../../stores/taskStore'
import {createDataItemSigner, spawn} from "@permaweb/aoconnect";
import {shortAddress} from "../../../utils/web3";
import {ssimStore} from '~/stores/ssimStore'
const { t } = useI18n()
const { allInviteInfo, getAllInviteInfo, makecommunityChat, updateTaskSubmitInfoAfterCal, updateTaskAfterCal, getTaskById, submitSpaceTask, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo } = $(taskStore())
const { getLocalcommunityInfo, userInfo } = $(aocommunityStore())
// 用户钱包地址
const { address } = $(aoStore())
const { compareImages } = $(ssimStore())
const route = useRoute()
const taskId = $computed(() => route.params.taskId)
const slug = $computed(() => route.params.slug)

let blogPost = $ref({})
blogPost = await getTaskById(taskId)
console.log('blogPost = ' + JSON.stringify(blogPost))
let communityId = blogPost.communityId
let isOwner = blogPost.ownerId === address
let taskJoinRecord = $ref({})
taskJoinRecord = await getTaskJoinRecord(taskId)

let spaceTaskSubmitInfo = $ref({})
const communityInfo = await getLocalcommunityInfo(communityId)
spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
console.log('spaceTaskSubmitInfo = ' + JSON.stringify(spaceTaskSubmitInfo))
let checkSubmit = () => {
  for (let index = 0; index < spaceTaskSubmitInfo.length; index++) {
    const element = spaceTaskSubmitInfo[index]
    if(element.address === address){
      return true
    }
  }
  return false
}
let checkJoin = () => {
  for (let index = 0; index < taskJoinRecord.length; index++) {
    const element = taskJoinRecord[index]
    if(element.joinedAddress === address){
      return true
    }
  }
  return false
}
let isSubmitted = $ref()
let isJoined = $ref()
isJoined = checkJoin()
isSubmitted = checkSubmit()
let joinStatus = $ref('')
let submiteStatus = $ref('')
submiteStatus = isSubmitted ? t("task.isjoin") : t("Not Join")
joinStatus = isJoined ? t("task.isjoin") : t("Not Join")
// console.log('taskJoinRecord = ' + JSON.stringify(taskJoinRecord))
// console.log('isJoined = ' + isJoined)
// console.log('chatProcessId = ' + chatProcessId)

onMounted(async () => {
  let isBegin = blogPost.isBegin
  let isSettle = blogPost.isSettle
  let isCal = blogPost.isCal
  if(isBegin && isSettle && isCal && isCal === 'N' && isBegin === 'N' && isSettle === 'N'){
    // 计算分数
    if(spaceTaskSubmitInfo.length != 0){
      calculateScore()
      console.log(taskId)
      // 更新任务状态和已提交信息
      await updateTaskAfterCal(taskId)
      await updateTaskSubmitInfoAfterCal(taskId, spaceTaskSubmitInfo)
    }
  }
  // calculateScore()
  // console.log('after cal spaceTaskSubmitInfo = ' + spaceTaskSubmitInfo)
  // await updateTaskSubmitInfoAfterCal(taskId, spaceTaskSubmitInfo)
  // blogPost = await getTaskById(taskId)
  // console.log('blogPost = ' + JSON.stringify(blogPost))
  console.log(isBegin)
  console.log(isSettle)
  console.log(isCal)
  await getAllInviteInfo()
})
// spaceTaskSubmitInfo = people
function calculateScore(){
  console.log(spaceTaskSubmitInfo.length)

  // 找到friends和audience的最大值
  spaceTaskSubmitInfo.sort((a, b) => b.getPerson - a.getPerson)
  let getPersionMax = spaceTaskSubmitInfo[0].getPerson
  spaceTaskSubmitInfo.sort((a, b) => b.audience - a.audience)
  let audienceMax = spaceTaskSubmitInfo[0].audience
  console.log('getPersionMax = ' + getPersionMax)
  console.log('audienceMax = ' + audienceMax)
  let totalScore = 0
  let totalReward = 1000
  let friendScore = 0
  let audienceScore = 0
  for(var i = 0; i < spaceTaskSubmitInfo.length; ++i) {
    if(getPersionMax != 0){
      friendScore = spaceTaskSubmitInfo[i].getPerson / getPersionMax * 40
    }
    if(audienceMax != 0){
      audienceScore = spaceTaskSubmitInfo[i].audience / audienceMax * 50
    }
    let brandScore = 0
    if(spaceTaskSubmitInfo[i].brandEffect === 10){
      brandScore = 10
    }
    console.log('friendScore = ' + friendScore)
    console.log('audienceScore = ' + audienceScore)
    console.log('brandScore = ' + brandScore)
    spaceTaskSubmitInfo[i].score = friendScore + audienceScore + brandScore
    console.log('spaceTaskSubmitInfo[i].score = ' + spaceTaskSubmitInfo[i].score)
    totalScore += spaceTaskSubmitInfo[i].score
  }
  console.log('totalScore = ' + totalScore)
  for(var i = 0; i < spaceTaskSubmitInfo.length; ++i) {
    if(blogPost.tokenNumber){
      spaceTaskSubmitInfo[i].bounty1 = (spaceTaskSubmitInfo[i].score / totalScore * Number(blogPost.tokenNumber)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType1 = blogPost.tokenType
      spaceTaskSubmitInfo[i].bounty = (spaceTaskSubmitInfo[i].bounty1 / 1e12 ).toString() + spaceTaskSubmitInfo[i].bountyType1
    }
    if(blogPost.tokenNumber1){
      spaceTaskSubmitInfo[i].bounty2 = (spaceTaskSubmitInfo[i].score / totalScore * Number(blogPost.tokenNumber1)).toFixed(4)
      spaceTaskSubmitInfo[i].bountyType2 = blogPost.tokenType1
      spaceTaskSubmitInfo[i].bounty = spaceTaskSubmitInfo[i].bounty + '+' + (spaceTaskSubmitInfo[i].bounty2 / 1e12 ).toString() + spaceTaskSubmitInfo[i].bountyType2
    }

    // console.log('bounty = ' + spaceTaskSubmitInfo[i].score / totalScore * 100)
  }
  // 计算完成后更新AO侧数据和前端表单数据
  console.log(JSON.stringify(spaceTaskSubmitInfo))
}

async function calculate() {
  // await makecommunityChat(blogPost.processId)
  await makecommunityChat('4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw')
}

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
const error_msg = 'Please bound your twitter account！'
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
  blogPost = await getTaskById(taskId)
  taskJoinRecord = await getTaskJoinRecord(taskId)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isJoined = checkJoin()
  isOpenJoin = false
}
function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.length === 0 || str.length == undefined
}


const emit = defineEmits(['success'])
const url = $ref('')
let submitLoading = $ref(false)
async function submitTask() {
  submitLoading = true
  for(let i = 0; i < spaceTaskSubmitInfo.length; i++){
    if(spaceTaskSubmitInfo[i].address === address){
      alert('You have submitted this quest.')
      return
    }
  }
  // TODO 调用提交space链接并解析方法
  var splitted = url.split('/', 6)
  console.log(splitted)
  // await testCallJava()
  // 直接在vue中请求api接口 拿到需要的信息
  const query = computed(() => ({ spaceId: splitted[splitted.length - 1]}))
  const { data } = await useFetch('/api/twitter', { query })
  console.log('data = ' + JSON.stringify(data))
  // space开始时间 从开始时间往前推24小时，统计邀请数量 记作friend参数
  const spaceEnded_at = data._rawValue.data.ended_at
  // space参与人数
  const participanted = data._rawValue.data.participant_count
  // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
  const userAvatar = data._rawValue.includes.users[0].profile_image_url
  // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
  const userCreatedAt = data._rawValue.includes.users[0].created_at
  // space创办人的ID 用于判断是否是本人提交任务
  const userId = data._rawValue.includes.users[0].id
  // const userAvatarBase64 = await url2Base64(userAvatar)
  const ssim = await compareImages(communityInfo.logo,  userAvatar)
  // 品牌效应
  const brandEffect = ssim >= 0.8 ? 10 : 0
  // 听众
  const audience = participanted
  // 邀请人数 TODO 待完善方法，先设置默认值走下去
  let getPersion = 0
  if(allInviteInfo && allInviteInfo.length != 0){
    for(let i = 0; i < allInviteInfo.length; ++i){
      const temp = allInviteInfo[i]
      if(temp.userId === address && temp.communityId === communityId && temp.inviteTime < new Date(spaceEnded_at).getTime()){
        getPersion = getPersion + 1
      }
    }
  }
  console.log('spaceEnded_at = ' + spaceEnded_at)
  console.log('participanted = ' + participanted)
  console.log('userAvatar = ' + userAvatar)
  console.log('userCreatedAt = ' + userCreatedAt)
  console.log('userId = ' + userId)
  // console.log('brand = ' + brandEffect)
  // console.log(communityInfo.logo)
  // console.log(userAvatarBase64)
  await submitSpaceTask(taskId, address, url, brandEffect, getPersion, audience)
  spaceTaskSubmitInfo = await getSpaceTaskSubmitInfo(taskId)
  isSubmitted = checkSubmit()
  submiteStatus = isSubmitted ? t("task.isjoin") : t("Not Join")
  submitLoading = false
  isOpen = false
}

const selected = $ref([])

function select (row) {
  const index = selected.findIndex((item) => item.id === row.id)
  if (index === -1) {
    selected.push(row)
  } else {
    selected.splice(index, 1)
  }

}
// $watch(() => selected, (newValue, oldValue) => {
//   console.log(selected.length)
//   if(selected.length > 1){
//     alert('Your selected is bigger than Total Chances')
//   }
// })

async function sendBountyByAo() {
  // if(blogPost.isCal === 'Y' && blogPost.isSettle === 'N'){
  if(blogPost.isCal === 'Y'){
    let bounties = []
    if(selected.length != 0){

      for(let i = 0; i < selected.length; ++i){
        let address = selected[i].address
        for(let j = 0; j < spaceTaskSubmitInfo.length; ++j){
          if(address === spaceTaskSubmitInfo[j].address){
            console.log(spaceTaskSubmitInfo[j].bounty1)
            console.log(spaceTaskSubmitInfo[j].bounty2)
            if(spaceTaskSubmitInfo[j].bounty1 && spaceTaskSubmitInfo[j].bounty1 != 0){
              const bountyData = {
                walletAddress: address,
                tokenNumber: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty1)),
                tokenType: spaceTaskSubmitInfo[j].bountyType1
              }
              bounties.push(bountyData)
            }
            if(spaceTaskSubmitInfo[j].bounty2 && spaceTaskSubmitInfo[j].bounty2 != 0){
              const bountyData = {
                walletAddress: address,
                tokenNumber: Math.floor(parseInt(spaceTaskSubmitInfo[j].bounty2)),
                tokenType: spaceTaskSubmitInfo[j].bountyType2,
              }
              bounties.push(bountyData)
            }
            break
          }
        }
      }
    }

    console.log('selected = ' + JSON.stringify(bounties))
    await sendBounty(blogPost.processId, bounties)
    // await sendBounty('Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I', bounties)
  }else{
    alert('This quest is not calculate store or has settled.')
  }

}
const makeConsole = () => {
  console.log(JSON.stringify(selected))
}
const finalStatus = (isBegin: string) => {
  console.log('isB = ' + isBegin)
  let res = ''
  if(isBegin === 'NS')
    res = t('Not Start')
  else if(isBegin === 'Y'){
    res = t('Ing')
  }else {
    res = t('End')
  }
  console.log('res = ' + res)
  return res
}
</script>

<template>
  <UDashboardPage>
    <UPage class="overflow-y-auto h-full w-full">
      <div class="w-full overflow-y-auto h-full ">
        <div class="flex justify-end mb-4">
          <div class="ml-3">
            <NuxtLink :to="`/${slug}/tasks/${communityId}`">
              <UButton icon="i-heroicons-x-mark-20-solid" color="white" variant="solid" size="lg"/>
            </NuxtLink>
          </div>
        </div>
        <!--
        <div class="mx-10">
          <UColorModeImage :src="`/task/${blogPost.image}.jpg`" class="w-full max-h-[300px] min-h-[200px] h-[250px]" />
        </div>
        -->
        <UBlogPost :key="blogPost.id" :description="blogPost.description" class="p-10">
          <template #title>
            <div class="flex justify-start">
              <div class="flex-none w-60"><div>{{ blogPost.name }}</div></div>
              <div class="flex justify-start">
                <div>
                  <UBadge color="black" variant="solid">
                    {{ finalStatus(blogPost.isBegin)}}
                  </UBadge>
                </div>
                <div v-if="isSubmitted" class="mx-2">
                  <UBadge color="black" variant="solid">
                    {{ submiteStatus }}
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
              <div>
                {{ blogPost.description }}
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Time Zone") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.zone }}
                  </div>
                </div>
              </div>
              <div class="flex ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Time") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.startTime }} - {{ blogPost.endTime }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Bounty") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.reward }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("Total Chances") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.rewardTotal }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start ...">
                <div class="flex-none w-60">
                  <div>
                    {{ $t("builders now") }}:
                  </div>
                </div>
                <div>
                  <div>
                    {{ blogPost.joined }}
                  </div>
                </div>
              </div>
              <div class="flex justify-start">
                <div class="flex-none w-60 ">
                  <div>
                    {{ $t("Rules of the Quest") }}:
                  </div>
                </div>
                <div>
                  <div style="white-space: pre-line">
                    {{ blogPost.taskRule }}
                  </div>
                </div>
              </div>
              <div v-if="!isJoined" class="flex justify-center ">
                <UButton color="white" :label="$t('Join Quest')" @click="openJoin" />
              </div>
            </div>
<!--            <UDivider class="mt-4" />-->
            <div class="mt-8">
              <div class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex ">
                  <div class=" mr-8">
                    {{ $t("Quests Form") }}:
                  </div>
                  <UInput v-model="q" placeholder="Filter..." />
                </div>
              </div>
              <UTable v-if="isJoined" v-model="selected" :rows="filteredRows" :columns="columns" @select="select">
                <template #address-data="{ row }">
                  {{ isOwner ? row.address : shortAddress(row.address)}}
                </template>
                <template #url-data="{ row }">
                  {{ isOwner ? row.url : shortAddress(row.url)}}
                </template>
              </UTable>
            </div>
            <div v-if="isJoined" class="flex justify-center my-8">
              <div class="mx-4">
                <UButton color="white" label="test1" @click="makeConsole" />
              </div>
              <div class="mx-4">
                <UButton color="white" :label="$t('Submit Quest')" @click="openModal" />
              </div>
<!--              <div class="mx-4">-->
<!--                <UButton color="white" label="load lua" @click="calculate" />-->
<!--              </div>-->
              <div v-if="isOwner" class="mx-4">
                <UButton color="white" :label="$t('Send Bounty')" @click="sendBountyByAo"/>
              </div>
            </div>
            <div class="flex mt-4">
              <div class="flex-none w-60">
                <div>
                  {{ $t("Rules of Judgment") }}:
                </div>
              </div>
              <div>
                <div>
                  <p> 1 Total score is 100 including Brand 10%, Friends 40%, Audience 50% </p>

                  <p> 2 Brand is decided by your avatar,  change it you’ll get 10, not change get 0 </p>

                  <p> 3 Friends is decided by the amount of new friends you invited </p>

                  <p> 4 Popularity is decided by the amount of audience in your Twitter Space </p>

                  <p> 5 The person with the highest data gets the maximum scores including Brand, Friends and Popularity </p>

                  <p> 6 Everyone will have a total score, it decide the amount of your bounty </p>

                  <p> 7 If the total chances are 20 but you are in 21st, sorry you can get nothing </p>

                  <p> 8 Yout only have 1 chance for this quest </p>
                </div>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </UPage>
    <UModal v-model="isOpenJoin">
      <UCard>
<!--        <template #header>-->
<!--          <div class="flex items-center justify-center">-->
<!--            <div class="flex justify-center">-->
<!--              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">-->
<!--                {{ $t("Join Quest") }}-->
<!--              </h3>-->
<!--            </div>-->
<!--            &lt;!&ndash;-->
<!--              <UButton-->
<!--                color="gray"-->
<!--                variant="ghost"-->
<!--                icon="i-heroicons-x-mark-20-solid"-->
<!--                class="-my-1"-->
<!--                @click="isOpenJoin = false"-->
<!--              />-->
<!--              &ndash;&gt;-->
<!--          </div>-->
<!--        </template>-->
        <div class="space-y-2">
          <div class="flex flex-col justify-center">
            <div class="flex justify-center items-center">Thank u for your support.</div>
            <div class="flex justify-center items-center" style="text-align: center;">
              {{ $t("We appreciate your support,Please follow the rules of the quest and submit the URL back to this page") }}
            </div>
          </div>

          <div class="flex justify-center">
            <UButton color="white" @click="onClick">
              {{ $t('I have read all rules') }}
            </UButton>
          </div>
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
            <UButton :disabled="submitLoading" @click="submitTask">
              {{ $t("Submit Quest") }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UDashboardPage>
</template>
