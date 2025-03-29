<script setup lang="ts">
import type { Community, Task } from '~/types'
import AddTaskDropdown from '~/components/task/AddTaskDropdown.vue'
import Bounties from '~/components/task/Bounties.vue'
import MountedTeleport from '~/components/MountedTeleport.vue'
import { useTasksByCommunityUuidQuery } from '~/composables/tasks/taskQuery'
import { aoStore } from '~/stores/aoStore'
import { notificationStore } from '~/stores/notificationStore'

const { address } = $(aoStore())
const { showError } = $(notificationStore())

const props = defineProps<{
  isAdminOrOwner: boolean
  community: Community
}>()

const createTaskType = $ref<Task['type']>('space')

let isCreateTaskModalOpen = $ref(false)

// get cached tasks by computed property
const { data: tasks, isLoading, isError, error, refetch } = useTasksByCommunityUuidQuery(props.community.uuid, {
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
})
watchEffect(() => {
  if (isError.value) {
    showError('Loading tasks data error.', error.value as Error)
  }
})
async function onTaskCreated() {
  isCreateTaskModalOpen = false
  console.log('onTaskCreated')

  await refetch()
}

// if teleport element exists
const targetExists = ref(false)
onMounted(async () => {
  targetExists.value = !!document.getElementById('top-right-button')
})
</script>

<template>
  <div class="relative flex flex-col px-3 pt-6 pb-10 items-center h-[calc(100vh-var(--header-height))] overflow-y-auto scroll-gutter">
    <!-- No tasks -->
    <div
      v-if="!tasks?.length && !isLoading"
      class="h-[calc(100vh-var(--header-height)-40px)] w-2/3 flex justify-center items-center"
    >
      <UCard>
        <div
          class="flex-center text-center whitespace-pre-line"
        >
          <div class="text-xl">
            {{
              isAdminOrOwner
                ? $t('No quest.')
                : 'Nothing here, \nquests will coming soon.'
            }}
          </div>
        </div>
        <div
          v-if="community && isAdminOrOwner"
          class="flex-center mt-10"
        >
          <AddTaskDropdown
            no-responsive
            @click-create-task="(type: Task['type']) => { createTaskType = type; isCreateTaskModalOpen = true }"
          />
        </div>
      </UCard>
    </div>

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

    <div v-if="tasks?.length" class="mx-auto w-full">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-10"
      >
        <UBlogPost
          v-for="task in tasks"
          :key="task.processID"
          :image="arUrl(task.banner)"
          :description="task.intro"
          class="relative"
          :to="`/quest/${task.processID}`"
          :ui="{
            wrapper:
              'bg-white gap-y-0 ring-1 ring-gray-100 hover:ring-gray-200 rounded-lg overflow-hidden cursor-pointer',
            container: 'group-hover:bg-dot py-4',
            inner: 'flex-1 px-4 overflow-hidden',
            image: {
              wrapper: 'ring-0 rounded-none aspect-[800/501]',
              base: 'ease-in-out',
            },
          }"
        >
          <template #title>
            <div class="text-left mb-1">
              {{ task.name }}
            </div>
            <TaskStatus :task="task" :address="address" />
          </template>

          <template #description>
            <div class="flex flex-col space-y-2">
              <div class="flex justify-between text-sm">
                <div>
                  <div>{{ $t('builders now') }}</div>
                </div>
                <div>
                  <div>
                    {{ task.submittersCount }}
                  </div>
                </div>
              </div>

              <div class="flex justify-between text-sm gap-x-2">
                <div>
                  <div>{{ $t('Bounty') }}</div>
                </div>
                
                <Bounties :bounties="task.bounties" :show-logo="false" class="font-medium" :show-plus="false" wrapper-class="flex flex-col items-end" />
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </div>

    <ClientOnly>
      <MountedTeleport to="#top-right-button" :disabled="!targetExists">
        <AddTaskDropdown
          v-if="community && isAdminOrOwner && !isLoading"
          @click-create-task="(type: Task['type']) => { createTaskType = type; isCreateTaskModalOpen = true }"
        />
      </MountedTeleport>
    </ClientOnly>

    <UModal v-model="isCreateTaskModalOpen">
      <UCard :ui="{ base: 'sm:min-w-[36rem] sm:max-w-full' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{ $t(`task.start.${createTaskType}`) }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isCreateTaskModalOpen = false"
            />
          </div>
        </template>
        <TaskForm
          v-if="community"
          :community="community"
          :task-type="createTaskType"
          @created="onTaskCreated"
        />
      </UCard>
    </UModal>
  </div>
</template>
