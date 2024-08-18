<script setup lang="ts">
import { toRefs } from 'vue'
import type { Community } from '~/types/index'
import { communityRightPages } from '~/utils/constants'
import CommunityForm from '~/components/community/CommunityForm.vue'

const props = defineProps<{
  community?: Community
  address: string
}>()
const { community, address } = $(toRefs(props))
const isCommunityOwner = $computed(() => community && address ? community.owner === address : false)

const { exitCommunity, getCommunityList } = $(communityStore())
const { showError, showSuccess } = $(notificationStore())

const router = useRouter()

const isSettingModalOpen = $ref(false)

// eslint-disable-next-line prefer-const
let showExitModal = $ref(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isExiting = $ref(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const quitCommunity = async (communityUuid: string) => {
  if (!community) return
  isExiting = true
  try {
    await exitCommunity(communityUuid)
    showExitModal = false
    isExiting = false
    router.push('/discovery')
    await getCommunityList()
    showSuccess(`You have leaved ${community.name}.`)
  } catch (error) {
    showError('Exit community failed.', error as Error)
  } finally {
    isExiting = false
  }
}

const textToCopy = $ref<HTMLParagraphElement>()

const copyText = async () => {
  try {
    if (!textToCopy) return
    await navigator.clipbo
    ard.writeText(textToCopy.innerText)
    showSuccess('Copied!')
  } catch (err) {
    showError('Copy failed.')
  }
}

const formattedTwitterLink = (twitter: string) => {
  // Add https:// prefix if the link doesn't start with http:// or https://
  if (!/^(http|https):\/\//.test(twitter)) {
    return `https://${twitter}`
  }
  return twitter
}

const shortedWebsite = $computed(() => {
  return community?.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
})

const emit = defineEmits(['switch-right-page'])
</script>
<template>
  <UDashboardPanel :width="420" :resizable="{ min: 0, max: 420 }" collapsible>
    <UDashboardSidebar v-if="community" class="pb-2" :ui="{container: 'p-0'}">
      <!--<UColorModeImage :src="`/task/${communityInfo.banner}.jpg`" :dark="'darkImagePath'" :light="'lightImagePath'" class="h-[80px]" />-->
      <div>
        <div class="flex justify-between items-center h-[calc(var(--header-height))]">
          <div class="max-w-[70%] text-3xl break-all">{{ community.name }}</div>
          <div>
            <UButton
              color="white"
              variant="solid"
              :to="`/community/${community.uuid}/detail`"
            >
              {{ $t('View Details') }}
            </UButton>
          </div>
        </div>

        <UDivider />

        <div
          v-if="community.website"
          class="flex justify-between my-3 mt-5 items-center"
        >
          <div>{{ $t('WebsiteOfCommunityDetail') }}</div>

          <UButton
            variant="link"
            class="text-right border rounded-lg max-w-[60%] overflow-hidden pl-2 pr-2 text-nowrap"
            :title="community.website"
          >
            <a :href="community.website" _target="_blank">{{ shortedWebsite }}</a>
          </UButton>
        </div>

        <div
          v-if="community.twitter"
          class="flex justify-between my-3 items-center"
        >
          <div>{{ $t('SocialOfCommunityDetail') }}</div>
          <div>
            <ULink
              :to="formattedTwitterLink(community.twitter)"
              active-class="text-primary"
              target="_blank"
              inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <UButton variant="link">
                <UIcon name="ri:twitter-line" class="h-5 w-5" />
                Twitter
              </UButton>
            </ULink>
          </div>
        </div>

        <div
          v-if="community.github"
          class="flex justify-between my-3 items-center"
        >
          <div>{{ $t('GithubOfCommunityDetail') }}</div>
          <div>
            <ULink
              :to="formattedTwitterLink(community.github)"
              active-class="text-primary"
              target="_blank"
              inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <UButton variant="link">
                <UIcon name="ri:github-line" class="h-5 w-5" />
                Github
              </UButton>
            </ULink>
          </div>
        </div>

        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('TokenOfCommunityDetail') }}</div>
          <div
            v-if="
              community.communitytoken && community.communitytoken.length > 0
            "
            class="flex space-x-3"
          >
            <div
              v-for="(token, index) in community.communitytoken.slice(0, 2)"
              :key="index"
              class="flex justify-center border rounded-lg w-full pl-2 pr-2"
            >
              {{ token.tokenName }}
            </div>
          </div>
        </div>

        <div class="flex justify-between my-3 items-center">
          <div>{{ $t('Trading Support') }}</div>
          <div
            v-if="community.support && community.support.length > 0"
            class="flex space-x-3"
          >
            <div
              v-for="(token, index) in community.support.slice(0, 2)"
              :key="index"
              class="flex justify-center border rounded-lg w-full pl-2 pr-2"
            >
              {{ token }}
            </div>
          </div>
        </div>

        <div class="flex justify-between my-3 pr-3 items-center">
          <div>{{ $t('BuilderNumberOfCommunityDetail') }}</div>
          <div>{{ community.buildnum }}</div>
        </div>

        <UDivider />

        <div v-if="!isCommunityOwner" class="flex justify-end mt-10">
          <Confirm
            title="Leave Community"
            confirm-btn-text="Leave"
            :body="`Are you sure want to exit ${community.name}?`"
            @confirm="quitCommunity(community.uuid)"
          >
            <UButton color="white">
              <UIcon name="heroicons:arrow-left-start-on-rectangle-20-solid" />
              {{ $t('Quit') }}
            </UButton>
          </Confirm>
        </div>
      </div>


      <!--      <UDashboardSidebarLinks :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
      <!--        @update:links="(colors) => (defaultColors = colors)" />-->

      <div class="flex-1" />
      <div v-if="isCommunityOwner" class="text-right">
        <UButton
          size="lg"
          variant="ghost"
          icon="heroicons:cog-6-tooth"
          @click="isSettingModalOpen = true"
        />
      </div>
      <UPopover mode="hover" :popper="{ placement: 'top' }" class="z-[60]">
        <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
        <Button class="center-text border rounded-lg w-full h-8">Invite People</Button>
        <template #panel>
          <div class="p-4 w-96">
            <div>Invite URL:</div>
            <div class="flex items-center">
              <p ref="textToCopy" class="break-all mr-2">
                https://decentramind.club/invite/{{ community.uuid }}&{{ address }}
              </p>
              <UButton
                icon="carbon:align-box-bottom-right"
                variant="ghost"
                @click="copyText"
              />
            </div>
          </div>
        </template>
      </UPopover>

      <Button
        class="center-text border rounded-lg bg-black text-white w-full h-8"
        @click="emit('switch-right-page', communityRightPages.tasks)"
      >
        Quests Home
      </Button>

      <Button
        class="center-text border rounded-lg w-full h-8"
        @click="emit('switch-right-page', communityRightPages.chatroom)"
      >
        Chatroom
      </Button>
    </UDashboardSidebar>

    <UModal
      v-model="isSettingModalOpen"
      :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }"
    >
      <CommunityForm
        :is-setting-mode="true"
        :init-state="community"
        @close-modal="isSettingModalOpen = false"
      />
    </UModal>
  </UDashboardPanel>
</template>
