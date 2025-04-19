<script setup>
import { shortString } from '@/utils/string'
import { useUserInfo } from '~/composables/useUserInfo'
import { aoStore } from '~/stores/aoStore'
import { breadcrumbStore } from '~/stores/breadcrumbStore'
import { computed } from 'vue'

const { isLoginModalOpen } = $(aoStore())
const { address, doLogout } = $(aoStore())
const { userInfo } = $(useUserInfo())
const { class: className } = $(useAttrs())
const { breadcrumbs } = $(breadcrumbStore())
const router = useRouter()
const { t } = useI18n()

const translatedBreadcrumbs = computed(() => {
  if (!breadcrumbs) return []
  
  return breadcrumbs.map(crumb => ({
    ...crumb,
    label: crumb.communityName || (crumb.labelKey ? t(crumb.labelKey) : crumb.label)
  }))
})

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
    <div class="flex items-center justify-between flex-1 gap-x-1 min-w-0">
      <div class="flex items-stretch gap-1 min-w-0">
        <UBreadcrumb
          v-if="translatedBreadcrumbs.length > 0"
          :links="translatedBreadcrumbs"
          :ui="{ol: 'gap-x-0 sm:gap-x-1.5', li: 'gap-x-0 sm:gap-x-1.5', base: 'gap-x-0 sm:gap-x-1.5', divider: {base: 'hidden'}}"
        >
          <template #default="{ link, isActive, index }">
            <span class="truncate" :class="{ 'font-medium': !isActive, 'text-gray-700': isActive, 'hidden sm:block': index === 0 }">{{ link.label }}</span><span :class="{ 'iconify i-heroicons:chevron-right-20-solid flex-shrink-0 w-5 h-5 rtl:rotate-180': true, 'hidden sm:block': index === 0 && index !== translatedBreadcrumbs.length - 1, 'hidden': index === translatedBreadcrumbs.length - 1 }" />
          </template>
        </UBreadcrumb>
      </div>

      <div class="flex items-stretch flex-shrink-0 gap-1.5">
        <UBadge color="white" :ui="{base: '!p-0 sm:!p-1 [--tw-ring-inset:_]'}">
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
