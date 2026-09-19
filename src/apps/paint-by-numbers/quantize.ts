export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Quantized {
  /** Display colors (means of original pixels per cluster), light → dark. */
  palette: Rgb[]
  /** Cluster centers in companded space, aligned to `palette` by index. */
  centroids: Rgb[]
}

function dist2(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

/**
 * Tone companding curve. An S-curve (logistic) that flattens near 0 and 255,
 * so distances at the dark and light ends shrink — clustering then stops
 * wasting palette entries on many near-black / near-white tones and spends
 * them on mid-tones instead. `reg` 0 → linear (off), 1 → strong.
 */
function toneCurve(reg: number): (v: number) => number {
  const k = reg * 9
  if (k < 0.001) return (v) => v
  const s = (x: number) => 1 / (1 + Math.exp(-k * (x - 0.5)))
  const s0 = s(0)
  const span = s(1) - s0
  return (v) => ((s(v / 255) - s0) / span) * 255
}

function seed(samples: Rgb[], k: number): Rgb[] {
  const centroids: Rgb[] = [samples[Math.floor(Math.random() * samples.length)]]
  while (centroids.length < k) {
    const dists = samples.map((s) => Math.min(...centroids.map((c) => dist2(s, c))))
    const sum = dists.reduce((a, b) => a + b, 0)
    let target = Math.random() * sum
    let idx = 0
    while (idx < dists.length - 1 && (target -= dists[idx]) > 0) idx++
    centroids.push(samples[idx])
  }
  return centroids.map((c) => ({ ...c }))
}

function nearest(pixel: Rgb, palette: Rgb[]): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const d = dist2(pixel, palette[i])
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Derive `k` colors via k-means in tone-companded space. */
export function buildPalette(data: Uint8ClampedArray, k: number, reg: number): Quantized {
  const tone = toneCurve(reg)
  const total = data.length / 4
  const stride = Math.max(1, Math.floor(total / 5000))
  const compand: Rgb[] = []
  const original: Rgb[] = []
  for (let i = 0; i < total; i += stride) {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    original.push({ r, g, b })
    compand.push({ r: tone(r), g: tone(g), b: tone(b) })
  }

  const count = Math.min(k, compand.length)
  let centroids = seed(compand, count)
  for (let iter = 0; iter < 12; iter++) {
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (const s of compand) {
      const acc = sums[nearest(s, centroids)]
      acc.r += s.r
      acc.g += s.g
      acc.b += s.b
      acc.n += 1
    }
    centroids = sums.map((a, i) =>
      a.n ? { r: a.r / a.n, g: a.g / a.n, b: a.b / a.n } : centroids[i],
    )
  }

  // Final pass: build the display palette from the original pixel colors.
  const osum = centroids.map(() => ({ r: 0, g: 0, b: 0, n: 0 }))
  for (let j = 0; j < compand.length; j++) {
    const c = nearest(compand[j], centroids)
    const acc = osum[c]
    acc.r += original[j].r
    acc.g += original[j].g
    acc.b += original[j].b
    acc.n += 1
  }

  const combined = centroids.map((centroid, i) => {
    const a = osum[i]
    const palette = a.n
      ? { r: Math.round(a.r / a.n), g: Math.round(a.g / a.n), b: Math.round(a.b / a.n) }
      : { r: Math.round(centroid.r), g: Math.round(centroid.g), b: Math.round(centroid.b) }
    return { centroid, palette }
  })
  combined.sort(
    (a, b) => b.palette.r + b.palette.g + b.palette.b - (a.palette.r + a.palette.g + a.palette.b),
  )

  return {
    palette: combined.map((c) => c.palette),
    centroids: combined.map((c) => c.centroid),
  }
}

/** Map every pixel to its nearest companded centroid. */
export function mapToIndices(
  data: Uint8ClampedArray,
  centroids: Rgb[],
  reg: number,
): Uint8Array {
  const tone = toneCurve(reg)
  const total = data.length / 4
  const indices = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    const o = i * 4
    indices[i] = nearest(
      { r: tone(data[o]), g: tone(data[o + 1]), b: tone(data[o + 2]) },
      centroids,
    )
  }
  return indices
}

export const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
