<template>
  <div class="flex gap-3 items-start">
    <UFormField label="Task ID" class="w-36">
      <UInput v-model="task.id" placeholder="CORE-152" />
    </UFormField>

    <UFormField label="Description" class="flex-1">
      <UTextarea v-model="task.description" placeholder="Task description..." :rows="2" />
    </UFormField>

    <UFormField label="Hours" class="w-24">
      <UInput v-model="task.hours" type="number" step="0.1" min="0" placeholder="0.0" />
    </UFormField>

    <UButton
      icon="i-lucide-trash-2"
      color="error"
      variant="ghost"
      class="mt-6"
      @click="$emit('remove')"
    />
  </div>
</template>

<script setup>
defineProps({
  task: { type: Object, required: true }
})
defineEmits(['remove'])
</script>
