<template>
  <div :class="containerClasses">
    <UIcon 
      name="svg-spinners:3-dots-fade" 
      :class="iconClasses"
      :size="iconSize" 
    />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/utils'

interface Props {
  class?: string
  iconClass?: string
  iconSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  iconClass: '',
  iconSize: 'xl'
})

const containerClasses = computed(() => 
  cn('flex justify-center items-center w-full', props.class)
)

const iconClasses = computed(() => 
  cn('w-[210px]', props.iconClass)
)
</script>
