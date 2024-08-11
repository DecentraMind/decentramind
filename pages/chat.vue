<script setup lang="ts">
import type { Mail } from '~/types'

const { currentUuid, communityUser, chatBanuser, exitCommunity, getLocalCommunity, getCommunityUser, banChat, unbanChat, getBan } = $(aoCommunityStore())
//let communityInfo = $ref<Awaited<ReturnType<typeof getLocalCommunity>>>()
let communityInfo = $ref({})
const { address } = $(aoStore())

useSeoMeta({
  title: 'AO Chat'
})

const selectedTab = $ref(0)

const { stateArr: mails } = $(inboxStore())

// Filter mails based on the selected tab
const filteredMails = $computed(() => {
  if (selectedTab === 1) {
    return mails.filter(mail => !!mail.unread)
  }

  return mails
})

let selectedMail = $ref<Mail | null>()

const route = useRoute()
const slug = $computed(() => route.params.slug)
watchEffect(() => {
  if (!filteredMails?.find(mail => mail.id === selectedMail?.id)) {
    selectedMail = null
  }

  if (!route.params.pid) {
    if (mails.length > 0) {
      navigateTo(`/chat/${mails[0].id}`)
    }
  }
})

const loadCommunityInfo = async (pid: string) => {
  try {
    communityInfo = await getLocalCommunity(pid)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

let communityuser = $ref({})

let chatID = $ref<string | string[] | null>(null)

onMounted( () => {
  if (!address) {
    router.push('/')
  }
  if (!route.params.pid) return
  chatID = route.params.pid
})
onMounted(async () => {
  console.log('--------------test')
  await loadCommunityInfo(currentUuid)
  await getBan()
  const result = await getCommunityUser(communityInfo.uuid)
  console.log('---------------')
  console.log(result)
  if (result && result.Messages && result.Messages.length > 0) {
    const dataStr = result.Messages[0].Data

    try {

      communityuser = JSON.parse(dataStr)
      console.log(communityuser)
      for (let key in communityuser) {
        if (communityuser.hasOwnProperty(key)) {
          try {
            // 解析每个键的JSON字符串
            communityuser[key] = JSON.parse(communityuser[key])
          } catch (e) {
            console.error(`Failed to parse JSON for key ${key}:`, e)
          }
        }
      }
      // You can further process the dataJson here
    } catch (error) {
      console.error('Error parsing JSON:', error)
    }
  } else {
    console.error('No messages found in result')
  }
})


const textToCopy = $ref('')
const copySuccess = $ref(false)

const copyText = async () => {
  try {
    // Copy text with navigator.clipboard.writeText
    await navigator.clipboard.writeText(textToCopy.innerText)
    // Hide the alert message after a certain period of time after successful copying
  } catch (err) {
    console.error('Code Failed: ', err)
  }
}

let Leaveout = $ref(false)

let exitButton = $ref(false)
let banButton =$ref(false)
let unbanButton =$ref(false)
const router = useRouter()



const quitCommunity = async(communityuuid: any) => {
  Leaveout = true
  try {
    await exitCommunity(communityuuid)
    console.log('exitCommunity 操作成功')
    Leaveout = false
    router.push('/discovery')
  } catch (error) {
    alert('exitCommunity Fail:', error)
  } finally {
    Leaveout = false
  }
}

const formattedTwitterLink = (twitter) => {
  const link = twitter
  // Add https:// prefix if the link doesn't start with http:// or https://
  if (!/^(http|https):\/\//.test(link)) {
    return `https://${link}`
  }
  return link
}

let currentUser = $ref('')
let Forbid = $ref(false)

let showButton = $ref(false);

const OpenBan = (index) => {
  banButton = true
  currentUser = index
}
const banSure = async() => {
  Forbid = true
  await banChat(currentUuid, currentUser)
  Forbid = false
  banButton = false
}

let unForbid = $ref(false)
const OpenunBan = (index) => {
  unbanButton = true
  currentUser = index
}
const unbanSure = async() => {
  unForbid = true
  await unbanChat(currentUuid, currentUser)
  await getBan()
  unForbid = false
  unbanButton = false
}

const isUserBanned = (userAddress) => {
  return chatBanuser[currentUuid] && chatBanuser[currentUuid].includes(userAddress);
}
const test = async() => {
  console.log('test')
  const a = isUserBanned('8Ys7hXzLXIk4iJvaCzYSeuoCcDjXF0JBQZSRfiktwfw')
  console.log(a)
}
</script>

<template>
  <div class="flex w-full">
    <UDashboardPanel :width="420" :resizable="{ min: 0, max: 420 }" collapsible>
      <UDashboardSidebar>
        <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
        <!--<div v-for="Info in communityInfo" :key="Info.uuid">-->
        <div class="pt-8">
          <div class="flex justify-between  my-3 items-center">
            <div class="text-3xl">{{ communityInfo.name }}</div>
            <div>
              <UButton color="white" variant="solid" :to="`/community/detail/${currentUuid}`">
                {{ $t('View Details') }}
              </UButton>
            </div>
          </div>

          <UDivider />

          <div class="flex justify-between my-3 mt-5 items-center">
            <div>{{ $t('WebsiteOfCommunityDetail') }}</div>
            <div>
              <div class="flex justify-center border rounded-lg w-full pl-2 pr-2">
                {{ communityInfo.website }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('SocialOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(communityInfo.twitter)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton variant="link">
                  <UIcon name="ri:twitter-line" class="h-full w-full " />
                  Twitter
                </UButton>
              </ULink>
            </div>
          </div>
          <div class="flex justify-between my-3 mt-10 items-center">
            <div >{{ $t('TokenOfCommunityDetail') }}</div>
            <div v-if="communityInfo.communitytoken && communityInfo.communitytoken.length > 0" class="flex space-x-3">
              <div
                v-for="(token, index) in communityInfo.communitytoken.slice(0,2)"
                :key="index"
                class="flex justify-center border rounded-lg w-full pl-2 pr-2"
              >
                {{ token.tokenName }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('Trading Support') }}</div>
            <div v-if="communityInfo.support && communityInfo.support.length > 0" class="flex space-x-3">
              <div
                v-for="(token, index) in communityInfo.support.slice(0,2)"
                :key="index"
                class="flex justify-center border rounded-lg w-full pl-2 pr-2"
              >
                {{ token }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('GithubOfCommunityDetail') }}</div>
            <div>
              <ULink
                :to="formattedTwitterLink(communityInfo.github)"
                active-class="text-primary"
                target="_blank"
                inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <UButton to="www.github.com" variant="link">
                  <UIcon name="ri:github-line" class="h-full w-full " />
                  Github
                </UButton>
              </ULink>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('BuilderNumberOfCommunityDetail') }}</div>
            <div>{{ communityInfo.buildnum }}</div>
          </div>
          <div v-if="communityInfo.creater !== address" class="flex">
            <UButton
              color="white"
              variant="solid"
              class="ml-auto mt-10"
              @click="exitButton = true"
            >
              {{ $t('Quit') }}
              <UIcon name="bi:arrow-left-circle" />
            </UButton>
          </div>
        </div>
        <UDivider />

        <div class="flex-1" />
        <div v-if="communityInfo.creater == address" class="flex">
          <UButton class="ml-auto" variant="ghost" icon="heroicons:cog-6-tooth" @click="communitySetting = true" />
        </div>
        <UPopover mode="hover" :popper="{ placement: 'top' }">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button class="center-text border rounded-lg w-full">Invite people</Button>
          <template #panel>
            <div class="p-4 ">
              <div>Invite Url: </div>
              <div class="flex items-center">
                <p ref="textToCopy">
                  dm-demo.vercel.app/invite/?community={{ communityId }}&invitor={{ address }}
                </p>
                <UButton icon="carbon:align-box-bottom-right" variant="ghost" @click="copyText" />
              </div>
            </div>
          </template>
        </UPopover>
        <NuxtLink :to="`/community/${communityInfo.uuid}`">
          <Button class="center-text border rounded-lg w-full">Quests Home</Button>
        </NuxtLink>
        <Button class="center-text border rounded-lg bg-black text-white">Chatroom</Button>

        <UDivider class="bottom-0 sticky" />
      </UDashboardSidebar>
    </UDashboardPanel>
    <UPage class="w-full">
      <!--<UContainer class="w-full">-->
      <UPageGrid class="w-full h-full">
        <div class="flex col-span-2 w-full h-full ml-6">
          <div v-if="chatID" class="w-full mr-2">
            <InboxMail :mail="chatID" class="" />
          </div>
          <UDivider orientation="vertical" />
        </div>
        <div class="pt-2 pr-10 pl-2">
          <UDashboardNavbar title="Users" :ui="{ badge: { size: 'lg'}}" :badge="Object.keys(communityUser).length">
            <template #title>
              <Text class="text-3xl">
                User
              </Text>
            </template>
          </UDashboardNavbar>
          <div class="pt-2 pl-2">
            <div v-for="(user, index) in communityUser" :key="index" class="flex items-center justify-between pr-20">
              <div
                class="relative flex items-center justify-between overflow-hidden"
                @mouseenter="showButton = true"
                @mouseleave="showButton = false"
              >
                <div class="flex items-center">
                  <div class="mr-3">
                    <UAvatar v-if="user[0].avatar == 'N/A'" size="xl" src="/community/chatavatar.jpg"/>
                    <UAvatar v-else size="lg" :src="user[0].avatar"/>
                  </div>
                  <div class="flex text-2xl">
                    <div v-if="user[0].name == 'N/A'" class="text-center">User</div>
                    <div v-else class="text-center">{{ user[0].name }}</div>
                  </div>
                </div>
                <transition
                  enter-active-class="transition-all duration-300 ease-out"
                  leave-active-class="transition-all duration-300 ease-in"
                  enter-from-class="translate-x-full opacity-0"
                  enter-to-class="translate-x-0 opacity-100"
                  leave-from-class="translate-x-0 opacity-100"
                  leave-to-class="translate-x-full opacity-0"
                >
                  <UButton
                    v-show="showButton && communityInfo.creater === address"
                    :color="isUserBanned(index) ? 'gray' : 'gray'"
                    variant="solid"
                    @click="isUserBanned(index) ? OpenunBan(index) : OpenBan(index)"
                    class="absolute right-0 top-1/2 transform -translate-y-1/2"
                  >
                    {{ isUserBanned(index) ? 'unmute' : 'mute' }}
                  </UButton>
                </transition>
              </div>
            </div>
            <!--<UButton @click="test">test</UButton>-->
          </div>
        </div>
      </UPageGrid>
      <!--</UContainer>-->
    </UPage>

    <UModal v-model="exitButton">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to Exit?
        </div>
        <div v-if="!Leaveout" class="w-full flex space-x-10 mt-6">
          <UButton @click="exitButton = false">No</UButton>
          <UButton @click="quitCommunity(currentUuid)">Yes</UButton>
        </div>
        <div v-else class="h-[80px] flex flex-col items-center justify-center">
          <Text>Leave...</Text>
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>
    <UModal v-model="banButton">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to Mute?
        </div>
        <div v-if="!Forbid" class="w-full flex space-x-10 mt-6 justify-between">
          <UButton
            variant="outline"
            @click="exitButton = false">
            No
          </UButton>
          <UButton
            variant="outline"
            @click="banSure"
          >
            Yes
          </UButton>
        </div>
        <div v-else class="h-[80px] flex flex-col items-center justify-center">
          <Text>Mute...</Text>
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>
    <UModal v-model="unbanButton">
      <UCard class="min-w-[300px] flex justify-center">
        <div class="w-full flex justify-center text-2xl">
          Sure to unMute?
        </div>
        <div v-if="!unForbid" class="w-full flex space-x-10 mt-6 justify-between">
          <UButton
            variant="outline"
            @click="exitButton = false">
            No
          </UButton>
          <UButton
            variant="outline"
            @click="unbanSure"
          >
            Yes
          </UButton>
        </div>
        <div v-else class="h-[80px] flex flex-col items-center justify-center">
          <Text>unMute...</Text>
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>
  </div>
</template>
