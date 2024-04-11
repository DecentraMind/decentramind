<script setup lang="ts">
definePageMeta({
  layout: "wip",
});

const { foo } = defineProps<{
  foo: string;
}>();

let { count } = defineModels<{
  count: number;
}>();

count++;
</script>

<template>
  <div>
    <div>{{ foo }}</div>
    <div>{{ count }}</div>
  </div>
</template>
