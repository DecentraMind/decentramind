<script setup lang="ts">
const { isVouchModalOpen } = $(aoStore())
</script>
<template>
  <UModal v-model="isVouchModalOpen">
    <UCard
      class="h-fit flex flex-col items-center justify-start"
      :ui="{
        header: {
          padding: 'py-4',
        },
        body: {
          base: 'w-full',
        },
      }"
    >
      <template #header>
        <h3 class="font-semibold leading-6 text-gray-900 dark:text-white">
          Vouch Required
        </h3>
      </template>
      <div class="w-full flex-center gap-x-4">
        <UButton
          color="gray"
          variant="ghost"
          title="I'm vouched, reload page"
          @click="reloadNuxtApp()"
        >
          I'm vouched
        </UButton>
        <NuxtLink
          to="https://g8way.io/Cikp3X7Zk4cI1RtBEq-pVh_fhz-npd5dZ5-0EgCxTQM"
          target="_blank"
        >
          <UButton icon="heroicons:arrow-top-right-on-square">
            Get Vouched
          </UButton>
        </NuxtLink>
      </div>
    </UCard>
  </UModal>
</template>
