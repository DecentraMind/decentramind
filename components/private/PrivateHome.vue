<script setup lang="ts">
import { getQuestions } from '~/utils/community/community'

defineProps<{
  isAdmin: boolean
}>()

const isMembersModalOpen = ref(false)
const defaultTab = ref('members')
const route = useRoute()
const uuid = route.params.uuid as string

const hasQuestions = ref(false)

// Load questions when component is mounted
onMounted(async () => {
  const questions = await getQuestions(uuid)
  hasQuestions.value = questions ? questions.length > 0 : false
})

function openMembersModal(tab: string = 'members') {
  defaultTab.value = tab
  isMembersModalOpen.value = true
}
</script>

<template>
  <UPage>
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold mb-4">{{ $t('private.area.title') }}</h1>
      <p class="text-gray-600">{{ $t('private.area.description') }}</p>

      <!-- Admin Reminder -->
      <div
        v-if="isAdmin && !hasQuestions"
        class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <p class="text-yellow-800 mb-4">{{ $t('private.area.noQuestionsWarning') }}</p>
        <UButton
          color="yellow"
          @click="openMembersModal('questions')"
        >
          {{ $t('private.area.addQuestions') }}
        </UButton>
      </div>
    </div>

    <Teleport to="#top-right-button">
      <UButton
        color="gray"
        variant="ghost"
        icon="heroicons:users-solid"
        size="xs"
        @click="openMembersModal()"
      />
    </Teleport>

    <PrivateMembersModal
      v-model="isMembersModalOpen"
      :uuid="uuid"
      :default-tab="defaultTab"
    />
  </UPage>
</template>
