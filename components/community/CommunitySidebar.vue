<script setup lang="ts">
import { toRefs } from 'vue'
import type { Community } from '~/types/index'
import { communityRightPages } from '~/utils/constants'
import { getDomain } from '~/utils/util'
import CommunityForm from '~/components/community/CommunityForm.vue'
import BaseField from '~/components/fields/BaseField.vue'

const props = defineProps<{
  community?: Community
  address: string
}>()
const { community, address } = $(toRefs(props))
const isCommunityOwner = $computed(() => community && address ? community.owner === address : false)

const { exitCommunity } = $(communityStore())
const { showError, showSuccess } = $(notificationStore())

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

const emit = defineEmits(['switch-right-page'])

const classes = {
  bottomButtons: 'center-text border rounded-lg w-full h-8'
}
</script>
<template>
  <UDashboardPanel :width="384" class="w-96">
    <UDashboardSidebar
      v-if="community"
      class="pb-2"
      :ui="{
        container: 'py-0',
        header: 'px-0',
        footer: 'flex-col-center pb-2 gap-y-2 flex-shrink-0'
      }"
    >
      <template #header>
        <img :src="getCommunityBannerUrl(community.banner)" :alt="community.name">
      </template>

      <div>
        <div class="flex justify-between items-center h-[calc(var(--header-height))]">
          <div class="max-w-[70%] text-3xl break-all">{{ community.name }}</div>
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

        <div v-if="!isCommunityOwner" class="flex justify-end mt-10">
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
        <UPopover mode="hover" :popper="{ placement: 'top' }" class="z-[60] w-full">
          <!--<UButton color="white" variant="link" label="Invite people" leading-icon="i-heroicons-plus" />-->
          <Button :class="classes.bottomButtons">Invite People</Button>
          <template #panel>
            <div class="p-4 w-80">
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
          :class="cn(classes.bottomButtons, 'bg-black text-white')"
          @click="emit('switch-right-page', communityRightPages.tasks)"
        >
          Quests Home
        </Button>

        <Button
          :class="classes.bottomButtons"
          @click="emit('switch-right-page', communityRightPages.chatroom)"
        >
          Chatroom
        </Button>
      </template>
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
