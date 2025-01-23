<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>
<template>
  <div class="box-border w-full h-full">
    <svg viewBox="0 0 48 48" :class="props.class" overflow="visible">
      <!-- curve path come from logos of Discord sidebar -->
      <defs><path id="cute-curve" d="M0 24C0 16.5449 0 12.8174 1.21793 9.87706C2.84183 5.95662 5.95662 2.84183 9.87706 1.21793C12.8174 0 16.5449 0 24 0C31.4551 0 35.1826 0 38.1229 1.21793C42.0434 2.84183 45.1582 5.95662 46.7821 9.87706C48 12.8174 48 16.5449 48 24C48 31.4551 48 35.1826 46.7821 38.1229C45.1582 42.0434 42.0434 45.1582 38.1229 46.7821C35.1826 48 31.4551 48 24 48C16.5449 48 12.8174 48 9.87706 46.7821C5.95662 45.1582 2.84183 42.0434 1.21793 38.1229C0 35.1826 0 31.4551 0 24Z" /></defs>
      <mask
        id="cute-mask"
        fill="black"
        x="0"
        y="0"
        width="48"
        height="48"
      ><use href="#cute-curve" fill="white" class="" />
      </mask>
      <foreignObject x="0" y="0" width="48" height="48" mask="url(#cute-mask)">
        <slot />
      </foreignObject>
    </svg>
  </div>
</template>

