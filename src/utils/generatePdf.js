import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const UNSUPPORTED_FN = /oklch\([^()]*\)|oklab\([^()]*\)|color\([^()]*\)/gi
const colorCache = new Map()

function parsePercent(token, max = 1) {
  if (!token) return null
  const trimmed = token.trim()
  if (trimmed === 'none') return 0
  if (trimmed.endsWith('%')) return (parseFloat(trimmed) / 100) * max
  return parseFloat(trimmed)
}

function parseOklch(value) {
  const m = value.match(/oklch\(\s*([^/\s]+)\s+([^/\s]+)\s+([^/\s)]+)(?:\s*\/\s*([^)\s]+))?\s*\)/i)
  if (!m) return null
  const L = parsePercent(m[1])
  const C = parsePercent(m[2], 0.4)
  const H = parseFloat(m[3])
  const A = m[4] ? parsePercent(m[4]) : 1
  if (![L, C, H].every(Number.isFinite)) return null
  return { L, C, H, A }
}

function oklabToLinearSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ]
}

function linearToSrgb(x) {
  const sign = x < 0 ? -1 : 1
  const abs = Math.abs(x)
  return abs <= 0.0031308 ? 12.92 * x : sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055)
}

function oklchToRgbString(L, C, H, A) {
  const aLab = C * Math.cos((H * Math.PI) / 180)
  const bLab = C * Math.sin((H * Math.PI) / 180)
  const [lr, lg, lb] = oklabToLinearSrgb(L, aLab, bLab)
  const r = Math.max(0, Math.min(1, linearToSrgb(lr)))
  const g = Math.max(0, Math.min(1, linearToSrgb(lg)))
  const b = Math.max(0, Math.min(1, linearToSrgb(lb)))
  const R = Math.round(r * 255)
  const G = Math.round(g * 255)
  const B = Math.round(b * 255)
  return A < 1 ? `rgba(${R}, ${G}, ${B}, ${A})` : `rgb(${R}, ${G}, ${B})`
}

function resolveColor(value) {
  if (!value) return value
  if (colorCache.has(value)) return colorCache.get(value)
  let resolved = value
  if (/^oklch\(/i.test(value)) {
    const parsed = parseOklch(value)
    if (parsed) resolved = oklchToRgbString(parsed.L, parsed.C, parsed.H, parsed.A)
  }
  colorCache.set(value, resolved)
  return resolved
}

function rewriteUnsupportedFunctions(value) {
  if (!value || !UNSUPPORTED_FN.test(value)) return value
  UNSUPPORTED_FN.lastIndex = 0
  return value.replace(UNSUPPORTED_FN, (match) => resolveColor(match))
}

function inlineUnsupportedColors(root) {
  const all = [root, ...root.querySelectorAll('*')]
  for (const el of all) {
    const cs = getComputedStyle(el)
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i]
      const raw = cs.getPropertyValue(prop)
      if (!raw) continue
      if (!/oklch|oklab|color\(/i.test(raw)) continue
      const rewritten = rewriteUnsupportedFunctions(raw)
      if (rewritten !== raw) {
        el.style.setProperty(prop, rewritten, 'important')
      }
    }
  }
}

export async function generatePdf({ element, fileName }) {
  if (!element) return

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;background:#ffffff;'
  const clone = element.cloneNode(true)
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    inlineUnsupportedColors(clone)

    const canvas = await html2canvas(clone, {
      scale: Math.max(window.devicePixelRatio || 1, 4),
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      imageTimeout: 0
    })

    const pageWidth = 210
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    const doc = new jsPDF({
      orientation: imgHeight > pageWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pageWidth, imgHeight]
    })

    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, imgHeight)
    doc.save(fileName || 'acceptance-act.pdf')
  } finally {
    document.body.removeChild(wrapper)
  }
}
