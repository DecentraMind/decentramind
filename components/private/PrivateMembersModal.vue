<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'
import { getQuestions } from '~/utils/community/community'

const props = defineProps<{
  modelValue: boolean
  uuid: string
  defaultTab?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

const modalTabs = [
  {
    name: 'members',
    label: t('private.members.title'),
    slot: 'members'
  },
  {
    name: 'questions',
    label: t('private.questions.title'),
    slot: 'questions'
  }
]

// Get the default index based on the defaultTab prop
const defaultIndex = computed(() => {
  if (!props.defaultTab) return 0
  const index = modalTabs.findIndex(tab => tab.name === props.defaultTab)
  return index === -1 ? 0 : index
})

const activeTab = ref(0)

// State for members
const pendingMembers = ref<UserInfoWithAddress[]>([])
const currentMembers = ref<UserInfoWithAddress[]>([])
const memberHistory = ref<{
  action: 'add' | 'remove'
  admin: string
  member: string
  timestamp: number
}[]>([])

// Questions state
const questions = ref<string[]>([])

// Member management functions
function removeMember(member: UserInfoWithAddress) {
  // TODO: Implement remove member logic
  console.log('Remove member:', member)
}

// Load data
onMounted(async () => {
  // Set initial active tab
  activeTab.value = defaultIndex.value

  // Load questions
  questions.value = await getQuestions(props.uuid) || []

  // TODO: Load actual data from the backend
  // This is just mock data for now
  pendingMembers.value = []
  currentMembers.value = []
  memberHistory.value = []
})
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{
      width: 'max-w-3xl'
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">
            {{ t('private.area.management') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <!-- Tabs -->
      <UTabs
        v-model="activeTab"
        :items="modalTabs"
        :default-index="defaultIndex"
      >
        <template #members>
          <UCard>
            <div class="space-y-6">
              <!-- Pending Members Section -->
              <PrivatePendingMembers
                :members="pendingMembers"
                :questions="questions"
                :uuid="uuid"
                @update:members="pendingMembers = $event"
              />

              <!-- Current Members Section -->
              <PrivateCurrentMembers
                :members="currentMembers"
                @remove="removeMember"
              />

              <!-- Member History Section -->
              <PrivateMemberHistory
                :history="memberHistory"
              />
            </div>
          </UCard>
        </template>

        <template #questions>
          <UCard>
            <PrivateQuestions :uuid="uuid" />
          </UCard>
        </template>
      </UTabs>
    </UCard>
  </UModal>
</template> 