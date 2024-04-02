<script setup lang="ts">
definePageMeta({
  layout: "wip",
});
</script>

<template>

  <!-- <div class="bg-red-400">create task</div> -->
  <UForm ref="form" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup name="input" label="任务封面">
      <UInput type="file" size="sm" />
    </UFormGroup>

    <UFormGroup name="input" label="任务名称">
      <UInput placeholder="name" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务简介">
      <UTextarea />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务规则">
      <UTextarea placeholder="已自动生成任务规则" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务奖励">
      <div class="flex justify-between items-center">
        <UInput placeholder="数量" />

        <UInputMenu placeholder="Token" :options="tokenOptions" />

        <UInputMenu placeholder="链" :options="chainOptions" />
      </div>



    </UFormGroup>
    <UFormGroup name="input" label="总奖励任务数">
      <UInput placeholder="指奖励多少场space" />
    </UFormGroup>

    <UFormGroup name="textarea" label="任务周期">
      <div class="flex justify-between items-center">
        <USelect placeholder="时区" :options="timeZoneOptions" />


        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid">
            {{ format(selected.start, 'd MMM, yyy') }} - {{ format(selected.end, 'd MMM, yyy') }}
          </UButton>

          <template #panel="{ close }">
            <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
              <div class="hidden sm:flex flex-col py-4">
                <UButton v-for="(range, index) in ranges" :key="index" :label="range.label" color="gray" variant="ghost"
                  class="rounded-none px-6"
                  :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                  truncate @click="selectRange(range.duration)" />
              </div>

              <DatePicker v-model="selected" @close="close" />
            </div>
          </template>
        </UPopover>
      </div>




    </UFormGroup>

    <UButton type="submit">
      Submit
    </UButton>

    <UButton variant="outline" class="ml-2" @click="form.clear()">
      Clear
    </UButton>
  </UForm>

</template>
