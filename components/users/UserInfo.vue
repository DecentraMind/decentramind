<script setup lang="ts">
import type { UserInfo } from '~/types'
const props = defineProps<{
  address: string
  showAddress?: boolean
  members: (UserInfo & {
    address: string
  })[]
}>()

const member = computed(() => {
  return props.members.find(member => member.address === props.address)
})
</script>
<template>
  <div v-if="member" class="flex items-center space-x-2" :title="member.address">
    <ArAvatar
      :src="member.avatar"
      :alt="member.name"
      size="2xs"
    />
    <span class="font-medium" :title="member.address">{{ member.name }}</span>
    <div v-if="showAddress" class="text-xs text-gray-500 max-w-xs">{{ shortString(member.address) }}</div>
  </div>
</template>