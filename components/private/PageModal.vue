<script setup lang="ts">
import type { Page } from '~/types'

const props = defineProps<{
  modelValue: boolean
  page?: Page
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{
      width: 'max-w-2xl'
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">
            {{ props.page?.title || '' }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <div class="prose max-w-none">
        <p>{{ props.page?.content || '' }}</p>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            color="gray"
            variant="soft"
            @click="emit('update:modelValue', false)"
          >
            {{ t('Close') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 