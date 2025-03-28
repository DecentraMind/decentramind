<script setup lang="ts">
import { shortString } from '~/utils/string'
import type { PrivateUnlockMember } from '~/types'
import { usePrivateUnlockMembersQuery } from '~/composables/community/communityQuery'
import { communityStore } from '~/stores/communityStore'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { currentUuid: communityUuid } = $(communityStore())
const { data: members } = usePrivateUnlockMembersQuery(communityUuid!)

// 根据地址查找用户信息
const selectedUser = computed(() => {
  if (!props.modelValue) return null
  return members.value?.find(member => member.address === props.modelValue) || {
    address: props.modelValue,
    name: '',
    avatar: ''
  }
})

// 搜索功能
function search(query: string, users: PrivateUnlockMember[]) {
  if (!query) return users

  const lowercaseQuery = query.toLowerCase()
  return users.filter(user =>
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.address.toLowerCase().includes(lowercaseQuery)
  )
}

// 当选择变化时更新 modelValue
function handleSelectionChange(user: PrivateUnlockMember) {
  emit('update:modelValue', user.address)
}
</script>

<template>
  <USelectMenu
    :model-value="selectedUser?.address"
    :searchable="true"
    :search="search"
    :search-attributes="['address', 'name']"
    searchable-placeholder="Search by name or address..."
    :options="members"
    option-attribute="name"
    trailing
    leading
    by="address"
    :placeholder="placeholder || 'Select member'"
    class="w-60"
    @update:model-value="handleSelectionChange"
  >
    <template #option-empty="{ query }">
      <q>{{ query }}</q> not found
    </template>
    <template #option="{ option }">
      <div class="flex items-center space-x-2">
        <ArAvatar
          :src="option.avatar"
          :alt="option.name"
          size="2xs"
        />
        <span class="font-medium">{{ option.name }}</span>
        <div class="text-xs text-gray-500 max-w-xs">{{ shortString(option.address) }}</div>
      </div>
    </template>
    <template #label>
      <div v-if="selectedUser" class="flex items-center space-x-2">
        <ArAvatar
          :src="selectedUser.avatar"
          :alt="selectedUser.name"
          size="2xs"
        />
        <span class="font-medium">{{ selectedUser.name }}</span>
        <div class="text-xs text-gray-500 max-w-xs">{{ shortString(selectedUser.address) }}</div>
      </div>
      <span v-else>{{ placeholder || 'Select member' }}</span>
    </template>
  </USelectMenu>
</template>
