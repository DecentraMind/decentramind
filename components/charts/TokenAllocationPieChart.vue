<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisBulletLegend, VisTooltip } from '@unovis/vue'
import { Donut } from '@unovis/ts'
import { type TokenSupply } from '~/utils/constants'
import { computed } from 'vue'

interface ChartDataItem {
  name: string
  value: number
}

const props = defineProps<{
  tokenSupply: TokenSupply[]
  totalSupply?: string
}>()

// Convert token supply data to chart data
const chartData = computed<ChartDataItem[]>(() => {
  if (!props.tokenSupply || props.tokenSupply.length === 0) {
    console.warn('TokenSupply is not available or is empty')
    return []
  }
  
  return props.tokenSupply.map(item => ({
    name: item.name,
    value: item.supply
  }))
})

// Generate legend items from token data
const legendItems = computed(() => 
  chartData.value.map(item => ({
    name: item.name
  }))
)

// Tooltip configuration using proper segment selector
const triggers = {
  [Donut.selectors.segment]: (d: any) => {
    if (!d || !d.data) return ''
    const item = d.data
    return `
      <div class="rounded">
        <div class="font-medium">${item.name}</div>
        <div>${item.value} %</div>
      </div>
    `
  }
}
</script>

<template>
  <div class="relative flex flex-col h-full w-full">
    <div class="w-full absolute top-0 left-0">
      <VisBulletLegend :items="legendItems" orientation="vertical" />
    </div>
    <div class="w-full h-full relative pb-12">
      <VisSingleContainer :data="chartData" :height="300">
        <VisDonut
          :arc-width="0"
          :value="(d: ChartDataItem) => d.value"
          :name="(d: ChartDataItem) => d.name"
          :show-empty-segments="false"
        />
        <VisTooltip :triggers="triggers" />
      </VisSingleContainer>
      <!-- Center text overlay for Total Supply -->
      <div v-if="totalSupply" class="absolute bottom-0 left-0 right-0 text-center text-sm font-medium mb-4">
        Total Supply {{ totalSupply }}
      </div>
    </div>
  </div>
</template> 