<script lang="ts" setup>
let isMounted = $ref(false)

defineProps({
  to: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {
  isMounted = true
})
</script>
<template>
  <Teleport v-if="isMounted" :disabled="disabled" :to="to"><slot /></Teleport>
</template>