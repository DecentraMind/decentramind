<script lang="ts" setup>
defineProps<{
  message: string
}>()
const emit = defineEmits(['success'])
</script>
<template>
  <UModal>
    <UCard>
      <p>{{ message }}</p>
    </UCard>
  </UModal>
</template>
