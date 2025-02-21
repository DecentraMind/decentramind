<script setup lang="ts">
import { getQuestions } from '~/utils/community/community'

withDefaults(defineProps<{
  isAdmin?: boolean
  isOwner?: boolean
  isApplicable?: boolean
}>(), {
  isAdmin: false,
  isOwner: false,
  isApplicable: false
})

const isMembersModalOpen = ref(false)
const isApplicationModalOpen = ref(false)
const defaultTab = ref('members')
const route = useRoute()
const uuid = route.params.uuid as string

const hasQuestions = ref(false)
const isLoading = ref(true)
const questions = ref<string[]>([])

// Load questions when component is mounted
onMounted(async () => {
  const loadedQuestions = await getQuestions(uuid)
  questions.value = loadedQuestions || []
  hasQuestions.value = loadedQuestions ? loadedQuestions.length > 0 : false
  isLoading.value = false
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

      <!-- application button for users not approved to join private area -->
      <UButton
        v-if="!isLoading && !isAdmin && hasQuestions"
        color="gray"
        @click="isApplicationModalOpen = true"
      >
        {{ $t('private.area.application') }}
      </UButton>

      <!-- Admin Reminder -->
      <div
        v-if="isAdmin && !hasQuestions && !isLoading"
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
      :show-applicable-setting="isOwner"
      :is-applicable="isApplicable"
    />

    <PrivateApplicationModal
      v-model="isApplicationModalOpen"
      :uuid="uuid"
      :questions="questions"
    />
  </UPage>
</template>
