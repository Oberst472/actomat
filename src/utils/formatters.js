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

// Cuts the extra decimals off instead of rounding them up (10,8155 h → 10,81 h).
// The toFixed(6) pass absorbs binary float noise so 8,31 never truncates to 8,30.
export function truncateDecimals(n, decimals) {
  if (!Number.isFinite(n)) return 0
  const unit = 10 ** decimals
  return Math.trunc(Number((n * unit).toFixed(6))) / unit
}

export function fmtHours(n) {
  return truncateDecimals(Number.isFinite(n) ? n : 0, 2).toFixed(2).replace('.', ',')
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
