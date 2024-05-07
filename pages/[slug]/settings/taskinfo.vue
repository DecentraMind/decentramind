<script setup lang="ts">
const state = $ref<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

async function onChange () {
  // Do something with data
  console.log(state)
}




const taskForm = $ref({ 
    showTasknum: true, 
})
function onSubmitTask () {
  console.log('Submitted form:', taskForm)
}

</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard class="pl-10 pt-10 text-xl" @submit.prevent="onSubmitTask">
      <div class="flex items-center">
        {{ $t('setting.task.completed')}}： 50
        <UToggle v-model="taskForm.showTasknum" class="ml-10 mr-3" size="xl" />{{ $t('show')}}
      </div>
    </UCard>
  </udashboardpanelcontent>
</template>
