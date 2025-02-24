<script setup lang="ts">
import type { PrivateAreaConfig } from '~/types'
import { getPrivateAreaConfig } from '@/utils/community/community'

const props = defineProps<{
  uuid: string
}>()

const config = ref<PrivateAreaConfig | null>(null)

onMounted(async () => {
  config.value = await getPrivateAreaConfig(props.uuid)
})
</script>

<template>
  <div class="ttt w-full h-full flex flex-col items-start justify-start">
    <h2 class="text-2xl font-bold text-left">
      {{ config?.pagesAreaTitle }}
    </h2>
    <div class="mt-2 w-full flex flex-col items-center justify-center ring-1 ring-gray-200 rounded-lg p-4">
      <!-- <div v-for="page in config?.pages" :key="page.title">
        <h3 class="text-lg font-bold">{{ page.title }}</h3>
      </div>
      <UButton
        color="blue"
        variant="solid"
        class="mt-4"
        @click="openAddPageModal"
      >
        {{ $t('private.area.addPage') }}
      </UButton>

      <AddPageModal
        v-model="isAddPageModalOpen"
        :uuid="props.uuid"
        @page-added="fetchConfig"
      /> -->
    </div>
  </div>
</template>
