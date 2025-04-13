<script setup lang="ts">
interface IProps {
  text: string
  canEdit?: boolean
  className?: string
  tag?: string
  mutate?: (_newText: string) => Promise<void>
  loading?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  canEdit: false,
  className: '',
  tag: 'div',
  loading: false
})

const emit = defineEmits<{
  (_e: 'update:text', _value: string): void
}>()

const isEditing = ref(false)
const inputRef = ref<HTMLElement | null>(null)
const newText = ref(props.text)

const onEdit = () => {
  if (!props.canEdit) return
  isEditing.value = true
  nextTick(() => {
    // Find the actual input element inside the UInput component
    if (inputRef.value) {
      const inputElement = inputRef.value.querySelector('input')
      inputElement?.focus()
    }
  })
}

const onBlur = async () => {
  isEditing.value = false
  if (newText.value === props.text) return
  
  if (props.mutate) {
    try {
      await props.mutate(newText.value)
    } catch (error) {
      // Reset to original text if mutation fails
      newText.value = props.text
      console.error('Failed to update text:', error)
    }
  } else {
    emit('update:text', newText.value)
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    // Find the actual input element to blur
    if (inputRef.value) {
      const inputElement = inputRef.value.querySelector('input')
      inputElement?.blur()
    }
  } else if (e.key === 'Escape') {
    newText.value = props.text
    isEditing.value = false
  }
}

watch(() => props.text, (newValue) => {
  newText.value = newValue
})
</script>

<template>
  <component 
    :is="tag" 
    :class="[className, { 'group cursor-pointer': canEdit }]"
    @click="onEdit"
  >
    <div v-if="isEditing" ref="inputRef" class="w-full relative inline-flex items-center">
      <UInput
        v-model="newText"
        variant="none"
        :class="className"
        class="min-w-[150px] w-full"
        size="lg"
        :ui="{
          base: 'py-2 px-0 focus:outline-none',
          padding: {
            lg: 'py-2 px-0'
          }
        }"
        @blur="onBlur"
        @keydown="onKeyDown"
      />
      <UIcon 
        v-if="loading" 
        name="i-heroicons-arrow-path" 
        class="absolute right-2 animate-spin" 
      />
    </div>
    <div v-else class="inline-flex items-center py-3">
      {{ text }}
      <UIcon 
        v-if="canEdit" 
        name="i-heroicons-pencil-square" 
        class="ml-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
      />
    </div>
  </component>
</template> 