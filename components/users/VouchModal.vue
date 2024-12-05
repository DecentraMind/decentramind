<script setup lang="ts">
import { VOUCH_SITE_URL } from '~/utils/constants'
const { isVouchModalOpen } = $(aoStore())

// TODO remove this component and isVouchModalOpen after all user data fixed(no unvouched user), and new user must be vouched before first login
</script>
<template>
  <UModal v-model="isVouchModalOpen" prevent-close>
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
        <NuxtLink :to="VOUCH_SITE_URL" target="_blank">
          <UButton icon="heroicons:arrow-top-right-on-square">
            Get Vouched
          </UButton>
        </NuxtLink>
      </div>
    </UCard>
  </UModal>
</template>
