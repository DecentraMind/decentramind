<script lang="ts" setup>
import { ARWEAVE_ID_REGEXP } from '~/utils/constants'
import type { Avatar } from '#ui/types'

const props = defineProps<Avatar & {
  src?: string
}>()
</script>

<template>
  <div class="flex-center p-[.5px] h-fit max-h-fit">
    <UAvatar
      v-bind="props"
      :src="src && ARWEAVE_ID_REGEXP.test(src) ? arUrl(src) : src"
      :ui="{
        wrapper: 'ring-.5 ring-gray-300 dark:ring-gray-700',
        rounded: 'rounded-full object-cover'
      }"
    />
  </div>
</template>
