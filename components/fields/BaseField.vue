<template>
  <div v-if="value || $slots.default || link || $slots.link || values?.length" :class="classes.wrapper">
    <div class="font-medium">{{ name }}</div>

    <div v-if="$slots.default" :class="classes.base">
      <slot />
    </div>
    <div v-else :class="classes.base">
      {{ value }}
    </div>


    <div v-if="$slots.values" :class="classes.base">
      <slot name="values" v-bind="{ values }" />
    </div>
    <div v-else-if="values">
      <UPopover
        mode="hover"
        :popper="{ placement: 'top-end' }"
      >
        <div :class="classes.tags">
          <span
            v-for="(v, index) in values.slice(0, 2)"
            :key="index"
            :class="cn(classes.tag, 'cursor-default')"
          >{{ valueKey ? v[valueKey] : v }}</span>
        </div>
        <template #panel>
          <div v-if="values.length > 2" class="flex-center px-2 gap-x-1.5">
            <div
              v-for="(v, idx) in values"
              :key="idx"
            >
              {{ v }} {{ idx < values.length-1 ? '/ ' : '' }}
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div v-if="$slots.link" :class="classes.base">
      <slot />
    </div>
    <div v-else-if="link" :class="classes.link">
      <ULink
        :to="link"
        target="_blank"
        active-class="text-primary"
        :inactive-class="cn(classes.link, classes.tag)"
      >
        <UIcon v-if="linkIcon" :name="linkIcon" class="h-5 w-5" />
        {{ linkText || link }}
      </ULink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { baseFieldClasses as classes } from './index'

// TODO show token/trading platform icons
// const icons = {
//   tokens: tokenNames.reduce((carry, name) => {
//     carry[tokens[name].processID] = tokens[name].logo || defaultTokenLogo
//     return carry
//   }, {} as { [key: string]: string })
// }

defineProps<{
  name: string
  value?: string|number
  values?: Array<Record<string, string|number>>
  valueKey?: string
  link?: string
  linkIcon?: string
  linkText?: string
}>()
</script>
