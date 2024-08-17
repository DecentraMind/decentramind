<template>
  <div v-if="$slots.default" @click="showModal = true">
    <slot />
  </div>
  <UModal v-model="showModal" :ui="{width: 'w-96'}" prevent-close>
    <UCard
      :ui="{
        header: { padding: 'pt-5 pb-0' },
        divide: '',
        footer: {
          padding: 'py-3 bg-zinc-50 flex items-center'
        }
      }"
    >
      <template #header>
        <slot v-if="$slots.title" name="title" />
        <span else class="text-left text-lg font-medium">{{ title }}</span>
      </template>
      <slot v-if="$slots.body" name="body" />
      <div else class="text-left text-base">{{ body }}</div>
      <template #footer>
        <p class="w-full flex justify-end space-x-8">
          <UButton :disabled="isExecuting" color="gray" variant="solid" size="lg" @click="executeCancel">Cancel</UButton>
          <UButton
            :disabled="isExecuting"
            :loading="isExecuting"
            color="red"
            variant="outline"
            size="lg"
            @click="execute"
          >
            Leave
          </UButton>
        </p>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title?: string
  body?: string
  onCancel?: ((...args: any[]) => void|Promise<any>)
  onConfirm?: ((...args: any[]) => void|Promise<any>)
}>()
const { title, body, onCancel, onConfirm } = $(toRefs(props))

// eslint-disable-next-line prefer-const
let showModal = $ref<boolean>(false)
// eslint-disable-next-line prefer-const
let isExecuting = $ref<boolean>(false)

const executeCancel = async() => {
  if (onCancel) {
    await onCancel()
  }
  showModal = false
}

const execute = async() => {
  if (!onConfirm) return
  isExecuting = true
  try {
    await onConfirm()
  } finally {
    isExecuting = false
  }
}
</script>

<style>

</style>
