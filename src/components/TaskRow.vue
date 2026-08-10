<template>
  <div :class="['group first:pt-0 last:pb-0', dense ? 'py-3' : 'py-4']">
    <div class="flex items-end gap-3">
      <div class="size-10 shrink-0 grid place-items-center rounded-md bg-neutral-50 ring-1 ring-neutral-200 text-neutral-500 text-[11px] font-mono tabular-nums">
        {{ String(index + 1).padStart(2, '0') }}
      </div>

      <UFormField label="Task ID" class="w-44 shrink-0">
        <UInput
          :model-value="task.id"
          size="xl"
          placeholder="CORE-152"
          class="w-full"
          :ui="{ base: 'font-mono font-light tracking-tight' }"
          @update:model-value="(v) => update('id', String(v).toUpperCase())"
        />
      </UFormField>

      <div class="grow" />

      <UFormField label="Hours" class="w-32 shrink-0">
        <UInput
          :model-value="fmtHours(parseNum(task.hours))"
          size="xl"
          readonly
          tabindex="-1"
          title="Auto-distributed from net amount ÷ price per hour"
          class="w-full"
          :ui="{ base: 'text-right tabular-nums font-light bg-neutral-50 cursor-default' }"
        >
          <template #trailing>
            <span class="text-xs text-neutral-500 font-medium">h</span>
          </template>
        </UInput>
      </UFormField>

      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="outline"
        :disabled="!canRemove"
        square
        class="size-10 shrink-0 justify-center"
        @click="$emit('remove')"
      />
    </div>

    <div class="mt-3">
      <UFormField label="Description">
        <UTextarea
          :model-value="task.description"
          :rows="2"
          placeholder="What was done in this task…"
          class="w-full"
          @update:model-value="(v) => update('description', v)"
        />
      </UFormField>
    </div>
  </div>
</template>

<script setup>
import { fmtHours, parseNum } from '../utils/formatters.js'

const props = defineProps({
  task: { type: Object, required: true },
  index: { type: Number, required: true },
  canRemove: { type: Boolean, default: true },
  dense: { type: Boolean, default: false }
})
const emit = defineEmits(['update', 'remove'])

const update = (key, value) => emit('update', { ...props.task, [key]: value })
</script>
