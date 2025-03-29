<script setup lang="ts">
import type { Bounty, Task, BountySendHistory, AllSubmissionWithCalculatedBounties } from '~/types'
import Bounties from './Bounties.vue'
import { tokensByProcessID, calcBounties, bigInt2Float, shortString } from '~/utils'
import { decentraMindReceiver, DM_BOUNTY_CHARGE_PERCENT } from '~/utils/constants'
import { updateTaskSubmissionBounties } from '~/utils/task'
import { retry } from '~/utils/util'
import { useTaskStore } from '~/stores/taskStore'
import { notificationStore } from '~/stores/notificationStore'

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
      props.task.totalChances,
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
      refundMap[pid].quantity -= BigInt(bounty.quantity)
      const denomination = tokensByProcessID[pid].denomination
      refundMap[pid].amount = bigInt2Float(refundMap[pid].quantity, denomination)

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

      refundMap[pid].quantity -= BigInt(correctQuantity)
      refundMap[pid].amount = bigInt2Float(refundMap[pid].quantity, denomination)
    } else {
      bounties.push(returnBounty)
    }
  }

  // add refundMap to bountiesToSend
  const refundBounties = Object.values(refundMap)
  for (const refundBounty of refundBounties) {
    // don't use refundBounty.amount to filter here, the amount may be like 0.000000000000034
    if (refundBounty.quantity > BigInt(0)) {
      console.log('refundBounty quantity is greater than 0', refundBounty)
      bounties.push(refundBounty)
    } else {
      console.log('refundBounty quantity is smaller than 0', refundBounty)
    
      refundBounty.quantity = BigInt(0)
      refundBounty.amount = 0
      // if refund quantity is smaller than 0, set the refund bounty to 0 and minus the amount from the fee
      const feeBounty = bounties.find(bounty => bounty.type === 'fee' && bounty.recipient === refundBounty.recipient)
      if (feeBounty) {
        feeBounty.quantity += refundBounty.quantity
        const denomination = tokensByProcessID[feeBounty.tokenProcessID].denomination
        feeBounty.amount = bigInt2Float(feeBounty.quantity, denomination)
      }
    }
  }

  // check if sum of all quantity is equal to total quantity
  const totalQuantityMap = {} as Record<string, bigint>
  for (const bounty of bounties) {
    if (!totalQuantityMap[bounty.tokenProcessID]) {
      totalQuantityMap[bounty.tokenProcessID] = BigInt(0)
    }
    totalQuantityMap[bounty.tokenProcessID] += bounty.quantity
  }

  for (const [pid, quantity] of Object.entries(totalQuantityMap)) {
    const totalQuantity = props.task.bounties.find(bounty => bounty.tokenProcessID === pid)?.quantity
    if (quantity.toString() !== totalQuantity?.toString()) {
      console.error('Total quantity is not equal to the sum of all quantity.')
      console.error('pid = ', pid)
      console.error('quantity = ', quantity)
      console.error('totalQuantity = ', totalQuantity)
      throw new Error('Total quantity is not equal to the sum of all quantity.')
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

  // console.log('bountiesToSend', bountiesToSend.value)
  // sumup the quantity of all bounties, group by tokenProcessID
  // const totalQuantityMap = {} as Record<string, bigint>
  // for (const bounty of bountiesToSend.value) {
  //   if (!totalQuantityMap[bounty.tokenProcessID]) {
  //     totalQuantityMap[bounty.tokenProcessID] = BigInt(0)
  //   }
  //   totalQuantityMap[bounty.tokenProcessID] += bounty.quantity
  // }
  // console.log('totalQuantityMap', totalQuantityMap)
  // isLoading = false
  
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

const precisions = $computed(() =>
  props.task.bounties.reduce((carry, bounty) => {
    const token = tokensByProcessID[bounty.tokenProcessID]
    if (!token) {
      return carry
    }
    const denomination = token.denomination
    carry.set(
      bounty.tokenProcessID,
      denomination <= 6 ? 6 : 8,
    )
    return carry
  }, new Map<string, number>()),
)
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
                <p class="font-medium">
                  {{ shortString(key.split('@')[0]) }}&emsp;
                  <span v-if="key.split('@')[0] === decentraMindReceiver" class="text-gray-400 text-sm mr-4">DecentraMind</span>
                  <span v-if="key.split('@')[0] === task.ownerAddress" class="text-gray-400 text-sm mr-4">Task Owner</span>
                </p>
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
            <div class="flex flex-col gap-2">
              <Bounties :bounties="transformBounties(recipientBounties)" :show-plus="false" :precisions="precisions" />
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