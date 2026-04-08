import { ref, computed } from 'vue'

const VAT_RATE = 0.23

export function useActForm() {
  const email = ref('')
  const fullName = ref('')
  const pricePerHour = ref(92.46)
  const actNumber = ref('')
  const actDate = ref('')
  const agreementDate = ref('')
  const tasks = ref([{ id: '', description: '', hours: null }])

  const totalHours = computed(() =>
    tasks.value.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0)
  )

  const netAmount = computed(() => totalHours.value * pricePerHour.value)
  const vatAmount = computed(() => netAmount.value * VAT_RATE)
  const totalDue = computed(() => netAmount.value + vatAmount.value)

  function addTask() {
    tasks.value.push({ id: '', description: '', hours: null })
  }

  function removeTask(index) {
    tasks.value.splice(index, 1)
  }

  return {
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
  }
}
