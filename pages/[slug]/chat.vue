<script setup lang="ts">
import type { Mail } from '~/types'

const { currentUuid, getLocalcommunityInfo, getCommunityuser } = $(aocommunityStore())
let communityInfo = $ref({})
let communityInfoJson = $ref({})

const { t } = useI18n()

useSeoMeta({
  title: 'AO Chat'
})

const tabItems = [{
  label: 'All'
}, {
  label: 'Unread'
}]
const selectedTab = $ref(0)

const dropdownItems = [[{
  label: 'Mark as unread',
  icon: 'i-heroicons-check-circle'
}, {
  label: 'Mark as important',
  icon: 'i-heroicons-exclamation-circle'
}], [{
  label: 'Star thread',
  icon: 'i-heroicons-star'
}, {
  label: 'Mute thread',
  icon: 'i-heroicons-pause-circle'
}]]


const { stateArr: mails } = $(inboxStore())

// Filter mails based on the selected tab
const filteredMails = $computed(() => {
  if (selectedTab === 1) {
    return mails.filter(mail => !!mail.unread)
  }

  return mails
})

let selectedMail = $ref<Mail | null>()

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail
  },
  set(value: boolean) {
    if (!value) {
      selectedMail = null
    }
  }
})

const route = useRoute()
const slug = $computed(() => route.params.slug)
watchEffect(() => {
  if (!filteredMails?.find(mail => mail.id === selectedMail?.id)) {
    selectedMail = null
  }

  if (!route.params.pid) {
    if (mails.length > 0) {
      navigateTo(`/${slug}/chat/${mails[0].id}`)
    }
  }
})
const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'
const communityInfo2 = {
  communityName: 'permadao',
  website: 'www.demo.com',
  socialMedia: 'twitter',
  token: 'USDT',
  platform: 'Binance',
  github: 'www.github.com',
  builderNumber: 100
}

const footerLinks = $computed(() => {
  return [
    {
      label: 'Invite people',
      icon: 'i-heroicons-plus',
      to: `/${slug}/settings/communityinfo`,
    },
    {
      label: 'Chat Room',
      icon: 'i-heroicons-plus',
      to: `/${slug}/inbox`,
    },
  ]
})

const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getLocalcommunityInfo(pid)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

let communityuser = $ref({})

let chatID = $ref<string | string[] | null>(null)

onMounted( () => {
  if (!route.params.pid) return
  chatID = route.params.pid
})
onMounted(async () => {
  await loadCommunityInfo(currentUuid)
  const result = await getCommunityuser(communityInfo.uuid)
  if (result && result.Messages && result.Messages.length > 0) {
    const dataStr = result.Messages[0].Data;
    
    try {
      communityuser = JSON.parse(dataStr);
      // You can further process the dataJson here
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  } else {
    console.error('No messages found in result');
  }
})


const textToCopy = $ref('');
const copySuccess = $ref(false);

const copyText = async () => {
  try {
    // Copy text with navigator.clipboard.writeText
    await navigator.clipboard.writeText(textToCopy.innerText);
    // Hide the alert message after a certain period of time after successful copying
  } catch (err) {
    console.error('Code Failed: ', err);
  }
};
</script>

<template>
  <div class="flex w-full">
    <UDashboardPanel :width="420" collapsible>
      <UDashboardSidebar>
        <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
        <!--<div v-for="Info in communityInfo" :key="Info.uuid">-->
        <div class="pt-8">
          <div class="flex justify-between  my-3 items-center">
            <div class="text-3xl">{{ communityInfo.name }}</div>
            <div>
              <UButton color="white" variant="solid" :to="`/${slug}/community-details/${currentUuid}`">
                {{ $t('View Details') }}
              </UButton>
            </div>
          </div>

          <UDivider />

          <div class="flex justify-between my-3 mt-5 items-center">
            <div>{{ $t('WebsiteOfCommunityDetail') }}</div>
            <div>
              <div class="flex justify-center border rounded-lg w-[90px]">
                {{ communityInfo.website }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('SocialOfCommunityDetail') }}</div>
            <div>
              <UButton variant="link">
                <UIcon name="ri:twitter-fill" class="h-full w-full " />
                Twitter
              </UButton>
            </div>
          </div>
          <div class="flex justify-between my-3 mt-10 items-center">
            <div >{{ $t('TokenOfCommunityDetail') }}</div>
            <div class="flex space-x-3">
              <div 
                v-for="(token, index) in communityInfo.communitytoken" 
                :key="index" 
                class="flex justify-center border rounded-lg w-[80px]"
              >
                {{ token.tokenName }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('Trading Support') }}</div>
            <div class="flex space-x-3">
              <div 
                v-for="(token, index) in communityInfo.support" 
                :key="index"
                class="flex justify-center border rounded-lg w-[80px]"
              >
                {{ token }}
              </div>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('GithubOfCommunityDetail') }}</div>
            <div>
              <UButton to="www.github.com" variant="link">
                <UIcon name="ri:github-line" class="h-full w-full " />
                Github
              </UButton>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('BuilderNumberOfCommunityDetail') }}</div>
            <div>{{ communityInfo.buildnum }}</div>
          </div>
          <div class="flex">
            <UButton 
              color="white" 
              variant="solid" 
              class="ml-auto mt-10"
              @click="quitCommunity(communityInfo.uuid)"
            >
              {{ $t('Quit') }}
              <UIcon name="bi:arrow-left-circle" />
            </UButton>
          </div>
        </div>
        <UDivider />

        <div class="flex-1" />
        <div v-if="communityInfo.creater == address" class="flex">
          <UButton class="ml-auto" variant="ghost" icon="quill:cog-alt" @click="communitySetting = true" />
        </div>
        <UPopover mode="hover" :popper="{ placement: 'top' }">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button class="center-text border rounded-lg w-full">Invite people</Button>
          <template #panel>
            <div class="p-4 ">
              <div>Invite Url: </div>
              <div class="flex items-center">
                <p ref="textToCopy">
                  www.dm.com/invite/?{{ communityInfo.uuid }}
                </p>
                <UButton icon="carbon:align-box-bottom-right" variant="ghost" @click="copyText" />
              </div>
            </div>
          </template>
        </UPopover>
        <NuxtLink :to="`/${slug}/tasks/${communityInfo.uuid}`">
          <Button class="center-text border rounded-lg w-full">Quests Home</Button>
        </NuxtLink>
        <Button class="center-text border rounded-lg bg-black text-white">Chatroom</Button>

        <UDivider class="bottom-0 sticky" />
      </UDashboardSidebar>
    </UDashboardPanel>
    <UPage class="w-full">
      <!--<UContainer class="w-full">-->
      <UPageGrid class="w-full h-full">  
        <div class="flex xl:col-span-2 w-full h-full ml-10">
          <div v-if="chatID" class="w-full">
            <InboxMail :mail="chatID" class="" />
          </div>
        </div>
        <div class="pt-10 pr-10 pl-32">
          <UDashboardNavbar title="Users" :ui="{ badge: { size: 'lg'}}" :badge="communityuser.length">
            <template #title>
              <Text class="text-3xl">
                User
              </Text>
            </template>
          </UDashboardNavbar>
          <ULandingCard class="">
            <div v-for="(user, index) in communityuser" :key="index">
              <UDashboardSection
                icon="i-heroicons-user"
                title=""
                :description="user"
                orientation="vertical"
              >
                <template #icon>
                  <UAvatar src="/community/chatavatar.jpg"/>
                </template>
              </UDashboardSection>
            </div>
          </ULandingCard>
        </div>
      </UPageGrid>
      <!--</UContainer>-->
    </UPage>
  </div>
</template>
