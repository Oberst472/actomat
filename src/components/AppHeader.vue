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
        <div class="hidden md:flex items-center gap-2 text-xs text-neutral-500">
<!--          <UIcon name="i-lucide-check" class="size-3.5" />-->
<!--          <span>Saved <span class="text-neutral-900">·</span> 2 minutes ago</span>-->
        </div>
<!--        <UButton color="neutral" variant="outline" size="xs" class="hidden md:inline-flex">-->
<!--          <UKbd value="meta" />-->
<!--          <UKbd value="K" />-->
          <span v-if="greeting" class="text-xs ml-1 text-neutral-900">{{ greeting }}</span>
<!--        </UButton>-->
<!--        <UAvatar :text="initials" size="md" />-->

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

const initials = computed(
  () =>
    props.userName
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
)
</script>
