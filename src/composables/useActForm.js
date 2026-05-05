import { reactive, computed } from 'vue'
import { parseNum } from '../utils/formatters.js'

export function useActForm() {
  const data = reactive({
    email: 'anna.kowalska@example.com',
    fullName: 'Anna Kowalska',
    pricePerHour: '92,46',
    actNumber: '3',
    actDate: '2026-04-30',
    agreementDate: '2025-09-01',
    tasks: [
      { id: 'CORE-152', description: 'Designed onboarding flow for new B2B customer segment.', hours: '8' },
      { id: 'CORE-184', description: 'Refined dashboard navigation and added breadcrumbs.', hours: '5,5' },
      { id: 'PLAT-21',  description: 'Spec review with platform team; updated component tokens.', hours: '2' }
    ]
  })

  const settings = reactive({
    density: 'comfortable',
    showPreview: true,
    vatRate: 23,
    currency: 'zł'
  })

  const summary = computed(() => {
    const rate = parseNum(data.pricePerHour)
    const hours = data.tasks.reduce((s, t) => s + parseNum(t.hours), 0)
    const net = hours * rate
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
  }
  const addTask = () => {
    data.tasks.push({ id: '', description: '', hours: '' })
  }

  return { data, settings, summary, completion, updateTask, removeTask, addTask }
}
