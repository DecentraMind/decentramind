<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  time: number
  // TODO: remove this after testing
  // msg is for debug
  msg: string
}

const props = defineProps<Props>()

const timeAgo = useTimeAgo(props.time, {
  updateInterval: 1000,
  showSecond: true,
  max: 3600000,
  fullDateFormatter: (date: Date) => date.toLocaleString()
})
console.log('timeAgo', props.time, props.msg)

const localeTime = computed(() => formatDate(props.time))
</script>

<template>
  <time 
    v-bind="$attrs"
    :datetime="new Date(time).toISOString()" 
    :title="localeTime"
  >{{ timeAgo }}</time>
</template>
