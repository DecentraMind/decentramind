<script lang="ts" setup>
import { ARWEAVE_ID_REGEXP } from '~/utils/constants'
import type { Avatar } from '#ui/types'
import { cn } from '~/utils/util'

const props = defineProps<Avatar & {
  src?: string
  class?: string
  avatarClass?: string
  ui?: any
}>()

/** all props except class and avatarClass */
const avatarProps = computed(() => {
  return {
    ...props,
    class: undefined,
    avatarClass: undefined
  }
})

/** merge ui props */
const uiProp = computed(() => {
  return {
    ...props.ui,
    wrapper: cn('ring-.5 ring-gray-300 dark:ring-gray-700 bg-background', props.ui?.wrapper),
    rounded: cn('rounded-full object-cover', props.ui?.rounded),
  }
})
</script>

<template>
  <div :class="cn('flex-center p-[.5px] h-fit max-h-fit', props.class)">
    <UAvatar
      v-bind="avatarProps"
      :src="src && ARWEAVE_ID_REGEXP.test(src) ? arUrl(src) : src"
      :ui="uiProp"
      :class="avatarClass"
    />
  </div>
</template>
