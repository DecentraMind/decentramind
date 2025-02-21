<script setup lang="ts">
import { getQuestions } from '~/utils/community/community'

const props = withDefaults(defineProps<{
  isAdmin?: boolean
  isOwner?: boolean
  isApplicable?: boolean
  joined?: boolean
}>(), {
  isAdmin: false,
  isOwner: false,
  isApplicable: false,
  joined: false
})

const isMembersModalOpen = ref(false)
const isApplicationModalOpen = ref(false)
const defaultTab = ref('members')
let showIndex = $ref(false)

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
  showIndex = hasQuestions.value ? props.isAdmin || props.isOwner || props.joined : false
})

function openMembersModal(tab: string = 'members') {
  defaultTab.value = tab
  isMembersModalOpen.value = true
}
</script>

<template>
  <UPage>
    <div class="relative flex flex-col px-3 pt-6 pb-10 items-center h-[calc(100vh-var(--header-height))] overflow-y-auto scroll-gutter">
      <div
        v-if="isLoading"
        class="absolute top-0 right-0 w-full h-full flex justify-center items-center"
      >
        <UIcon
          name="svg-spinners:blocks-scale"
          dynamic
          class="w-16 h-16 opacity-50"
        />
      </div>
      <div v-else class="h-full">
        <div v-if="showIndex">
          index
        </div>
        <div v-else class="h-full flex flex-col items-center justify-center">
          <h2 class="text-2xl font-bold mb-4">
            <UIcon
              name="heroicons:lock-closed"
              class="w-10 h-10"
              :title="$t('private.area.title')"
            />
          </h2>
          <p v-if="isApplicable" class="text-gray-600">{{ $t('private.area.descriptionApplicable') }}</p>
          <p v-else class="text-gray-600">{{ $t('private.area.descriptionNotApplicable') }}</p>

          <div class="flex items-center justify-center gap-3 mt-4">
            <UButton
              @click="showIndex = true"
            >
              {{ $t('private.area.view') }}
            </UButton>
            <!-- application button for users not approved to join private area -->
            <UButton
              v-if="!isLoading && !isAdmin && hasQuestions"
              color="gray"
              @click="isApplicationModalOpen = true"
            >
              {{ $t('private.area.application') }}
            </UButton>
          </div>

          <!-- Admin Reminder -->
          <div
            v-if="isAdmin && !hasQuestions && !isLoading"
            class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
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
      </div>
    </div>

    <Teleport v-if="isAdmin || isOwner" to="#top-right-button">
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
