<script setup>
import { shortString } from '@/utils/string'
import { useUserInfo } from '~/composables/useUserInfo'
import { aoStore } from '~/stores/aoStore'

const { isLoginModalOpen } = $(aoStore())
const { address, doLogout } = $(aoStore())
const { userInfo } = $(useUserInfo())
const { class: className } = $(useAttrs())
const router = useRouter()

const translate = [
  [
    //   {
    //   label: '简体中文',
    // },
    {
      label: 'English',
    },
  ],
]

const onClickDisconnect = async () => {
  await doLogout()
  router.push('/')
}
</script>

<template>
  <div
    :class="
      cn(
        'w-full z-10 bg-white h-[--header-height] flex-shrink-0 flex items-center border-b border-gray-200 dark:border-gray-800 px-4 gap-x-4 min-w-0',
        className,
      )
    "
  >
    <div class="flex items-center justify-between flex-1 gap-x-1.5 min-w-0">
      <div class="flex items-stretch gap-1.5 min-w-0">
        <h1
          class="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white min-w-0"
        >
          <span class="truncate">Explore</span>
        </h1>
      </div>
      <div class="flex items-stretch flex-shrink-0 gap-1.5">
        <UBadge color="white">
          <template v-if="address">
            <NuxtLink :to="'/dashboard/quests'">
              <UButton color="white" variant="ghost">
                {{ $t('Dashboard') }}
              </UButton>
            </NuxtLink>
            <span>|</span>
            <UPopover :popper="{ placement: 'bottom-end' }">
              <UButton variant="ghost" color="white" block :title="address">
                {{ userInfo?.name || shortString(address) }}
              </UButton>
              <template #panel>
                <UButton variant="soft" color="red" @click="onClickDisconnect">
                  Disconnect
                </UButton>
              </template>
            </UPopover>
          </template>
          <UButton
            v-else
            variant="ghost"
            color="white"
            @click="isLoginModalOpen = true"
          >
            <UIcon name="ri:wallet-line" />
            Connect Wallet
          </UButton>
        </UBadge>
        <UDropdown
          :items="translate"
          mode="hover"
          :popper="{ placement: 'bottom-start' }"
          class="hidden"
        >
          <UButton
            color="white"
            label="English"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>
