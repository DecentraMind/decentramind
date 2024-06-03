<script setup lang="ts">
import type { Mail } from '~/types'

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

// const { data: mails } = await useFetch<Mail[]>('/api/mails', { default: () => [] })

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

const { currentUuid, getLocalcommunityInfo, getCommunityuser } = $(aocommunityStore())
let communityInfo = $ref({})
let communityInfoJson = $ref({})
const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getLocalcommunityInfo(pid)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

let communityuser = $ref({})

let chatID = $ref<string | string[] | null>(null)
const test = () => {
  if (!route.params.pid) return
  const a = getCommunityuser(communityInfo.uuid)
}
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
      // 你可以在这里进一步处理 dataJson
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
    // 使用 navigator.clipboard.writeText 复制文本
    await navigator.clipboard.writeText(textToCopy.innerText);
    // 复制成功后设置一段时间后隐藏提示信息
  } catch (err) {
    console.error('复制失败: ', err);
  }
};
</script>

<template>
  <div class="flex w-full">
    <UDashboardPanel :width="420" collapsible>
      <UDashboardSidebar>
        <UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />
        <!--<div v-for="Info in communityInfo" :key="Info.uuid">-->
        <div>
          <div class="flex justify-between  my-3 items-center">
            <div class="text-3xl">{{ communityInfo.name }}</div>
            <div>
              <UButton color="white" variant="solid" :to="`/${slug}/community-details/${communityId}`">
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

        <!--      <UDashboardSidebarLinks :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
        <!--        @update:links="(colors) => (defaultColors = colors)" />-->

        <div class="flex-1" />
        <div class="flex">
          <UButton class="ml-auto" variant="ghost" icon="lucide:bolt" @click="communitySetting = true" />
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
        <!--<UDashboardSidebarLinks :links="footerLinks" />-->

        <UDivider class="bottom-0 sticky" />
          <!--
        <template #footer>
          <UserDropdown />
        </template>
        -->

      </UDashboardSidebar>
    </UDashboardPanel>
    <UPage class="w-full">
      <!--<UContainer class="w-full">-->
      <UPageGrid class="w-full h-full">
        <!--
        <UAside class="border rounded-md  border-1 border-gray-600">
          <InboxList v-model="selectedMail" :mails="filteredMails" />
        </UAside>
        -->
        
    
        <div class="flex xl:col-span-2 w-full h-full ml-10">
          <div v-if="chatID" class="w-full">
            <!--
              <UDashboardNavbar v-if="false">
                <template #toggle>
                  <UDashboardNavbarToggle icon="i-heroicons-x-mark" />

                  <UDivider orientation="vertical" class="mx-1.5 lg:hidden" />
                </template>

                <template #left>
                  <UTooltip text="Archive">
                    <UButton icon="i-heroicons-archive-box" color="gray" variant="ghost" />
                  </UTooltip>

                  <UTooltip text="to Move junk">
                    <UButton icon="i-heroicons-archive-box-x-mark" color="gray" variant="ghost" />
                  </UTooltip>

                  <UDivider orientation="vertical" class="mx-1.5" />

                  <UPopover :popper="{ placement: 'bottom-start' }">
                    <template #default="{ open }">
                      <UTooltip text="Snooze" :prevent="open">
                        <UButton icon="i-heroicons-clock" color="gray" variant="ghost" :class="[open && 'bg-gray-50 dark:bg-gray-800']" />
                      </UTooltip>
                    </template>

                    <template #panel="{ close }">
                      <DatePicker @close="close" />
                    </template>
                  </UPopover>
                </template>

                <template #right>
                  <UTooltip text="Reply">
                    <UButton icon="i-heroicons-arrow-uturn-left" color="gray" variant="ghost" />
                  </UTooltip>

                  <UTooltip text="Forward">
                    <UButton icon="i-heroicons-arrow-uturn-right" color="gray" variant="ghost" />
                  </UTooltip>

                  <UDivider orientation="vertical" class="mx-1.5" />

                  <UDropdown :items="dropdownItems">
                    <UButton icon="i-heroicons-ellipsis-vertical" color="gray" variant="ghost" />
                  </UDropdown>
                </template>
              </UDashboardNavbar>
              -->
            <InboxMail :mail="chatID" class="" />
          </div>
          <!--
          <UMain v-else class="flex-1 hidden items-center justify-center lg:flex">
            <UIcon name="i-heroicons-inbox" class="h-32 text-gray-400 w-32 dark:text-gray-500" />
          </UMain>
          -->
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
