<script setup lang="ts">
import type { Bounty, Task, BountySendHistory, AllSubmissionWithCalculatedBounties } from '~/types'
import Bounties from './Bounties.vue'
import { tokensByProcessID, calcBounties, bigInt2Float, shortString } from '~/utils'
import { decentraMindReceiver, DM_BOUNTY_CHARGE_PERCENT } from '~/utils/constants'
import { updateTaskSubmissionBounties } from '~/utils/task'

const props = defineProps<{
  modelValue: boolean
  task: Task
  selectedSubmissions: AllSubmissionWithCalculatedBounties[]
  communityInfo: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [],
  'cancel': []
}>()

type BountySendType = 'send' | 'refund' | 'fee'
type BountyWithSendType = Bounty & {
  type: BountySendType
}

const { sendBounty, storeBounty } = useTaskStore()
const { showError, showSuccess } = $(notificationStore())

let isLoading = $ref(false)

const bountiesToSend = computed(() => {
  if (!props.task || !props.selectedSubmissions) return []

  const bounties: BountyWithSendType[] = []
  const selectedTotalScore = props.selectedSubmissions.reduce(
    (total, submission) => {
      total += submission.score
      return total
    },
    0,
  )
  console.group('Bounty calculating')
  console.log({ selected: props.selectedSubmissions })
  // submissions
  //   .map(s => {
  //     return s.calculatedBounties
  //   })
  //   .forEach(i => console.table(i))

  props.selectedSubmissions.forEach(submission => {
    const calculated = calcBounties(
      submission,
      selectedTotalScore,
      props.selectedSubmissions.length,
      props.task.bounties,
    )
    submission.calculatedBounties = calculated as Task['bounties']
  })

  console.log('calculated bounties')
  props.selectedSubmissions.forEach(s => {
    console.log(s.address, 'calculated bounties:')
    console.table(s.calculatedBounties)
  })
  console.groupEnd()

  /** bounties that should send back to the task owner */
  const refundMap = {} as Record<string, BountyWithSendType>
  // initialize refoundMap
  for (const taskBounty of props.task.bounties) {
    const { tokenProcessID: pid } = taskBounty
    if (!refundMap[pid]) {
      refundMap[pid] = {
        taskPid: props.task.processID,
        sender: props.task.ownerAddress,
        recipient: props.task.ownerAddress,
        tokenProcessID: pid,
        amount: 0,
        quantity: BigInt(0),
        type: 'refund' as BountySendType,
      }
    }
    refundMap[pid].amount += taskBounty.amount
    refundMap[pid].quantity += BigInt(taskBounty.quantity)
  }

  // set decentraMind service charge quantity
  const dmQuantityMap = {} as Record<string, bigint>
  for (const [pid, returnBounty] of Object.entries(refundMap)) {
    if (!dmQuantityMap[pid]) {
      dmQuantityMap[pid] =
        (returnBounty.quantity * BigInt(DM_BOUNTY_CHARGE_PERCENT)) /
        BigInt(100)
    }
  }

  props.selectedSubmissions.forEach(submission => {
    submission.calculatedBounties.forEach((bounty: any) => {
      const pid = bounty.tokenProcessID
      const bountyData = {
        taskPid: props.task.processID,
        sender: props.task.ownerAddress,
        recipient: submission.address,
        tokenProcessID: pid,
        amount: bounty.amount,
        quantity: bounty.quantity,
        type: 'send' as BountySendType,
      }

      // update refoundMap
      refundMap[pid].amount -= bounty.amount
      refundMap[pid].quantity -= BigInt(bounty.quantity)

      bounties.push(bountyData)
    })
  })

  for (const [pid, returnBounty] of Object.entries(refundMap)) {
    // add DecentraMind bounty service charges if submissions.length > 0
    if (props.selectedSubmissions.length) {
      const quantity = dmQuantityMap[pid]

      // to avoid total quantity greater than available number, you have to correct the quantity
      const correctQuantity =
        quantity > returnBounty.quantity ? returnBounty.quantity : quantity
      const denomination = tokensByProcessID[pid].denomination
      const correctAmount = bigInt2Float(correctQuantity, denomination)
      bounties.push({
        taskPid: props.task.processID,
        sender: props.task.ownerAddress,
        recipient: decentraMindReceiver,
        tokenProcessID: pid,
        amount: correctAmount,
        quantity: correctQuantity,
        type: 'fee' as BountySendType,
      })

      refundMap[pid].amount -= correctAmount
      refundMap[pid].quantity -= BigInt(correctQuantity)
    } else {
      bounties.push(returnBounty)
    }
  }

  // add refundMap to bountiesToSend
  const refundBounties = Object.values(refundMap)
  for (const refundBounty of refundBounties) {
    // don't use refundBounty.amount to filter here, the amount may be like 0.000000000000034
    if (refundBounty.quantity > BigInt(0)) {
      bounties.push(refundBounty)
    }
  }

  console.log('bounties to send:', {
    bounties,
    submissions: props.selectedSubmissions,
    refundMap: refundMap,
  })


  return bounties
})

const bountyGroups = computed(() => {
  const groups = new Map<string, BountyWithSendType[]>()

  bountiesToSend.value.forEach(bounty => {
    const key = bounty.recipient + '@' + bounty.type
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(bounty)
  })
  return groups
})

const transformBounties = (bounties: BountyWithSendType[]) => {
  return bounties.map(bounty => ({
    ...bounty,
    tokenName: tokensByProcessID[bounty.tokenProcessID]?.label || bounty.tokenProcessID,
    chain: 'arweave'
  }))
}

const onUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}

const onConfirm = async () => {
  isLoading = true
  try {
    await updateTaskSubmissionBounties(props.task.processID, props.selectedSubmissions)
    const sendBountyResult = await sendBounty(props.task.processID, bountiesToSend.value)

    if (!props.selectedSubmissions.length) {
      showSuccess('The bounty has been returned!')
    } else {
      showSuccess(
        'Your bounties have been sent. You can view them in the Transaction Book.',
      )
    }

    if (!sendBountyResult) {
      return
    }

    try {
      const sentBounties: BountySendHistory[] = []
      for (const bounty of bountiesToSend.value) {
        const sent = {
          ...bounty,
          communityUuid: props.communityInfo.uuid,
          communityName: props.communityInfo.name,
          taskName: props.task.name,
        }
        sentBounties.push(sent)
      }

      await retry({
        fn: async () => {
          return await storeBounty(props.task.processID, sentBounties)
        },
        maxAttempts: 3,
      })
    } catch (e) {
      console.error('Failed to set task status to settled.')
      console.error(e)
    }

    emit('success')
  } catch (e) {
    console.error(e)
    showError('Send bounty failed.', e as Error)
  } finally {
    isLoading = false
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{ width: 'sm:max-w-xl' }"
    @update:model-value="onUpdateModelValue"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6">
            {{ $t('Confirm Bounty Distribution') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="onUpdateModelValue(false)"
          />
        </div>
      </template>

      <div class="space-y-4 max-h-[60vh] overflow-y-auto">
        <p class="text-sm text-gray-500">
          {{ $t('Please review the following bounty distribution details') }}
        </p>

        <div class="space-y-4">
          <div v-for="[key, recipientBounties] in bountyGroups" :key="key" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex justify-between w-full">
                <span class="font-medium">{{ shortString(key.split('@')[0]) }}</span>
                <UBadge v-if="key.split('@')[1] === 'refund'" color="green" variant="subtle">
                  {{ $t('task.Refund') }}
                </UBadge>
                <UBadge v-if="key.split('@')[1] === 'fee'" color="pink" variant="subtle">
                  {{ $t('task.Fee') }}
                </UBadge>
              </div>

              <div class="flex gap-2">
                <UBadge v-if="key === task.ownerAddress" color="primary" variant="subtle">
                  {{ $t('Task Owner') }}
                </UBadge>
                <UBadge v-if="key === decentraMindReceiver" color="primary" variant="subtle">
                  {{ $t('DecentraMind fee address') }}
                </UBadge>
              </div>
            </div>
            <div class="flex">
              <Bounties :bounties="transformBounties(recipientBounties)" />
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <UButton
            color="gray"
            variant="soft"
            :label="$t('Cancel')"
            @click="onUpdateModelValue(false); emit('cancel')"
          />
          <UButton
            :loading="isLoading"
            :disabled="isLoading"
            :label="$t('task.Confirm and send')"
            @click="onConfirm"
          />
        </div>
      </div>
    </UCard>
  </UModal>
</template> 