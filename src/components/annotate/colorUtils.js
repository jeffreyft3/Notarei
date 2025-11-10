// Centralized color utilities for annotation categories

// Base color mapping for categories
export const categoryColors = {
  'Loaded Language': '#ffeb3b', // yellow
  'Loaded Language Text': '#111111',
  'Framing': '#1180ffff',         // blue
  'Framing Text': '#ffffff',
  'Source Imbalance': '#f44336',// red
  'Source Imbalance Text': '#111111',
  'Speculation': '#e91e63',     // pink/red
  'Speculation Text': '#111111',
  'Unverified': '#9c27b0',      // purple
  'Unverified Text': '#ffffff',
  'Omission': '#a069ffff',        // deep purple
  'Omission Text': '#ffffff',
  'Neutral': '#4ad54fff',          // green
  'Neutral Text': '#111111',
}

export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 }
  let h = hex.replace('#', '').trim()
  // Support #RGBA and #RRGGBBAA by dropping alpha; normalize to 6-digit
  if (h.length === 4) {
    // #RGBA -> expand then drop alpha
    const exp = h.split('').map((c) => c + c).join('') // RRGGBBAA
    h = exp.slice(0, 6)
  } else if (h.length === 8) {
    // #RRGGBBAA -> drop alpha
    h = h.slice(0, 6)
  }
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex({ r, g, b }) {
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function asRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Overlay secondary over primary using simple alpha compositing: result = sec*a + prim*(1-a)
export function mixHexColors(primaryHex, secondaryHex, overlayAlpha = 0.35) {
  if (!secondaryHex) return primaryHex
  const p = hexToRgb(primaryHex)
  const s = hexToRgb(secondaryHex)
  const a = Math.max(0, Math.min(1, overlayAlpha))
  const r = Math.round(s.r * a + p.r * (1 - a))
  const g = Math.round(s.g * a + p.g * (1 - a))
  const b = Math.round(s.b * a + p.b * (1 - a))
  return rgbToHex({ r, g, b })
}

export function getAnnotationHexColor(ann) {
  // Determine colors from categories with fallbacks
  const primKey = ann?.primaryCategory || ann?.category
  const secKey = ann?.secondaryCategory || ''
  const primHex = categoryColors[primKey] || '#ffeb3b'
  const secHex = categoryColors[secKey] || ''
  // Blend secondary over primary if present
  return mixHexColors(primHex, secHex, 0.35)
}

// Parse common rgb(a) string into object; returns null if not parseable
function parseRgbFunc(str) {
  const match = String(str).match(/rgba?\(([^)]+)\)/i)
  if (!match) return null
  const parts = match[1].split(',').map((p) => parseFloat(p.trim()))
  const [r, g, b] = parts
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  return { r: Math.max(0, Math.min(255, Math.round(r))), g: Math.max(0, Math.min(255, Math.round(g))), b: Math.max(0, Math.min(255, Math.round(b))) }
}

// Compute relative luminance (WCAG)
function relativeLuminance({ r, g, b }) {
  const toLinear = (c) => {
    const cs = c / 255
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

// Return a readable text color (light or dark) against a background color
export function getReadableTextColor(bgColor, light = '#ffffff', dark = '#222') {
  if (!bgColor) return dark
  let rgb = null
  const s = String(bgColor).trim().toLowerCase()
  if (s.startsWith('#')) {
    rgb = hexToRgb(s)
  } else if (s.startsWith('rgb')) {
    rgb = parseRgbFunc(s)
  } else if (categoryColors[s]) {
    // If a category key was passed, resolve its color first
    rgb = hexToRgb(categoryColors[s])
  }
  if (!rgb) return dark
  const L = relativeLuminance(rgb)
  return L < 0.5 ? light : dark
}
