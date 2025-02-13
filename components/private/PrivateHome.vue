<script setup lang="ts">
const isMembersModalOpen = ref(false)
const route = useRoute()
const uuid = route.params.uuid as string
</script>

<template>
  <UPage>
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold mb-4">{{ $t('private.area.title') }}</h1>
      <p class="text-gray-600">{{ $t('private.area.description') }}</p>
    </div>

    <Teleport to="#top-right-button">
      <UButton
        color="gray"
        variant="ghost"
        icon="heroicons:users-solid"
        size="xs"
        @click="isMembersModalOpen = true"
      />
    </Teleport>

    <PrivateMembersModal
      v-model="isMembersModalOpen"
      :uuid="uuid"
    />
  </UPage>
</template>
