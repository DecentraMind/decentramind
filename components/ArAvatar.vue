<script lang="ts" setup>
import { defaultUserAvatar } from '~/utils/arAssets'
import type { Avatar } from '#ui/types'

const props = withDefaults(defineProps<Avatar & {
  hash?: string
}>(), {
  hash: defaultUserAvatar
})
</script>

<template>
  <div class="flex-center p-[.5px] h-fit max-h-fit">
    <UAvatar
      v-bind="props"
      :src="arUrl(hash)"
      :ui="{
        wrapper: 'ring-.5 ring-gray-300 dark:ring-gray-700',
        rounded: 'rounded-full object-cover'
      }"
    />
  </div>
</template>
