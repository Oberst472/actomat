<template>
  <header class="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-neutral-200">
    <div class="max-w-[1280px] mx-auto h-14 px-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <div class="size-7 rounded-md grid place-items-center text-white font-bold text-xs bg-primary-500">
          A
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-semibold text-sm tracking-tight text-neutral-900">aktomat</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="greeting" class="text-xs ml-1 text-neutral-900">{{ greeting }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userName: { type: String, default: 'User' }
})


const greeting = computed(() => {
  const name = props.userName?.trim()
  return name && name !== 'User' ? `Hello ${name}` : ''
})
</script>
