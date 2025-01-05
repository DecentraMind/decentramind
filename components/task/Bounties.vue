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
  precisions?: Map<string, number>
  classNames?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  class: 'font-medium',
  precisions: undefined,
  classNames: '',
})

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

      const precision = props.precisions?.get(bounty.tokenProcessID) || 2

      return {
        pid: bounty.tokenProcessID,
        amount: bounty.amount.toFixed(precision),
        tokenName: bounty.tokenName,
        logo: props.showLogo && logo ? arUrl(logo, gateways.ario) : null,
        title: bigInt2Float(BigInt(quantity), denomination) + '',
      }
    })
})
</script>

<template>
  <span
    v-for="(bounty, index) in formattedBounties"
    :key="bounty.pid"
    class="inline-flex items-center"
  >
    <UPopover mode="hover" :popper="{ placement: 'top' }" class="w-full">
      <span :class="classNames" :title="bounty.title">
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
    <!-- + between bounties -->
    <span v-if="index < bounties.length - 1" class="mx-2">+</span>
  </span>
</template>
