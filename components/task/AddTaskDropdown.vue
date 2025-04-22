<script setup lang="ts">
import type { Task } from '~/types'
import { notificationStore } from '~/stores/notificationStore'

const { showMessage } = $(notificationStore())
withDefaults(defineProps<{
  noResponsive?: boolean
}>(), {
  noResponsive: false
})

function alertNotReady() {
  showMessage('Being Cooked')
}

const emit = defineEmits<{
  // open create task modal event with task type
  'click-create-task': [value: Task['type']]
}>()

const taskTypes = [
  [
    {
      label: 'Twitter Space Quest',
      click: () => {
        emit('click-create-task', 'space')
      },
    },
    {
      label: 'Promotion Quest',
      click: () => {
        emit('click-create-task', 'promotion')
      },
    },
    {
      label: 'Invitation Quest',
      click: alertNotReady,
    },
    {
      label: 'Try Our Product Quest',
      click: alertNotReady,
    },
    {
      label: 'Be a Bird For Us',
      click: () => {
        emit('click-create-task', 'bird')
      },
    },
    {
      label: 'Good Read Quest',
      click: () => {
        emit('click-create-task', 'article')
      },
    },
  ]
]
</script>

<template>
  <UDropdown
    :items="taskTypes"
    :popper="{ placement: 'bottom-end' }"
    :ui="{ wrapper: 'h-8', container: '!translate-y-14 !translate-x-[-16px]' }"
  >
    <template v-if="noResponsive">
      <UButton
        color="white"
        :label="$t('Start a Public Quest')"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </template>
    <template v-else>
      <UButton
        color="white"
        :label="$t('Start a Public Quest')"
        class="hidden sm:flex"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
      <UButton
        color="white"
        icon="i-heroicons-plus-20-solid"
        class="sm:hidden"
      />
    </template>
  </UDropdown>
</template>
