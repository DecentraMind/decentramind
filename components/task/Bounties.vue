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
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  class: 'font-medium',
  showPlus: true,
  precisions: undefined
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
  <div
    v-for="(bounty, index) in formattedBounties"
    :key="bounty.pid"
    class="flex justify-start"
  >
    <!-- + between bounties -->
    <span v-if="index > 0 && props.showPlus" class="mx-2">+</span>
    <UPopover
      mode="hover"
      :popper="{ placement: 'top' }"
      :ui="{
        trigger: 'flex justify-start items-center'
      }"
    >
      <span :class="props.class" :title="bounty.title">
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
</template>
