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
      label: t('Task Area'),
      icon: 'i-heroicons-plus',
      to: `/${slug}/tasks`,
    },
    {
      label: 'Invite people',
      icon: 'i-heroicons-plus',
      to: `/${slug}/settings/communityinfo`,
    },
    {
      label: 'Chat Room',
      to: `/${slug}/inbox`,
    },
  ]
})

let communityInfo = $ref({})
let communityInfoJson = $ref({})
const loadCommunityInfo = async (pid) => {
  try {
    communityInfo = await getCommunityInfo(pid)
    const jsonData = communityInfo.Messages[0].Data
    const jsonObjects = jsonData.match(/\{.*?\}/g)
    communityInfoJson = jsonObjects.map((item) => JSON.parse(item))
    console.log("-------------", communityInfoJson)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}



let chatID = $ref<string | string[] | null>(null)
const test = () => {
  console.log("-------nnn")
  if (!route.params.pid) return
  console.log(chatID)
}
onMounted( () => {
  if (!route.params.pid) return
  chatID = route.params.pid
})
onMounted(async () => {
  await loadCommunityInfo("798e6573-7cac-4575-8ed1-e638bd2a4e41")
})
</script>

<template>
  <div class="flex w-full">
    <UDashboardPanel :width="350" collapsible>
      <UDashboardSidebar>
        <UColorModeImage :light="light" :dark="dark" class="h-[80px]" />
        <div v-for="Info in communityInfoJson" :key="Info.uuid">
          <div class="flex justify-between  my-3 items-center">
            <div class="text-3xl">{{ Info.name }}</div>
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
              <UBadge color="primary" variant="soft" size="lg">
                {{ Info.website }}
              </UBadge>
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
            <div>
              <UBadge color="primary" variant="soft" size="lg">
                USDC
              </UBadge>
            </div>
          </div>
          <div class="flex justify-between my-3 items-center">
            <div>{{ $t('Trading Support') }}</div>
            <div>
              <UBadge color="primary" variant="soft" size="lg">
                OKE
              </UBadge>
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
            <div>10</div>
          </div>
        </div>
        <UDivider />

        <!--      <UDashboardSidebarLinks :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
        <!--        @update:links="(colors) => (defaultColors = colors)" />-->

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="bottom-0 sticky" />
          <!--
        <template #footer>
          <UserDropdown />
        </template>
        -->

      </UDashboardSidebar>
    </UDashboardPanel>
    <UPage>
      <UContainer>
        <UPageGrid>
          <!--
          <UAside class="border rounded-md  border-1 border-gray-600">
            <InboxList v-model="selectedMail" :mails="filteredMails" />
          </UAside>
          -->
          
      
          <div class="flex xl:col-span-2">
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
              <InboxMail :mail="chatID" class="mt-10 w-[1000px]" />
            </div>
            <UMain v-else class="flex-1 hidden items-center justify-center lg:flex">
              <UIcon name="i-heroicons-inbox" class="h-32 text-gray-400 w-32 dark:text-gray-500" />
            </UMain>
          </div>
        </UPageGrid>
      </UContainer>
    </UPage>
  </div>
</template>
