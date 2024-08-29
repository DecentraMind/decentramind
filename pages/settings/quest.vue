<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'

const { getBountiesByAddress } = useTaskStore()
const { address } = $(aoStore())

let result = $ref<number>()

onMounted( async () => {
  const { published, awarded } = await getBountiesByAddress(address)
  result = published.length + awarded.length
})
</script>

<template>
  <UDashboardPanelContent class="p-4 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}">
      <template #header>
        <div class="text-xl flex items-center pl-5">
          <h3 class="w-[420px]">
            {{ $t('setting.task.completed') }}： {{ result }}
          </h3>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
