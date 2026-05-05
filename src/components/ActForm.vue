<template>
  <div class="min-h-screen bg-neutral-100 text-neutral-900">
    <AppHeader :user-name="data.fullName || 'User'" />

    <main class="max-w-[1280px] mx-auto px-6 py-8">
      <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
            <span>Documents</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" />
            <span>Acts</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" />
            <span class="text-neutral-900">New</span>
          </div>
          <h1 class="text-[26px] font-semibold tracking-tight leading-tight">
            Acceptance Act Generator
          </h1>
          <p class="text-[13.5px] text-neutral-500 mt-1.5 max-w-xl">
            Fill in the details below and download a signed-ready PDF for your client. Drafts auto-save.
          </p>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Completion</span>
          <div class="flex items-center gap-2 mt-1">
            <UProgress :model-value="completion" :max="100" size="sm" class="w-32" />
            <span class="text-xs font-medium tabular-nums w-9 text-right">{{ completion }}%</span>
          </div>
        </div>
      </div>

      <div :class="['grid gap-6', settings.showPreview ? 'xl:grid-cols-[1fr_460px]' : 'grid-cols-1']">
        <div class="flex flex-col gap-5 min-w-0">
          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 1" title="Personal Info">
                <template #action>
                  <span class="inline-flex items-center gap-1.5 text-[11.5px] text-neutral-500">
                    <UIcon name="i-lucide-info" class="size-3" /> Used as contractor on the act
                  </span>
                </template>
              </CardHeader>
            </template>

            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Email">
                <UInput
                  v-model="data.email"
                  type="email"
                  icon="i-lucide-mail"
                  placeholder="email@example.com"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Full Name">
                <UInput
                  v-model="data.fullName"
                  icon="i-lucide-user"
                  placeholder="Anna Kowalska"
                  class="w-full"
                />
              </UFormField>
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 2" title="Act Details" />
            </template>

            <div class="grid sm:grid-cols-2 gap-x-5 gap-y-4">
              <UFormField label="Price per hour" hint="Net rate, excluding VAT.">
                <UInput
                  v-model="data.pricePerHour"
                  icon="i-lucide-coins"
                  placeholder="0,00"
                  class="w-full"
                  :ui="{ base: 'text-right tabular-nums' }"
                >
                  <template #trailing>
                    <span class="text-xs text-neutral-500 font-medium">{{ settings.currency }}</span>
                  </template>
                </UInput>
              </UFormField>
              <UFormField label="Act Number" hint="Sequential number for this client.">
                <UInput v-model="data.actNumber" icon="i-lucide-hash" placeholder="3" class="w-full" />
              </UFormField>
              <UFormField label="Act Date" hint="When this act is submitted.">
                <UInput v-model="data.actDate" type="date" icon="i-lucide-calendar" class="w-full" />
              </UFormField>
              <UFormField label="Agreement Date" hint="When the agreement begins.">
                <UInput v-model="data.agreementDate" type="date" icon="i-lucide-calendar" class="w-full" />
              </UFormField>
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 3" title="Tasks">
                <template #action>
                  <UButton
                    icon="i-lucide-plus"
                    label="Add Task"
                    color="primary"
                    variant="soft"
                    @click="addTask"
                  />
                </template>
              </CardHeader>
            </template>

            <div v-if="data.tasks.length === 0" class="text-center py-10">
              <div class="size-10 rounded-full bg-primary-50 text-primary-700 grid place-items-center mx-auto">
                <UIcon name="i-lucide-briefcase" class="size-[18px]" />
              </div>
              <p class="text-[13px] text-neutral-500 mt-3">
                No tasks yet. Add the work you've completed.
              </p>
              <UButton class="mt-3" icon="i-lucide-plus" label="Add first task" @click="addTask" />
            </div>
            <div v-else class="divide-y divide-neutral-200">
              <TaskRow
                v-for="(t, i) in data.tasks"
                :key="i"
                :index="i"
                :task="t"
                :can-remove="data.tasks.length > 1"
                :dense="dense"
                @update="(nt) => updateTask(i, nt)"
                @remove="removeTask(i)"
              />
            </div>

            <div class="mt-4 flex items-center justify-between text-xs text-neutral-500">
              <span>
                {{ data.tasks.length }} task{{ data.tasks.length === 1 ? '' : 's' }} ·
                {{ fmtHours(summary.hours) }} h total
              </span>
              <UButton
                icon="i-lucide-plus"
                label="Add another"
                color="primary"
                variant="link"
                size="xs"
                @click="addTask"
              />
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 4" title="Summary" />
            </template>

            <dl class="divide-y divide-neutral-200">
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-[13px] text-neutral-500">Total hours</dt>
                <dd class="text-[13.5px] tabular-nums">{{ fmtHours(summary.hours) }}</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-[13px] text-neutral-500">Rate</dt>
                <dd class="text-[13.5px] tabular-nums">
                  {{ fmtMoney(summary.rate) }} {{ settings.currency }} / h
                </dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-[13px] text-neutral-500">Net amount</dt>
                <dd class="text-[13.5px] tabular-nums">
                  {{ fmtMoney(summary.net) }} {{ settings.currency }}
                </dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-[13px] text-neutral-500">VAT ({{ summary.vatRate }}%)</dt>
                <dd class="text-[13.5px] tabular-nums">
                  {{ fmtMoney(summary.vat) }} {{ settings.currency }}
                </dd>
              </div>
              <div class="flex items-center justify-between pt-3.5 mt-1">
                <dt class="text-[13px] font-bold uppercase tracking-wider">Total Due</dt>
                <dd class="text-xl font-bold tabular-nums text-primary-600">
                  {{ fmtMoney(summary.total) }} {{ settings.currency }}
                </dd>
              </div>
            </dl>
          </UCard>

          <div class="sticky bottom-4 z-20">
            <div class="flex items-center gap-2 rounded-xl bg-white ring-1 ring-neutral-200 shadow-xl p-2">
              <div class="px-3 hidden sm:flex flex-col">
                <span class="text-[11px] text-neutral-500 uppercase tracking-wider">Total Due</span>
                <span class="text-[15px] font-semibold tabular-nums text-primary-600">
                  {{ fmtMoney(summary.total) }} {{ settings.currency }}
                </span>
              </div>
              <div class="grow" />
              <UButton
                :icon="settings.showPreview ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :label="settings.showPreview ? 'Hide preview' : 'Show preview'"
                color="neutral"
                variant="ghost"
                @click="settings.showPreview = !settings.showPreview"
              />
              <UButton icon="i-lucide-file-text" label="Save draft" color="neutral" variant="outline" />
              <UButton
                icon="i-lucide-download"
                label="Create Act"
                color="primary"
                size="lg"
                @click="handleCreate"
              />
            </div>
          </div>
        </div>

        <aside v-if="settings.showPreview" class="hidden xl:block">
          <div class="sticky top-[78px]">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-neutral-500">
                <UIcon name="i-lucide-eye" class="size-3" /> Live preview
              </div>
              <span class="text-[11px] text-neutral-500">A4 · 1 page</span>
            </div>
            <div class="rounded-xl bg-neutral-100 ring-1 ring-neutral-200 p-6 overflow-hidden">
              <PdfPreview :data="data" :summary="summary" :currency="settings.currency" />
            </div>
            <div class="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <UIcon name="i-lucide-sparkles" class="size-3" /> Preview updates as you type
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppHeader from './AppHeader.vue'
import CardHeader from './CardHeader.vue'
import TaskRow from './TaskRow.vue'
import PdfPreview from './PdfPreview.vue'
import { useActForm } from '../composables/useActForm.js'
import { fmtMoney, fmtHours, parseNum } from '../utils/formatters.js'
import { generatePdf } from '../utils/generatePdf.js'

const { data, settings, summary, completion, updateTask, removeTask, addTask } = useActForm()

const dense = computed(() => settings.density === 'compact')

const cardUi = computed(() => ({
  root: 'rounded-xl shadow-sm',
  header: dense.value ? 'px-4 py-3' : 'px-5 py-4',
  body: dense.value ? 'p-4 sm:p-4' : 'p-5 sm:p-5'
}))

const toast = useToast()

function handleCreate() {
  generatePdf({
    email: data.email,
    fullName: data.fullName,
    pricePerHour: parseNum(data.pricePerHour),
    actNumber: data.actNumber,
    actDate: data.actDate,
    agreementDate: data.agreementDate,
    tasks: data.tasks,
    totalHours: summary.value.hours,
    netAmount: summary.value.net,
    vatAmount: summary.value.vat,
    totalDue: summary.value.total,
    currency: settings.currency
  })
  toast.add({
    title: 'Act generated',
    description: `Acceptance Act #${data.actNumber} · ${fmtMoney(summary.value.total)} ${settings.currency} ready to download.`,
    icon: 'i-lucide-check',
    color: 'primary'
  })
}
</script>
