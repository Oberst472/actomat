<template>
  <div class="flex items-center justify-between gap-3">
    <div class="flex flex-col gap-0.5 min-w-0">
      <span v-if="eyebrow" class="text-[11px] uppercase tracking-[0.08em] font-semibold text-neutral-500">
        {{ eyebrow }}
      </span>
      <h2 v-if="title" class="text-[15px] font-semibold leading-tight truncate text-neutral-900">
        {{ title }}
      </h2>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  eyebrow: String,
  title: String
})
</script>
