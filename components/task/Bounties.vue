<script setup lang="ts">
import type { Task } from '~/types'
import {
  tokensByProcessID,
  bigInt2Float,
  float2BigInt,
  arUrl,
  gateways,
} from '~/utils'

interface Props {
  bounties: Task['bounties']
  showLogo?: boolean
  showPlus?: boolean
  precisions?: Map<string, number>
  class?: string
  wrapperClass?: string
  disablePopover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  class: 'font-medium',
  showPlus: true,
  precisions: undefined,
  wrapperClass: 'flex justify-start flex-wrap',
  disablePopover: false,
})

const defaultPrecisions = $computed(() =>
  props.bounties.reduce((carry, bounty) => {
    const fractionalLength = fractionalPart(bounty.amount).length
    carry.set(
      bounty.tokenProcessID,
      bounty.amount < 1 ? Math.min(4, fractionalLength + 1) : 2,
    )
    return carry
  }, new Map<string, number>()),
)

const formattedBounties = computed(() => {
  return props.bounties
    .filter(bounty => bounty.tokenName && bounty.amount)
    .map(bounty => {
      const token = tokensByProcessID[bounty.tokenProcessID]
      if (!token) {
        throw Error('Token info not found.')
      }

      const { logo, denomination } = token

      // Handle legacy data format
      let quantity = bounty.quantity
      if (quantity === undefined) {
        quantity = float2BigInt(bounty.amount, denomination)
        console.error('quantity undefined. try fix or delete task')
      }

      const precision = props.precisions
        ? props.precisions.get(bounty.tokenProcessID) || 2
        : defaultPrecisions.get(bounty.tokenProcessID)

      return {
        pid: bounty.tokenProcessID,
        amount: BigInt(0) === quantity ? '0' : bounty.amount.toFixed(precision),
        tokenName: bounty.tokenName,
        logo: props.showLogo && logo ? arUrl(logo, gateways.ario) : null,
        title: bigInt2Float(BigInt(quantity), denomination) + '',
      }
    })
})
</script>

<template>
  <div :class="props.wrapperClass">
    <div
      v-for="(bounty, index) in formattedBounties"
      :key="`${index}-${bounty.pid}`"
      :data-bounty-token-pid="bounty.pid"
      class="flex justify-start"
    >
      <!-- + between bounties -->
      <span v-if="index > 0 && props.showPlus" class="mx-2">+</span>
      <UPopover
        mode="hover"
        :disabled="disablePopover"
        :popper="{ placement: 'top' }"
        :ui="{
          trigger: 'flex justify-start items-center'
        }"
      >
        <span :class="props.class + ' whitespace-nowrap'" :title="bounty.title">
          {{ bounty.amount }} {{ bounty.tokenName }}
        </span>
        <img
          v-if="bounty.logo"
          :src="bounty.logo"
          class="w-6 h-6 rounded-full border border-gray-200 ml-1"
          alt=""
        >
        <template #panel>
          <div class="p-2 w-fit">
            {{ bounty.pid }}
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>
