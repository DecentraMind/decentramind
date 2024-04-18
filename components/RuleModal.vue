<script lang="ts" setup>
// import SettlementTask from '~/components/SettlementTask.vue'
// const modal = useModal()
const isOpen = ref(false)
const emit = defineEmits(['success'])
const singles = ['单人', '多人']
const isSingle = ref(singles[0])
// const isTipOpen = ref(false)
let isSettlementOpen = $ref(false)
function onClick() {
  isSettlementOpen = true
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            任务结算
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="isOpen = false" />
        </div>
      </template>
      <div v-if="!isSettlementOpen" class="space-y-2">
        <p>感谢你对社区的支持~请你按照任务规则完成任务，并且将任务URL提交至表格的加号处哦！如果没有遵循任何一条任务规则那么你可能会白费力气喔~</p>
        <UButton @click="onClick">
          I know!
        </UButton>
      </div>
      <div v-if="isSettlementOpen">
        <USelect v-model="isSingle" :options="singles" />
        <div class="my-8 flex flex-row" v-if="isSingle == '多人'">
          <div class="mr-4 basis-2/3">
            <UInput color="primary" variant="outline" placeholder="钱包地址1" />
          </div>
          <div class="ml-4 basis-1/3">
            <UInput color="primary" variant="outline" placeholder="奖励占比" />
          </div>
        </div>
        <div class="my-8 flex flex-row" v-if="isSingle == '多人'">
          <div class="mr-4 basis-2/3">
            <UInput color="primary" variant="outline" placeholder="钱包地址2" />
          </div>
          <div class="ml-4 basis-1/3">
            <UInput color="primary" variant="outline" placeholder="奖励占比" />
          </div>
        </div>
        <div class="my-8">
          <UInput color="primary" variant="outline" placeholder="URL" />
        </div>
        <div class="flex justify-center my-8">
          <UButton>确认提交</UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
