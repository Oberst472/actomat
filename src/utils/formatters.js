export function allowOnlyNumeric(event) {
  if (event.data && !/^[0-9.,]+$/.test(event.data)) {
    event.preventDefault()
  }
}

export function parseNum(s) {
  if (typeof s !== 'string') return Number(s) || 0
  const cleaned = s.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function fmtMoney(n) {
  return (Number.isFinite(n) ? n : 0)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function fmtHours(n) {
  return (Number.isFinite(n) ? n : 0).toFixed(1).replace('.', ',')
}

export function formatDateToDDMMYYYY(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function formatAgreementDate(iso) {
  if (!iso) return '—'
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const [y, m, d] = iso.split('-')
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`
}
