import { reactive, computed, watch, ref } from 'vue'
import { parseNum, truncateDecimals } from '../utils/formatters.js'

export function useActForm() {
  const data = reactive({
    email: 'anna.kowalska@example.com',
    fullName: 'Anna Kowalska',
    pricePerHour: '92,46',
    netAmount: '9246,00',
    taskIdPrefix: '',
    actNumber: '3',
    actDate: '2026-04-30',
    agreementDate: '2025-09-01',
    tasks: []
  })

  const settings = reactive({
    density: 'comfortable',
    showPreview: true,
    vatRate: 23,
    currency: 'PLN'
  })

  const STORAGE_KEY = 'aktomat:actForm'

  const HOURS_DECIMALS = 2
  const HOURS_UNIT = 10 ** HOURS_DECIMALS

  const pick = (src, keys) =>
    keys.reduce((acc, k) => (k in src ? Object.assign(acc, { [k]: src[k] }) : acc), {})

  const SECTIONS = {
    personal: { data: ['email', 'fullName'] },
    act: { data: ['actNumber', 'actDate', 'agreementDate'] },
    pricing: { data: ['pricePerHour', 'netAmount'], settings: ['currency', 'vatRate'] },
    tasks: { data: ['taskIdPrefix', 'tasks'] }
  }

  const savedState = ref(null)
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
        if (parsed.data) Object.assign(data, pick(parsed.data, Object.keys(data)))
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

  const eq = (a, b) => JSON.stringify(a) !== JSON.stringify(b)

  function sectionDirty(name) {
    const saved = savedState.value
    if (!saved) return false
    const def = SECTIONS[name]
    if ((def.data || []).some((k) => eq(data[k], saved.data[k]))) return true
    if ((def.settings || []).some((k) => eq(settings[k], saved.settings[k]))) return true
    return false
  }

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

  const totalHours = computed(() => {
    const rate = parseNum(data.pricePerHour)
    const net = parseNum(data.netAmount)
    if (rate <= 0 || net <= 0) return 0
    return truncateDecimals(net / rate, HOURS_DECIMALS)
  })

  const summary = computed(() => {
    const rate = parseNum(data.pricePerHour)
    const net = parseNum(data.netAmount)
    const vat = net * (settings.vatRate / 100)
    return { hours: totalHours.value, rate, net, vat, total: net + vat, vatRate: settings.vatRate }
  })

  const completion = computed(() => {
    const total = 6
    let filled = 0
    if (data.email) filled++
    if (data.fullName) filled++
    if (parseNum(data.pricePerHour) > 0) filled++
    if (parseNum(data.netAmount) > 0) filled++
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

  // Splits an integer amount into n varied random shares of at least `min`,
  // adding up to exactly `amount`.
  function splitAmount(amount, n, min) {
    const floor = Math.min(min, Math.floor(amount / n))
    const weights = Array.from({ length: n }, () => 0.5 + Math.random())
    const sum = weights.reduce((a, b) => a + b, 0)
    const parts = weights.map((w) => Math.max(floor, Math.floor((amount * w) / sum)))

    let rest = amount - parts.reduce((a, b) => a + b, 0)
    for (let i = n - 1; rest > 0; i = i === 0 ? n - 1 : i - 1) {
      parts[i]++
      rest--
    }
    for (let i = n - 1; i >= 0 && rest < 0; i--) {
      const take = Math.min(-rest, parts[i] - floor)
      parts[i] -= take
      rest += take
    }
    return parts
  }

  // Splits the derived total across the tasks. Every task gets whole hours and only
  // the last one carries the leftover fraction, so a single tail row reads like 18,81 h.
  // Shares always add up to the total exactly (compared in hundredths of an hour).
  function distributeHours(total, n) {
    if (n <= 0) return []
    const units = Math.round(total * HOURS_UNIT)
    if (units <= 0) return Array.from({ length: n }, () => 0)
    if (n === 1) return [units / HOURS_UNIT]

    const wholeHours = Math.floor(units / HOURS_UNIT)

    // Fewer whole hours than tasks — one hour each is impossible, so fall back to
    // splitting the hundredths and accept fractions on every row.
    if (wholeHours < n) return splitAmount(units, n, 1).map((u) => u / HOURS_UNIT)

    const parts = splitAmount(wholeHours, n, 1).map((h) => h * HOURS_UNIT)
    parts[n - 1] += units - wholeHours * HOURS_UNIT
    return parts.map((u) => u / HOURS_UNIT)
  }

  const hoursToInput = (n) => String(n).replace('.', ',')

  function redistributeHours() {
    if (data.tasks.length === 0) return
    const distributed = distributeHours(totalHours.value, data.tasks.length)
    distributed.forEach((h, i) => {
      data.tasks[i].hours = hoursToInput(h)
    })
  }

  watch(totalHours, redistributeHours)

  // Stored drafts (or drafts saved with a different rate) can hold task hours that
  // no longer add up to net ÷ rate — realign them before the first snapshot.
  if (data.tasks.length > 0) {
    const sum = data.tasks.reduce((s, t) => s + parseNum(t.hours), 0)
    if (Math.round(sum * HOURS_UNIT) !== Math.round(totalHours.value * HOURS_UNIT)) redistributeHours()
  }

  savedState.value = snapshot()

  return { data, settings, currencyOptions, vatOptions, totalHours, summary, completion, updateTask, removeTask, addTask, redistributeHours, saveToStorage, dirty, hasSaved }
}
