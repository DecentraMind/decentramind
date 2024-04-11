<script setup lang="ts">
definePageMeta({
  layout: "wip",
});

const { foo } = $defineProps<{
  foo: string;
}>();

let { count } = $defineModels<{
  count: number;
}>();

count++;

let test = $ref(false);
let testArr = $ref([{ xxx: "bbb" }]);
const testC = $computed(() => {
  return !test;
});
watchEffect(async () => {
  if (!test) return;

  const rz = await callApi();
});
</script>

<template>
  <div>
    <div>{{ foo }}</div>
    <div>{{ count }}</div>
  </div>
</template>
