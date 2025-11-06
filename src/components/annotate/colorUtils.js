// Centralized color utilities for annotation categories

// Base color mapping for categories
export const categoryColors = {
  'Loaded Language': '#ffeb3b', // yellow
  'Framing': '#0077ffff',         // blue
  'Source Imbalance': '#f44336',// red
  'Speculation': '#e91e63',     // pink/red
  'Unverified': '#9c27b0',      // purple
  'Omission': '#673ab7',        // deep purple
  'Neutral': '#4caf50'          // green
}

export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 }
  const h = hex.replace('#', '')
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
