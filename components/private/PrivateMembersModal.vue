<script setup lang="ts">
import { getQuestions } from '~/utils/community/community'
import PrivatePendingMembers from './PrivatePendingMembers.vue'
import PrivateCurrentMembers from './PrivateCurrentMembers.vue'
import PrivateMemberLogs from './PrivateMemberLogs.vue'

const props = defineProps<{
  modelValue: boolean
  uuid: string
  defaultTab?: string
  showApplicableSetting?: boolean
  isApplicable: boolean
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

const questions = ref<string[]>([])

// Load data
onMounted(async () => {
  // Set initial active tab
  activeTab.value = defaultIndex.value

  // Load questions
  questions.value = await getQuestions(props.uuid) || []

  await loadMemberData()
})

async function loadMemberData() {
  
}
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
                :questions="questions"
                :uuid="uuid"
                @member-updated="loadMemberData"
              />

              <!-- Current Members Section -->
              <PrivateCurrentMembers
                :uuid="uuid"
                @member-updated="loadMemberData"
              />

              <!-- Member History Section -->
              <PrivateMemberLogs
                :uuid="uuid"
                @member-updated="loadMemberData"
              />
            </div>
          </UCard>
        </template>

        <template #questions>
          <UCard>
            <PrivateQuestions
              :uuid="uuid"
              :show-applicable-setting="!!showApplicableSetting"
              :is-applicable="isApplicable"
            />
          </UCard>
        </template>
      </UTabs>
    </UCard>
  </UModal>
</template> 