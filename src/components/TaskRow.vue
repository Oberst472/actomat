<template>
  <div :class="['group first:pt-0 last:pb-0', dense ? 'py-3' : 'py-4']">
    <div class="flex items-end gap-3">
      <div class="size-7 shrink-0 grid place-items-center rounded-md bg-neutral-50 ring-1 ring-neutral-200 text-neutral-500 text-[11px] font-mono tabular-nums mb-0.5">
        {{ String(index + 1).padStart(2, '0') }}
      </div>

      <UFormField label="Task ID" class="w-44 shrink-0">
        <UInput
          :model-value="task.id"
          placeholder="CORE-152"
          class="w-full"
          :ui="{ base: 'font-mono tracking-tight' }"
          @update:model-value="(v) => update('id', String(v).toUpperCase())"
        />
      </UFormField>

      <div class="grow" />

      <UFormField label="Hours" class="w-32 shrink-0">
        <UInput
          :model-value="task.hours"
          type="number"
          inputmode="decimal"
          step="0.5"
          min="0"
          placeholder="0.0"
          class="w-full"
          :ui="{ base: 'text-right tabular-nums' }"
          @update:model-value="(v) => update('hours', v)"
        >
          <template #trailing>
            <span class="text-xs text-neutral-500 font-medium">h</span>
          </template>
        </UInput>
      </UFormField>

      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        :disabled="!canRemove"
        square
        size="md"
        class="mb-0.5"
        @click="$emit('remove')"
      />
    </div>

    <div class="mt-3 pl-10">
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
const props = defineProps({
  task: { type: Object, required: true },
  index: { type: Number, required: true },
  canRemove: { type: Boolean, default: true },
  dense: { type: Boolean, default: false }
})
const emit = defineEmits(['update', 'remove'])

const update = (key, value) => emit('update', { ...props.task, [key]: value })
</script>
