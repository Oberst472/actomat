<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6">Acceptance Act Generator</h1>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Personal Info</h2>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Email">
          <UInput v-model="email" type="email" placeholder="email@example.com" />
        </UFormField>
        <UFormField label="Full Name">
          <UInput v-model="fullName" placeholder="John Doe" />
        </UFormField>
      </div>
    </UCard>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Act Details</h2>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Price per hour (zl)">
          <UInput v-model="pricePerHour" type="number" step="0.01" min="0" />
        </UFormField>
        <UFormField label="Act Number">
          <UInput v-model="actNumber" placeholder="3" />
        </UFormField>
        <UFormField label="Act Date (Submitted on)">
          <UInput v-model="actDate" type="date" />
        </UFormField>
        <UFormField label="Agreement Date (from)">
          <UInput v-model="agreementDate" type="date" />
        </UFormField>
      </div>
    </UCard>

    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Tasks</h2>
          <UButton icon="i-lucide-plus" label="Add Task" size="sm" @click="addTask" />
        </div>
      </template>

      <div class="space-y-4">
        <TaskRow
          v-for="(task, index) in tasks"
          :key="index"
          :task="task"
          @remove="removeTask(index)"
        />
      </div>

      <div v-if="tasks.length === 0" class="text-center text-gray-400 py-4">
        No tasks added. Click "Add Task" to begin.
      </div>
    </UCard>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Summary</h2>
      </template>

      <div class="grid grid-cols-2 gap-2 max-w-sm">
        <span class="text-gray-500">Total hours:</span>
        <span class="text-right font-medium">{{ totalHours.toFixed(1) }}</span>

        <span class="text-gray-500">Net amount:</span>
        <span class="text-right font-medium">{{ formatCurrency(netAmount) }}</span>

        <span class="text-gray-500">VAT (23%):</span>
        <span class="text-right font-medium">{{ formatCurrency(vatAmount) }}</span>

        <USeparator class="col-span-2" />

        <span class="text-gray-900 font-bold">TOTAL DUE:</span>
        <span class="text-right font-bold text-primary">{{ formatCurrency(totalDue) }}</span>
      </div>
    </UCard>

    <UButton
      label="Create Act"
      icon="i-lucide-file-text"
      size="xl"
      block
      @click="handleCreateAct"
    />
  </div>
</template>

<script setup>
import TaskRow from './TaskRow.vue'
import { useActForm } from '../composables/useActForm.js'
import { formatCurrency } from '../utils/formatters.js'
import { generatePdf } from '../utils/generatePdf.js'

const {
  email,
  fullName,
  pricePerHour,
  actNumber,
  actDate,
  agreementDate,
  tasks,
  totalHours,
  netAmount,
  vatAmount,
  totalDue,
  addTask,
  removeTask
} = useActForm()

function handleCreateAct() {
  generatePdf({
    email: email.value,
    fullName: fullName.value,
    pricePerHour: pricePerHour.value,
    actNumber: actNumber.value,
    actDate: actDate.value,
    agreementDate: agreementDate.value,
    tasks: tasks.value,
    totalHours: totalHours.value,
    netAmount: netAmount.value,
    vatAmount: vatAmount.value,
    totalDue: totalDue.value
  })
}
</script>
