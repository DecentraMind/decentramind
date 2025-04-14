<script setup lang="ts">
import { getBountiesByAddress } from '~/utils/task'
import { aoStore } from '~/stores/aoStore'

const { address } = $(aoStore())

let result = $ref<number>()

onMounted( async () => {
  const { published, awarded } = await getBountiesByAddress(address)
  result = published.length + awarded.length
})
</script>

<template>
  <UDashboardPanelContent :ui="{wrapper: 'overflow-y-auto p-0'}">
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none', base: 'p-4 h-[calc(100vh-var(--header-height)-48px)]'}">
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
