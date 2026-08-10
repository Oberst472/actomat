<template>
  <article class="preview-page paper rounded-2xl border border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_64px_-32px_rgba(15,23,42,0.18)] overflow-hidden bg-white text-slate-900 mx-auto" style="font-family: Helvetica, Arial, sans-serif;">

    <header class="px-10 pt-10 pb-8 border-b border-slate-200">
      <div class="flex items-start justify-between gap-6">
        <div>
          <div class="label-kicker">Executor</div>
          <div :class="['mt-1 text-lg font-semibold tracking-tight', hl('fullName')]">{{ data.fullName || '—' }}</div>
          <a :class="['text-sm text-slate-500 hover:text-slate-800 transition', hl('email')]">{{ data.email || '—' }}</a>
        </div>
        <div class="text-right">
          <div class="label-kicker">Document</div>
          <div :class="['mt-1 text-lg font-semibold tracking-tight num', hl('actNumber')]">Act&nbsp;#{{ data.actNumber || '—' }}</div>
          <div class="text-sm text-slate-500 num">
            Submitted <span :class="hl('actDate')">{{ formatDateToDDMMYYYY(data.actDate) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-9">
        <h1 class="text-[44px] leading-[1.15] text-slate-900 tracking-tight" style="font-family: sans-serif;">Acceptance Act</h1>
        <p class="mt-6 text-[15px] text-slate-600 max-w-prose">
          For services rendered under the B2B service agreement
          dated <span :class="['text-slate-900 font-medium', hl('agreementDate')]">{{ formatAgreementDate(data.agreementDate) }}</span>,
          covering the period through <span :class="['text-slate-900 font-medium num', hl('actDate')]">{{ formatDateToDDMMYYYY(data.actDate) }}</span>.
        </p>
      </div>
    </header>

    <section class="px-10 py-8 border-b border-slate-200 grid grid-cols-12 gap-8">
      <div class="col-span-12 md:col-span-3">
        <div class="label-kicker">Statement</div>
      </div>
      <div class="col-span-12 md:col-span-9 space-y-4 text-[15px] leading-relaxed text-slate-700">
        <p>
          We, the undersigned — the Representative of the <span class="text-slate-900 font-medium">Client</span> and
          the Representative of the <span class="text-slate-900 font-medium">Executor</span> — hereby execute this
          Acceptance Act confirming that the Executor rendered the following services, calculated on an hourly basis
          in accordance with the B2B service agreement.
        </p>
        <p>
          The services were rendered on a due and timely basis. The Parties have no further claims against each other.
        </p>
        <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm table w-full" style="height: 48px;">
          <div class="table-cell align-middle">
            <span class="text-slate-500">Executor's hourly rate</span>
            <span :class="['mx-2 text-slate-900 font-semibold num whitespace-nowrap', hl('pricePerHour'), hl('currency')]">{{ fmtMoney(parseNum(data.pricePerHour)) }} {{ currency }}</span>
            <span class="text-slate-500">net / hour&nbsp;+&nbsp;VAT</span>
          </div>
        </div>
      </div>
    </section>

    <section class="px-10 py-8 border-b border-slate-200">
      <div class="flex items-end justify-between mb-5">
        <div>
          <div class="label-kicker">Services rendered</div>
          <h2 class="mt-1 text-2xl text-slate-900" style="font-family: sans-serif;">Description &amp; hours</h2>
        </div>
        <div class="text-right text-sm text-slate-500">
          <span class="num">{{ visibleTasks.length }} task{{ visibleTasks.length === 1 ? '' : 's' }}</span>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4 px-4 pb-3 border-b border-slate-200 label-kicker">
        <div class="col-span-1">#</div>
        <div class="col-span-2">Task ID</div>
        <div class="col-span-7">Description</div>
        <div class="col-span-2 text-right">Hours</div>
      </div>

      <ol class="row-sep text-[14.5px]">
        <li v-if="visibleTasks.length === 0" class="px-4 py-6 text-center text-slate-400 italic">
          No tasks added yet
        </li>
        <li
          v-for="(t, i) in visibleTasks"
          :key="i"
          class="grid grid-cols-12 gap-4 px-4 py-4"
        >
          <div class="col-span-1 num text-slate-400">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="col-span-2 num font-semibold text-slate-900">{{ formatTaskId(t.id) }}</div>
          <div class="col-span-7 text-slate-700 leading-relaxed">
            <template v-if="t.description">{{ t.description }}</template>
            <span v-else class="italic text-slate-400">—</span>
          </div>
          <div class="col-span-2 text-right num font-medium text-slate-900">
            {{ fmtHours(parseNum(t.hours)) }}<span class="text-slate-400 text-xs ml-1">h</span>
          </div>
        </li>
      </ol>

      <div :class="['mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 table w-full', hl('hours')]" style="height: 64px;">
        <span class="table-cell align-middle text-sm tracking-wide uppercase text-slate-500">Total hours</span>
        <span class="table-cell align-middle text-right text-2xl font-semibold num text-slate-900">{{ fmtHours(summary.hours) }}</span>
      </div>
    </section>

    <section class="px-10 py-8 border-b border-slate-200 grid grid-cols-12 gap-8">
      <div class="col-span-12 md:col-span-5">
        <div class="label-kicker">Settlement</div>
        <h2 class="mt-1 text-2xl text-slate-900" style="font-family: sans-serif;">Amount due</h2>
        <p class="mt-2 text-sm text-slate-500 max-w-xs">
          Calculated as {{ fmtHours(summary.hours) }}&nbsp;hours × {{ fmtMoney(summary.rate) }}&nbsp;{{ currency }}, with VAT applied per the agreement.
        </p>
      </div>
      <div class="col-span-12 md:col-span-7">
        <dl class="rounded-xl border border-slate-200 overflow-hidden">
          <div :class="['px-5 bg-white table w-full', hl('netAmount')]" style="height: 52px;">
            <dt class="table-cell align-middle text-slate-600 text-sm">Net amount</dt>
            <dd :class="['table-cell align-middle text-right num text-slate-900 font-medium whitespace-nowrap', hl('currency')]">{{ fmtMoney(summary.net) }}&nbsp;{{ currency }}</dd>
          </div>
          <div :class="['px-5 bg-white border-t border-slate-200 table w-full', hl('vatRate')]" style="height: 52px;">
            <dt class="table-cell align-middle text-slate-600 text-sm">VAT</dt>
            <dd :class="['table-cell align-middle text-right num text-slate-900 font-medium whitespace-nowrap', hl('currency')]">{{ fmtMoney(summary.vat) }}&nbsp;{{ currency }}</dd>
          </div>
          <div class="px-5 border-t border-slate-200 bg-indigo-50/60 table w-full" style="height: 64px;">
            <dt class="table-cell align-middle text-[13px] uppercase tracking-[0.14em] text-indigo-700 font-medium whitespace-nowrap">Total due</dt>
            <dd :class="['table-cell align-middle text-right num text-2xl font-semibold whitespace-nowrap', hl('currency')]" style="color: #4338ca;">{{ fmtMoney(summary.total) }}&nbsp;{{ currency }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="px-10 pt-8 pb-10">
      <div class="grid grid-cols-2 gap-10">
        <div>
          <div class="label-kicker">Client</div>
          <div class="mt-3 h-[88px] rounded-lg border border-slate-200 bg-white relative overflow-hidden"></div>
        </div>

        <div class="relative">
          <div class="label-kicker">Executor</div>
          <div class="mt-3 h-[88px] rounded-lg border border-slate-200 bg-white relative overflow-hidden"></div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
            <span :class="['text-slate-700 font-medium whitespace-nowrap', hl('fullName')]">{{ data.fullName || '—' }}</span>
            <span :class="['text-slate-500 num whitespace-nowrap', hl('actDate')]">{{ formatDateToDDMMYYYY(data.actDate) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-5 border-t border-slate-200 text-[12px] text-slate-500">
        <div class="whitespace-nowrap">
          Acceptance Act <span :class="hl('actNumber')">#{{ data.actNumber || '—' }}</span> · B2B service agreement of <span :class="['num', hl('agreementDate')]">{{ formatDateToDDMMYYYY(data.agreementDate) }}</span>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { fmtMoney, fmtHours, parseNum, formatDateToDDMMYYYY, formatAgreementDate } from '../utils/formatters.js'

const props = defineProps({
  data: { type: Object, required: true },
  summary: { type: Object, required: true },
  currency: { type: String, default: 'PLN' },
  focusedField: { type: String, default: null }
})

const visibleTasks = computed(() =>
  props.data.tasks.filter((t) => t.id || t.description || t.hours)
)

function formatTaskId(id) {
  const trimmed = String(id || '').trim()
  if (!trimmed) return '—'
  const prefix = String(props.data.taskIdPrefix || '')
  return prefix && !trimmed.startsWith(prefix) ? `${prefix}${trimmed}` : trimmed
}

const HIGHLIGHT_CLASS = 'bg-amber-200 ring-2 ring-amber-500 rounded-sm transition-colors duration-150'
const hl = (key) => (props.focusedField === key ? HIGHLIGHT_CLASS : '')
</script>

<style scoped>
.preview-page {
  width: 860px;
  max-width: 100%;
}

.label-kicker {
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.row-sep > * + * {
  border-top: 1px solid #e2e8f0;
}
</style>
