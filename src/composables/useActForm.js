import { reactive, computed, watch, ref } from 'vue'
import { parseNum } from '../utils/formatters.js'

export function useActForm() {
  const data = reactive({
    email: 'anna.kowalska@example.com',
    fullName: 'Anna Kowalska',
    pricePerHour: '92,46',
    netAmount: '0',
    hoursPerMonth: 100,
    taskIdPrefix: '',
    actNumber: '3',
    actDate: '2026-04-30',
    agreementDate: '2025-09-01',
    tasks: [
      // { id: 'CORE-152', description: 'Designed onboarding flow for new B2B customer segment.', hours: '0' },
      // { id: 'CORE-184', description: 'Refined dashboard navigation and added breadcrumbs.', hours: '0' },
      // { id: 'PLAT-21',  description: 'Spec review with platform team; updated component tokens.', hours: '0' }
    ]
  })

  const settings = reactive({
    density: 'comfortable',
    showPreview: true,
    vatRate: 23,
    currency: 'PLN'
  })

  const STORAGE_KEY = 'aktomat:actForm'

  // Which fields belong to each form section (i.e. each "Save data" button).
  // Lets us flag dirtiness per section so only the edited block lights up.
  const SECTIONS = {
    personal: { data: ['email', 'fullName'] },
    act: { data: ['actNumber', 'actDate', 'agreementDate'] },
    pricing: { data: ['pricePerHour', 'netAmount', 'hoursPerMonth'], settings: ['currency', 'vatRate'] },
    tasks: { data: ['taskIdPrefix', 'tasks'] }
  }

  // Parsed snapshot of the data+settings currently persisted in localStorage.
  // Per-section dirtiness compares the live form against this.
  const savedState = ref(null)
  // Whether the form was ever persisted (storage existed on load, or a save
  // succeeded). Lets us distinguish "Saved" from "Nothing to save".
  const hasSaved = ref(false)

  function snapshot() {
    return {
      data: { ...data, tasks: data.tasks.map((t) => ({ ...t })) },
      settings: { ...settings }
    }
  }

  function loadFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        if (parsed.data) Object.assign(data, parsed.data)
        if (parsed.settings) Object.assign(settings, parsed.settings)
        hasSaved.value = true
      }
    } catch {}
  }

  function saveToStorage() {
    if (typeof window === 'undefined') return false
    try {
      const snap = snapshot()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap))
      savedState.value = snap
      hasSaved.value = true
      return true
    } catch {
      return false
    }
  }

  loadFromStorage()
  // Baseline: whatever is in the form right after load is considered "saved",
  // so a section only becomes dirty once the user changes one of its fields.
  savedState.value = snapshot()

  const eq = (a, b) => JSON.stringify(a) !== JSON.stringify(b)

  function sectionDirty(name) {
    const saved = savedState.value
    if (!saved) return false
    const def = SECTIONS[name]
    if ((def.data || []).some((k) => eq(data[k], saved.data[k]))) return true
    if ((def.settings || []).some((k) => eq(settings[k], saved.settings[k]))) return true
    return false
  }

  // Per-section dirty flags, e.g. dirty.value.personal — drives each button.
  const dirty = computed(() => ({
    personal: sectionDirty('personal'),
    act: sectionDirty('act'),
    pricing: sectionDirty('pricing'),
    tasks: sectionDirty('tasks')
  }))

  const currencyOptions = [
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'PLN (zł)', value: 'PLN' },
    { label: 'USD ($)', value: 'USD' }
  ]

  const vatOptions = [0, 5, 8, 12, 23, 32].map((v) => ({ label: `${v}%`, value: v }))

  const summary = computed(() => {
    const rate = parseNum(data.pricePerHour)
    const taskHours = data.tasks.reduce((s, t) => s + parseNum(t.hours), 0)
    const hours = taskHours > 0 ? taskHours : parseNum(data.hoursPerMonth)
    const enteredNet = parseNum(data.netAmount)
    const net = enteredNet > 0 ? enteredNet : hours * rate
    const vat = net * (settings.vatRate / 100)
    return { hours, rate, net, vat, total: net + vat, vatRate: settings.vatRate }
  })

  const completion = computed(() => {
    const total = 5
    let filled = 0
    if (data.email) filled++
    if (data.fullName) filled++
    if (data.pricePerHour) filled++
    if (data.actNumber) filled++
    if (data.tasks.some((t) => t.id && t.description && parseNum(t.hours) > 0)) filled++
    return Math.round((filled / total) * 100)
  })

  const updateTask = (i, t) => {
    data.tasks[i] = t
  }
  const removeTask = (i) => {
    data.tasks.splice(i, 1)
    redistributeHours()
  }
  const addTask = () => {
    data.tasks.push({ id: '', description: '', hours: '0' })
    redistributeHours()
  }

  function distributeHours(total, n) {
    if (n <= 0) return []
    const whole = Math.round(total)
    if (n === 1) return [whole]
    const weights = Array.from({ length: n }, () => 0.5 + Math.random())
    const sum = weights.reduce((a, b) => a + b, 0)
    const hours = weights.map((w) => Math.max(1, Math.round((whole * w) / sum)))
    const summed = hours.reduce((a, b) => a + b, 0)
    hours[hours.length - 1] = Math.max(1, hours[hours.length - 1] + (whole - summed))
    return hours
  }

  function redistributeHours() {
    const total = parseNum(data.hoursPerMonth)
    if (!Number.isFinite(total) || total <= 0 || data.tasks.length === 0) return
    const distributed = distributeHours(total, data.tasks.length)
    distributed.forEach((h, i) => {
      data.tasks[i].hours = String(h)
    })
  }

  watch(() => data.hoursPerMonth, redistributeHours)

  return { data, settings, currencyOptions, vatOptions, summary, completion, updateTask, removeTask, addTask, redistributeHours, saveToStorage, dirty, hasSaved }
}
