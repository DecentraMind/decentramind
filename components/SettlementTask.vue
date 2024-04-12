<script lang="ts" setup>
const emit = defineEmits(['success'])
const singles = ['单人', '多人']

const isSingle = ref(singles[0])
</script>
<template>
  <UModal>
    <UCard>
      <div>
        <USelect v-model="isSingle" :options="singles" />
        <div class="my-8 flex flex-row" v-if="isSingle == '多人'">
          <div class="mr-4 basis-2/3"><UInput color="primary" variant="outline" placeholder="钱包地址1" /></div>
          <div class="ml-4 basis-1/3"><UInput color="primary" variant="outline" placeholder="奖励占比" /></div>
        </div>
        <div class="my-8 flex flex-row" v-if="isSingle == '多人'">
          <div class="mr-4 basis-2/3"><UInput color="primary" variant="outline" placeholder="钱包地址2" /></div>
          <div class="ml-4 basis-1/3"><UInput color="primary" variant="outline" placeholder="奖励占比" /></div>
        </div>
        <div class="my-8"><UInput color="primary" variant="outline" placeholder="URL" /></div>
        <div class="flex justify-center my-8"><UButton>确认提交</UButton></div>
      </div>
    </UCard>
  </UModal>
</template>
