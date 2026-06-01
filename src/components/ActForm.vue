<template>
  <div class="min-h-screen bg-neutral-100 text-neutral-900">
    <AppHeader :user-name="data.fullName || 'User'" />

    <main class="max-w-[1280px] mx-auto px-6 py-8">
      <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
<!--            <span>Documents</span>-->
<!--            <UIcon name="i-lucide-chevron-right" class="size-3" />-->
<!--            <span>Acts</span>-->
<!--            <UIcon name="i-lucide-chevron-right" class="size-3" />-->
<!--            <span class="text-neutral-900">New</span>-->
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
                  <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1.5 text-[11.5px] text-neutral-500">
                      <UIcon name="i-lucide-info" class="size-3" /> Used as contractor on the act
                    </span>
                      <UButton icon="i-lucide-save" label="Save data" color="warning" size="sm" @click="handleSave" />                  </div>
                </template>
              </CardHeader>
            </template>

            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Email" v-bind="focusBindings('email')">
                <UInput
                  v-model="data.email"
                  size="xl"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full"
                  :ui="{ base: 'font-light' }"
                />
              </UFormField>
              <UFormField label="Full Name" v-bind="focusBindings('fullName')">
                <UInput
                  v-model="data.fullName"
                  size="xl"
                  placeholder="Anna Kowalska"
                  class="w-full"
                  :ui="{ base: 'font-light' }"
                />
              </UFormField>
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 2" title="Act Info">
                <template #action>
                    <UButton icon="i-lucide-save" label="Save data" color="warning" size="sm" @click="handleSave" />                </template>
              </CardHeader>
            </template>

            <div class="grid sm:grid-cols-3 gap-x-5 gap-y-4">
              <UFormField label="Act Number" v-bind="focusBindings('actNumber')">
                <UInput v-model="data.actNumber" size="xl" placeholder="3" class="w-full" :ui="{ base: 'font-light' }" />
              </UFormField>
              <UFormField label="Act Date" :error="actDateError" v-bind="focusBindings('actDate')">
                <UInputDate v-model="actDateModel" size="xl" class="w-full" :ui="dateInputUi">
                  <template #trailing>
                    <UPopover :content="{ align: 'end' }">
                      <UButton icon="i-lucide-calendar" color="neutral" variant="ghost" size="xs" tabindex="-1" />
                      <template #content>
                        <UCalendar v-model="actDateModel" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
              <UFormField label="Agreement Date" :error="agreementDateError" v-bind="focusBindings('agreementDate')">
                <UInputDate v-model="agreementDateModel" size="xl" class="w-full" :ui="dateInputUi">
                  <template #trailing>
                    <UPopover :content="{ align: 'end' }">
                      <UButton icon="i-lucide-calendar" color="neutral" variant="ghost" size="xs" tabindex="-1" />
                      <template #content>
                        <UCalendar v-model="agreementDateModel" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 3" title="Pricing">
                <template #action>
                  <UButton icon="i-lucide-save" label="Save data" color="warning" size="sm" @click="handleSave" />
                </template>
              </CardHeader>
            </template>

            <div class="flex flex-col gap-4">
              <UFormField label="Currency" v-bind="focusBindings('currency')">
                <URadioGroup
                  v-model="settings.currency"
                  variant="card"
                  size="sm"
                  orientation="horizontal"
                  :items="currencyOptions"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="VAT %" v-bind="focusBindings('vatRate')">
                <URadioGroup
                  v-model="settings.vatRate"
                  variant="card"
                  size="sm"
                  orientation="horizontal"
                  :items="vatOptions"
                  class="w-full"
                />
              </UFormField>

              <div class="grid sm:grid-cols-3 gap-x-5 gap-y-4">
                <UFormField label="Price per hour" :error="pricePerHourError" v-bind="focusBindings('pricePerHour')">
                  <UInput
                    v-model="data.pricePerHour"
                    size="xl"
                    placeholder="0,00"
                    class="w-full"
                    :ui="{ base: 'text-right tabular-nums font-light' }"
                    @beforeinput="allowOnlyNumeric"
                  >
                    <template #trailing>
                      <span class="text-xs text-neutral-500 font-medium">{{ settings.currency }}</span>
                    </template>
                  </UInput>
                </UFormField>
                <UFormField label="Net amount" :error="netAmountError" v-bind="focusBindings('netAmount')">
                  <UInput
                    v-model="data.netAmount"
                    size="xl"
                    placeholder="0,00"
                    class="w-full"
                    :ui="{ base: 'text-right tabular-nums font-light' }"
                    @beforeinput="allowOnlyNumeric"
                  >
                    <template #trailing>
                      <span class="text-xs text-neutral-500 font-medium">{{ settings.currency }}</span>
                    </template>
                  </UInput>
                </UFormField>
                <UFormField label="Hours per month" v-bind="focusBindings('hoursPerMonth')">
                  <UInputNumber
                    v-model="data.hoursPerMonth"
                    size="xl"
                    :min="0"
                    :step="1"
                    class="w-full"
                    :ui="{ base: 'text-right tabular-nums font-light' }"
                  />
                </UFormField>
              </div>
            </div>
          </UCard>

          <UCard :ui="cardUi">
            <template #header>
              <CardHeader eyebrow="Step 4" title="Tasks">
                <template #action>
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-lucide-shuffle"
                      label="Reroll hours"
                      color="neutral"
                      variant="ghost"
                      @click="redistributeHours"
                    />
                    <UButton
                      icon="i-lucide-plus"
                      label="Add Task"
                      color="primary"
                      variant="soft"
                      @click="addTask"
                    />
                  </div>
                </template>
              </CardHeader>
            </template>

            <div class="relative overflow-hidden rounded-xl from-primary-50 via-white to-amber-50 ring-1 ring-primary-100 p-4 mb-5">

              <div class="relative flex items-center gap-4 flex-wrap">
                <div class="size-11 rounded-xl bg-white ring-1 ring-primary-200 shadow-sm grid place-items-center shrink-0">
                  <UIcon name="i-lucide-tag" class="size-5 text-primary-600" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[11px] uppercase tracking-[0.08em] font-semibold text-neutral-600">Task ID prefix</span>
                    <span class="text-[11px] text-neutral-400">·</span>
                    <span class="text-[11px] text-neutral-500">prepended to every task</span>
                  </div>

                  <div class="flex items-center gap-2.5 flex-wrap">
                    <UInput
                      v-model="data.taskIdPrefix"
                      placeholder="CORE-"
                      size="md"
                      class="w-32"
                      :ui="{ base: 'font-mono tracking-tight font-light' }"
                    />
                    <UIcon name="i-lucide-arrow-right" class="size-3.5 text-neutral-400 shrink-0" />
                    <span class="inline-flex items-center font-mono text-[13px] tracking-tight bg-white/90 ring-1 ring-neutral-200 rounded-md px-2.5 py-1 shadow-sm">
                      <span class="font-semibold text-primary-600">{{ data.taskIdPrefix || 'CORE-' }}</span>
                      <span class="text-neutral-900">1234</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="data.tasks.length === 0" class="text-center py-10">
              <div class="size-10 rounded-full bg-primary-50 text-primary-700 grid place-items-center mx-auto">
                <UIcon name="i-lucide-briefcase" class="size-[18px]" />
              </div>
              <p class="text-[13px] text-neutral-500 mt-3">
                No tasks yet. Add the work you've completed.
              </p>
              <UButton class="mt-3" :ui="{ label: 'text-white', leadingIcon: 'text-white' }" icon="i-lucide-plus" label="Add first task" @click="addTask" />
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
              <CardHeader eyebrow="Step 5" title="Summary" />
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
<!--              <UButton-->
<!--                :icon="settings.showPreview ? 'i-lucide-eye-off' : 'i-lucide-eye'"-->
<!--                :label="settings.showPreview ? 'Hide preview' : 'Show preview'"-->
<!--                color="neutral"-->
<!--                variant="ghost"-->
<!--                @click="settings.showPreview = !settings.showPreview"-->
<!--              />-->
              <UButton icon="i-lucide-file-text" label="Save draft" color="neutral" variant="outline" size="lg"/>
              <UButton
                icon="i-lucide-download"
                label="Create Act"
                color="primary"
                size="lg"
                :ui="{ label: 'text-white', leadingIcon: 'text-white' }"
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
            <div class="rounded-xl bg-neutral-100 ring-1 ring-neutral-200 p-3 overflow-hidden" style="zoom: 0.5;">
              <PdfPreview :data="data" :summary="summary" :currency="settings.currency" :focused-field="focusedField" />
            </div>
            <div class="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <UIcon name="i-lucide-sparkles" class="size-3" /> Preview updates as you type
            </div>
          </div>
        </aside>
      </div>
    </main>

    <div ref="exportRef" aria-hidden="true" class="fixed -left-[10000px] top-0 pointer-events-none">
      <PdfPreview :data="data" :summary="summary" :currency="settings.currency" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { parseDate } from '@internationalized/date'
import AppHeader from './AppHeader.vue'
import CardHeader from './CardHeader.vue'
import TaskRow from './TaskRow.vue'
import PdfPreview from './PdfPreview.vue'
import { useActForm } from '../composables/useActForm.js'
import { fmtMoney, fmtHours, allowOnlyNumeric } from '../utils/formatters.js'
import { generatePdf } from '../utils/generatePdf.js'

const { data, settings, currencyOptions, vatOptions, summary, completion, updateTask, removeTask, addTask, redistributeHours, saveToStorage } = useActForm()

const dateModel = (key) =>
  computed({
    get: () => (data[key] ? parseDate(data[key]) : undefined),
    set: (v) => { data[key] = v ? v.toString() : '' }
  })

const actDateModel = dateModel('actDate')
const agreementDateModel = dateModel('agreementDate')

const dateInputUi = {
  base: 'font-light !gap-0',
  segment: 'tabular-nums data-[segment=day]:!w-auto data-[segment=month]:!w-auto data-[segment=year]:!w-auto'
}

const numericPattern = /^[0-9.,]*$/
const numericError = (v) => (numericPattern.test(String(v ?? '')) ? undefined : 'Allow only numbers, dot and coma')

const focusedField = ref(null)
const exportRef = ref(null)
const focusBindings = (key) => ({
  onFocusin: () => { focusedField.value = key },
  onFocusout: () => { focusedField.value = null }
})
const pricePerHourError = computed(() => numericError(data.pricePerHour))
const netAmountError = computed(() => numericError(data.netAmount))

const requiredDateError = (v) => (v ? undefined : 'Date is required')
const actDateError = computed(() => requiredDateError(data.actDate))
const agreementDateError = computed(() => requiredDateError(data.agreementDate))

const dense = computed(() => settings.density === 'compact')

const cardUi = computed(() => ({
  root: 'rounded-xl shadow-sm',
  header: dense.value ? 'px-4 py-3' : 'px-5 py-4',
  body: dense.value ? 'p-4 sm:p-4' : 'p-5 sm:p-5'
}))

const toast = useToast()

function handleSave() {
  const ok = saveToStorage()
  toast.add(ok
    ? { title: 'Saved', description: 'Your act data has been stored locally.', icon: 'i-lucide-check', color: 'primary' }
    : { title: 'Save failed', description: 'Could not write to localStorage.', icon: 'i-lucide-triangle-alert', color: 'error' })
}

async function handleCreate() {
  const root = exportRef.value
  const page = root?.querySelector('.preview-page') || root
  if (!page) return
  await generatePdf({
    element: page,
    fileName: `acceptance-act-${data.actNumber || 'draft'}.pdf`
  })
  toast.add({
    title: 'Act generated',
    description: `Acceptance Act #${data.actNumber} · ${fmtMoney(summary.value.total)} ${settings.currency} ready to download.`,
    icon: 'i-lucide-check',
    color: 'primary'
  })
}
</script>
