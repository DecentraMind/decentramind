<script setup lang="ts">
import { toRefs } from 'vue'
import type { Community } from '~/types/index'
import { getDomain, getHandle, getTextRenderWidth, cn } from '~/utils'
import CommunitySettingForm from '~/components/community/CommunitySettingForm.vue'
import BaseField from '~/components/fields/BaseField.vue'

const props = defineProps<{
  community?: Community
  address: string
}>()
const { community, address } = $(toRefs(props))
const isCommunityOwner = $computed(() => community && address ? community.owner === address : false)

const { exitCommunity } = $(communityStore())
const { createCommunityInviteCode } = useTaskStore()
const { showError, showSuccess } = $(notificationStore())

const communitySettingTabs = [
  {
    label: 'Basic Info',
    slot: 'basic-info'
  },
  {
    label: 'Administration',
    slot: 'administration'
  }
]

const router = useRouter()

const isSettingModalOpen = $ref(false)

let isExiting = $ref(false)
const quitCommunity = async (communityUuid: string) => {
  if (!community) return
  isExiting = true
  try {
    await exitCommunity(communityUuid)
    isExiting = false
    router.push('/discovery')
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
    await navigator.clipboard.writeText(textToCopy.innerText)
    showSuccess('Copied!')
  } catch (err) {
    showError('Copy failed.')
  }
}


const classes = {
  bottomButtons: 'justify-center border rounded-lg w-full h-8'
}

const route = useRoute()
const currentHash = ref(route.hash || '#quests')

watch(
  () => route.hash,
  (newHash) => {
    currentHash.value = newHash || '#quests'
  }
)

const inviteUrl = $computed(() => {
  return typeof window !== 'undefined' ? `${window.location.origin}/i/${community?.inviteCode}` : ''
})
watch(() =>community, async () => {
  if (!community || community.inviteCode) return
  community.inviteCode = await createCommunityInviteCode(community.uuid)
})

const communityNameWidth = $computed(() => community ? getTextRenderWidth(community.name, 30) : 0)
</script>
<template>
  <UDashboardPanel :width="384" class="w-96" collapsible>
    <UDashboardSidebar
      v-if="community"
      class="pb-2"
      :ui="{
        container: 'py-0 gap-y-0',
        header: 'px-0',
        body: 'pb-2',
        footer: 'flex-col-center pb-2 gap-y-2 flex-shrink-0'
      }"
    >
      <template #header>
        <img :src="getCommunityBannerUrl(community.banner)" :alt="community.name" class="object-cover w-full h-52">
      </template>

      <div class="pb-4">
        <div class="flex justify-between items-center py-2">
          <div
            :class="cn('max-w-[70%]', {
              'text-base font-bold': communityNameWidth > 300,
              'text-xl font-bold': communityNameWidth > 200 && communityNameWidth <= 300,
              'text-3xl': communityNameWidth <= 200
            })"
          >
            {{ community.name }}
          </div>
          <div>
            <UButton
              color="primary"
              variant="soft"
              :to="`/community/${community.uuid}/detail`"
            >
              {{ $t('View Details') }}
            </UButton>
          </div>
        </div>

        <UDivider />
        <div class="flex flex-col gap-y-6 py-4">
          <BaseField
            v-if="community.website"
            :name="$t('community.website')"
            :link="community.website"
            :link-text="getDomain(community.website)"
          />

          <BaseField
            v-if="community.twitter"
            :name="$t('community.twitter')"
            :link="community.twitter"
            :link-text="getHandle(community.twitter)"
            link-icon="ri:twitter-fill"
          />

          <BaseField
            v-if="community.github"
            :name="$t('community.github')"
            :link="community.github"
            :link-text="getHandle(community.github)"
            link-icon="ri:github-fill"
          />

          <BaseField :name="$t('TokenOfCommunityDetail')" :values="community.communitytoken.filter(token => token.tokenName) as unknown as Record<string, string>[]" value-key="tokenName" />

          <BaseField :name="$t('Trading Support')" :values="community.support as unknown as Record<string, string>[]" />

          <BaseField :name="$t('community.builders')" :value="community.buildnum" />
        </div>

        <UDivider />

        <div v-if="!isCommunityOwner && community.isJoined" class="flex justify-end mt-10">
          <Confirm
            title="Leave Community"
            confirm-btn-text="Leave"
            :body="`Are you sure want to exit ${community.name}?`"
            @confirm="quitCommunity(community.uuid)"
          >
            <UButton :loading="isExiting" color="white">
              <UIcon name="heroicons:arrow-left-start-on-rectangle-20-solid" />
              {{ $t('Quit') }}
            </UButton>
          </Confirm>
        </div>
      </div>

      <template #footer>
        <div v-if="isCommunityOwner" class="self-end">
          <UButton
            size="lg"
            variant="soft"
            icon="heroicons:cog-6-tooth"
            @click="isSettingModalOpen = true"
          />
        </div>
        <UPopover v-if="community.inviteCode" mode="hover" :popper="{ placement: 'top' }" class="z-[60] w-full">
          <UButton
            color="white"
            variant="ghost"
            icon="heroicons:link"
            :class="classes.bottomButtons"
          >
            Invite People
          </UButton>
          <template #panel>
            <div class="p-4 w-80">
              <div class="flex items-center">
                <p ref="textToCopy" class="break-all mr-2 text-xs">
                  {{ inviteUrl }}
                </p>
                <UButton
                  icon="ri:checkbox-multiple-blank-line"
                  variant="ghost"
                  title="Copy to clipboard"
                  @click="copyText"
                />
              </div>
            </div>
          </template>
        </UPopover>

        <UButton
          :color="currentHash=='#quests' ? 'black' : 'white'"
          :variant="currentHash=='#quests' ? 'solid' : 'ghost'"
          icon="heroicons:home"
          :class="classes.bottomButtons"
          @click="router.push({hash: '#quests'})"
        >
          Quests Home
        </UButton>

        <UButton
          :color="currentHash=='#chatroom' ? 'black' : 'white'"
          :variant="currentHash=='#chatroom' ? 'solid' : 'ghost'"
          icon="heroicons:chat-bubble-left-right"
          :class="classes.bottomButtons"
          @click="router.push({hash: '#chatroom'})"
        >
          Chatroom
        </UButton>
      </template>
    </UDashboardSidebar>

    <UModal
      v-model="isSettingModalOpen"
      :ui="{ width: 'px-2 py-4 sm:px-3 sm:py-6 w-fit sm:max-w-[90%]' }"
    >
      <UTabs name="Setting" :items="communitySettingTabs" class="px-6 md:px-16">
        <template #basic-info>
          <CommunitySettingForm
            :is-setting-mode="true"
            :init-state="community"
            class="px-0 md:px-px"
            @close-modal="isSettingModalOpen = false"
          />
        </template>
        <template #administration>
          <CommunityAdminForm v-if="community" :uuid="community.uuid" :init-state="community.admins" class="px-0 md:px-0.5" />
        </template>
      </UTabs>
    </UModal>
  </UDashboardPanel>
</template>
