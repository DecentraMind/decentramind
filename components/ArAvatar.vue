<script lang="ts" setup>
import { ARWEAVE_ID_REGEXP } from '~/utils/constants'
import type { Avatar } from '#ui/types'

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
    wrapper: 'ring-.5 ring-gray-300 dark:ring-gray-700 bg-background',
    rounded: 'rounded-full object-cover',
    ...props.ui
  }
})
</script>

<template>
  <div class="flex-center p-[.5px] h-fit max-h-fit" :class="props.class">
    <UAvatar
      v-bind="avatarProps"
      :src="src && ARWEAVE_ID_REGEXP.test(src) ? arUrl(src) : src"
      :ui="uiProp"
      :class="avatarClass"
    />
  </div>
</template>
