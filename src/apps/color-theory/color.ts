export interface Hsl {
  h: number // 0–360
  s: number // 0–100
  l: number // 0–100
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const wrapHue = (h: number) => ((h % 360) + 360) % 360

export function hslToHex({ h, s, l }: Hsl): string {
  const sat = s / 100
  const lig = l / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lig - c / 2

  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToHsl(hex: string): Hsl | null {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim())
  if (!match) return null
  let raw = match[1]
  if (raw.length === 3) raw = raw.split('').map((c) => c + c).join('')

  const r = parseInt(raw.slice(0, 2), 16) / 255
  const g = parseInt(raw.slice(2, 4), 16) / 255
  const b = parseInt(raw.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
  }

  return { h: wrapHue(h), s: clamp(s * 100, 0, 100), l: clamp(l * 100, 0, 100) }
}

/** A named color-harmony scheme built by rotating the base hue. */
export interface Harmony {
  name: string
  description: string
  colors: Hsl[]
}

export function harmonies(base: Hsl): Harmony[] {
  const at = (offset: number): Hsl => ({ ...base, h: wrapHue(base.h + offset) })
  return [
    {
      name: 'Complementary',
      description: 'Opposite on the wheel — high contrast.',
      colors: [base, at(180)],
    },
    {
      name: 'Analogous',
      description: 'Neighbours — calm and cohesive.',
      colors: [at(-30), base, at(30)],
    },
    {
      name: 'Triadic',
      description: 'Evenly spaced thirds — vibrant and balanced.',
      colors: [base, at(120), at(240)],
    },
    {
      name: 'Split-complementary',
      description: 'The complement’s two neighbours — contrast, less tension.',
      colors: [base, at(150), at(210)],
    },
    {
      name: 'Tetradic',
      description: 'Two complementary pairs — rich, needs a dominant color.',
      colors: [base, at(90), at(180), at(270)],
    },
  ]
}

function ramp(base: Hsl, steps: number, fn: (t: number) => Partial<Hsl>): Hsl[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1)
    return { ...base, ...fn(t) }
  })
}

/** Tints: base mixed toward white (lightness up). */
export function tints(base: Hsl, steps = 6): Hsl[] {
  return ramp(base, steps, (t) => ({ l: base.l + (100 - base.l) * t }))
}

/** Shades: base mixed toward black (lightness down). */
export function shades(base: Hsl, steps = 6): Hsl[] {
  return ramp(base, steps, (t) => ({ l: base.l * (1 - t) }))
}

/** Tones: base mixed toward gray (saturation down). */
export function tones(base: Hsl, steps = 6): Hsl[] {
  return ramp(base, steps, (t) => ({ s: base.s * (1 - t) }))
}

export const hslString = ({ h, s, l }: Hsl) =>
  `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
