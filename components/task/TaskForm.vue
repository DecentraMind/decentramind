<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { timezones, tokens, tokenChains } from '~/utils/constants'
import type { Community, Task, TaskForm, TaskFormWithLink } from '~/types/index'
import { arUrl, taskBannersMap, gateways } from '~/utils/arAssets'
import { formatDate, taskSchema } from '~/utils'
import { validateTaskForm } from '~/utils/schemas'
import { useTaskStore } from '~/stores/taskStore'

const { t } = useI18n()

const taskStore = useTaskStore()
const { createTask } = taskStore
const { showError } = $(notificationStore())

const props = defineProps<{
  taskForm?: TaskForm
  taskType: Task['type']
  community: Community
}>()

const emit = defineEmits<{
  (e: 'created'): void
}>()

let defaultTaskForm: TaskForm | TaskFormWithLink = {
  processID: '',
  type: props.taskType,
  visible: 'public',
  banner: taskBannersMap[props.taskType][0],
  name: '',
  intro: '',
  rule: t(`task.rules.${props.taskType}`),
  bounties: [
    {
      tokenName: '',
      amount: '' as unknown as number,
      tokenProcessID: '',
      chain: '',
    },
    {
      tokenName: '',
      amount: '' as unknown as number,
      tokenProcessID: '',
      chain: '',
    },
  ],
  totalChances: 0,
  timezone: getLocalTimezone(),
  startTime: undefined as unknown as number,
  endTime: undefined as unknown as number,
  communityUuid: '',
}

if (['promotion', 'bird', 'article'].includes(props.taskType)) {
  defaultTaskForm = {
    ...defaultTaskForm,
    link: '',
  } as TaskFormWithLink
}

let task = $ref<TaskForm>(defaultTaskForm)
let isPostingTask = $ref(false)

const form = ref()

type RangeValue = [Dayjs, Dayjs]
const taskDateRange = $ref<RangeValue>()

function handleDateChange(
  value: [string, string] | [Dayjs, Dayjs],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: [string, string],
) {
  // TODO get tiemstamp based on timezone
  console.log({ value, taskDateRange, timezone: task.timezone })
  if (!taskDateRange) {
    return
  }

  const offset = new Date().getTimezoneOffset() * 60000
  const timezone = task.timezone.match(/[-+]\d+/)
  
  const timezoneOffset = timezone ? parseInt(timezone[0]) * -60*60*1000 : offset
  // translate to UTC time
  task.startTime = new Date(taskDateRange[0].toString()).getTime() - offset + timezoneOffset
  task.endTime = new Date(taskDateRange[1].toString()).getTime() - offset + timezoneOffset
  form.value.validate('time')
  console.log({
    offset,
    timezoneOffset,
    startTime: formatDate(task.startTime),
    start: task.startTime,
    endTime: formatDate(task.endTime)
  })
}

const taskBannersUrl = taskBannersMap[task.type].map(banner => arUrl(banner))
const currentBannerIndex = $ref(0)
const updateBanner = (index: number) => {
  if (taskBannersMap[task.type][index - 1]) {
    task.banner = taskBannersMap[task.type][index - 1]
  }
}

const tokenNames = Object.keys(tokens)

async function onSubmitTaskForm() {
  isPostingTask = true
  try {
    if (!props.community) {
      throw new Error('Community info not loaded.')
    }
    console.log({ submitTask: task })

    await createTask(task, props.community.name)
    emit('created')
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Unknown Error'

    if (message.includes('Insufficient Balance')) {
      showError('Balance Error!')
      return
    }

    // TODO show progress of task creation
    // TODO return bounty if creation failed in the middle

    showError('Failed to create task. ' + message || '')
    console.error('create task error', error)
  } finally {
    isPostingTask = false
  }
}

onMounted(() => {
  task = props.taskForm || defaultTaskForm
  task.communityUuid = props.community.uuid
  console.log({ task })
})
</script>

<template>
  <UForm
    ref="form"
    :state="task"
    :schema="taskSchema"
    class="space-y-7 flex flex-col justify-center"
    :validate="validateTaskForm"
    @submit="onSubmitTaskForm"
  >
    <UFormGroup
      name="banner"
      :label="$t('Banner')"
      :ui="{ innner: 'min-w-[40rem]' }"
    >
      <template #label>
        <div class="w-[300px]">
          {{ $t('Banner') }}
        </div>
      </template>
      <UCarousel
        v-model="currentBannerIndex"
        :items="taskBannersUrl"
        :ui="{
          item: 'basis-full min-h-36',
          container: 'rounded-lg gap-2',
          indicators: {
            wrapper: 'relative bottom-0 mt-4',
          },
        }"
        indicators
        class="w-64 mx-auto"
      >
        <template #default="{ item }">
          <img :src="item" class="w-full" draggable="false">
        </template>

        <template #indicator="{ onClick, page, active }">
          <UButton
            :label="String(page)"
            :variant="active ? 'solid' : 'outline'"
            size="2xs"
            class="rounded-full min-w-6 justify-center"
            @click="
              () => {
                currentBannerIndex = page
                updateBanner(page)
                onClick(page)
              }
            "
          />
        </template>
      </UCarousel>
    </UFormGroup>

    <UFormGroup name="name" :label="$t('Name of Quest')">
      <UInput v-model.trim="task.name" placeholder="name" />
    </UFormGroup>

    <UFormGroup v-if="task.type === 'promotion'" name="link" :label="$t('task.fields.Promotion Quest Link')">
      <UInput v-model.trim="(task as TaskFormWithLink).link" :placeholder="$t('task.fields.Promotion Quest Link')" />
    </UFormGroup>

    <UFormGroup name="intro" :label="$t('Task Introduction')">
      <UTextarea v-model.trim="task.intro" />
    </UFormGroup>

    <UFormGroup name="rule" :label="$t('Rules of the Quest')">
      <UTextarea
        v-model.trim="task.rule"
        disabled
        :placeholder="$t(`task.rules.${task.type}`)"
      />
    </UFormGroup>

    <div>
      <UFormGroup
        v-for="(formGroup, index) in task.bounties"
        :key="index"
        v-model="task.bounties[index]"
        :name="`bounties[${index}]`"
        :label="index === 0 ? $t('Bounty') : ''"
        :ui="{ error: index === 0 ? 'hidden' : 'absolute' }"
      >
        <div class="flex justify-between items-center gap-x-1 mb-1">
          <UInput
            v-model.number="formGroup.amount"
            :name="`bounties[${index}].amount`"
            type="number"
            placeholder="Amount"
            :model-modifiers="{ number: true }"
            :ui="{ base: 'w-24' }"
          />

          <USelectMenu
            v-model="formGroup.tokenName"
            :name="`bounties[${index}].tokenProcessID`"
            placeholder="Token"
            :options="tokenNames"
            :ui="{ wrapper: 'w-full' }"
            @change="
              (name:string) => {
                formGroup.tokenProcessID = tokens[name].processID
                formGroup.chain = tokenChains[0]
              }
            "
          >
            <template #option="{ option: name }">
              <img
                :src="
                  arUrl(tokens[name].logo || defaultTokenLogo, gateways.ario)
                "
                :alt="`logo of ${tokens[name].label}`"
                class="w-8 h-8 rounded-full border border-gray-200"
              >
              <span class="truncate" :title="tokens[name].label">{{ tokens[name].label }}</span>
            </template>
          </USelectMenu>

          <USelectMenu
            v-model="formGroup.chain"
            :name="`bounties[${index}].chain`"
            placeholder="Chain"
            :options="tokenChains"
            :ui="{ wrapper: 'w-full' }"
          />
        </div>
      </UFormGroup>
    </div>

    <UFormGroup name="totalChances" :label="$t('Total Chances')">
      <UInput
        v-model.number="task.totalChances"
        type="number"
        :placeholder="$t('Total Chances')"
      />
    </UFormGroup>

    <UFormGroup name="time" :label="$t('Time')">
      <div class="flex justify-between items-center gap-x-1">
        <USelect
          v-model="task.timezone"
          :placeholder="$t('Time Zone')"
          :options="timezones"
          :ui="{
            variant: {
              outline:
                'ring-gray-300 dark:ring-primary-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
            },
          }"
          @change="handleDateChange"
        />
        <a-range-picker
          v-model:value="taskDateRange"
          show-time
          @change="handleDateChange"
        />
      </div>
    </UFormGroup>

    <UButton
      color="primary"
      type="submit"
      :loading="isPostingTask"
      :disabled="isPostingTask"
      class="self-center !mt-8"
    >
      {{ $t('Post the Quest') }}
    </UButton>
  </UForm>
</template>
